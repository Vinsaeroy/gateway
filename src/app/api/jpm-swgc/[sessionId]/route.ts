import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { enforceApiQuota } from "@/lib/rate-limit";
import { waManager } from "@/modules/whatsapp/manager";
import { generateWAMessageContent } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Track in-flight JPM-SWGC dispatches per session so back-to-back clicks
// or duplicate API calls don't cause the same status to land in a group twice.
// Stored on globalThis to survive Next.js hot-reload / module re-evaluation.
const globalForJpm = globalThis as unknown as {
    __jpmActiveDispatches: Map<string, { startedAt: number; total: number }>;
};
const activeDispatches = globalForJpm.__jpmActiveDispatches ||= new Map();

// Hard cap: any dispatch that's been running for >30 minutes is considered stale
// (almost certainly the request handler died) and gets cleared on the next call.
const STALE_AFTER_MS = 30 * 60 * 1000;

/**
 * JPM SWGC — Bulk Status Group Channel
 *
 * Sends a "group status" (groupStatusMessageV2) to every participating group
 * (or a specific subset). Uses Baileys `relayMessage` with the
 * `groupStatusMessageV2` envelope.
 *
 * Body:
 *   - text:       string (optional) — caption / status text
 *   - mediaUrl:   string (optional) — http(s) URL or /api/media/<file>
 *   - mediaType:  "image" | "video" | "text" (auto-derived if omitted)
 *   - delayMs:    number (optional) — delay between groups, default 1000
 *   - scope:      "ALL" | "SPECIFIC" (default ALL)
 *   - targets:    string[] — list of group JIDs when scope=SPECIFIC
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const gate = await enforceApiQuota(request);
        if (gate.error) return gate.error;
        const { user } = gate;

        const { sessionId } = await params;

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not connected" }, { status: 503 });
        }

        const body = await request.json();
        const text: string = (body.text || "").toString();
        const mediaUrl: string = (body.mediaUrl || "").toString();
        const mediaType: "image" | "video" | "text" = body.mediaType || (mediaUrl ? "image" : "text");
        const delayMs = Math.max(0, Math.min(60_000, Number(body.delayMs) || 1000));
        const scope: "ALL" | "SPECIFIC" = body.scope === "SPECIFIC" ? "SPECIFIC" : "ALL";
        const targets: string[] = Array.isArray(body.targets) ? body.targets.filter((t: any) => typeof t === "string") : [];

        if (!text && !mediaUrl) {
            return NextResponse.json({ status: false, message: "Provide text or mediaUrl" }, { status: 400 });
        }

        if (scope === "SPECIFIC" && targets.length === 0) {
            return NextResponse.json({ status: false, message: "Pick at least one target group" }, { status: 400 });
        }

        // Block parallel dispatches for the same session — protects against
        // double-click and accidental duplicate sends to the same group.
        // Auto-clear stale locks (e.g. server crashed mid-dispatch).
        const inflight = activeDispatches.get(sessionId);
        if (inflight) {
            const ageMs = Date.now() - inflight.startedAt;
            if (ageMs > STALE_AFTER_MS) {
                logger.warn("JPM-SWGC", `Clearing stale lock for ${sessionId} (age ${Math.round(ageMs / 1000)}s)`);
                activeDispatches.delete(sessionId);
            } else {
                return NextResponse.json(
                    {
                        status: false,
                        message: `A JPM-SWGC dispatch is already running for this session (${inflight.total} groups, started ${Math.round(ageMs / 1000)}s ago). Wait for it to finish.`,
                    },
                    { status: 409 }
                );
            }
        }

        // Build innerContent based on media type
        const sock = instance.socket;
        let innerContent: any;

        if (mediaType === "image" || mediaType === "video") {
            // Resolve media buffer
            let buffer: Buffer;
            try {
                if (mediaUrl.startsWith("/api/media/")) {
                    const filename = mediaUrl.replace("/api/media/", "");
                    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
                        return NextResponse.json({ status: false, message: "Invalid media filename" }, { status: 400 });
                    }
                    const filePath = path.join(process.cwd(), "data", "media", filename);
                    if (!fs.existsSync(filePath)) {
                        return NextResponse.json({ status: false, message: "Media file not found" }, { status: 404 });
                    }
                    buffer = fs.readFileSync(filePath);
                } else {
                    // External URL
                    const res = await fetch(mediaUrl);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    buffer = Buffer.from(await res.arrayBuffer());
                }
            } catch (e: any) {
                return NextResponse.json({ status: false, message: `Failed to load media: ${e?.message || "unknown"}` }, { status: 400 });
            }

            const payload: any = mediaType === "video"
                ? { video: buffer, caption: text }
                : { image: buffer, caption: text };

            innerContent = await generateWAMessageContent(payload, {
                upload: (sock as any).waUploadToServer,
            });
        } else {
            innerContent = await generateWAMessageContent({ text }, {} as any);
        }

        if (!innerContent) {
            return NextResponse.json({ status: false, message: "Failed to build content" }, { status: 500 });
        }

        // Resolve group list (deduplicate just in case caller sent dupes)
        let groupIds: string[];
        if (scope === "SPECIFIC") {
            groupIds = Array.from(new Set(targets.filter((t) => t.endsWith("@g.us"))));
        } else {
            const groups = await sock.groupFetchAllParticipating();
            groupIds = Array.from(new Set(Object.keys(groups || {})));
        }

        if (groupIds.length === 0) {
            return NextResponse.json({ status: false, message: "No valid target groups" }, { status: 400 });
        }

        // Mark this session as busy so duplicate POSTs are rejected with 409
        activeDispatches.set(sessionId, {
            startedAt: Date.now(),
            total: groupIds.length,
        });

        // Send asynchronously and return immediately with a job id-like response.
        const startedAt = new Date().toISOString();
        let sent = 0;
        let skipped = 0;
        let failed = 0;

        // Fire-and-forget loop — caller polls /api/jpm-swgc/.../status if desired.
        (async () => {
            // Track JIDs already sent in this dispatch as a final guard
            const sentToJids = new Set<string>();
            try {
                for (const gid of groupIds) {
                    if (sentToJids.has(gid)) {
                        skipped++;
                        continue;
                    }
                    sentToJids.add(gid);
                    try {
                        const envelope: any = {
                            groupStatusMessageV2: {
                                message: innerContent,
                            },
                        };
                        await (sock as any).relayMessage(gid, envelope, {});
                        sent++;
                        if (delayMs) await sleep(delayMs);
                    } catch (e) {
                        failed++;
                        logger.debug("JPM-SWGC", `Failed to send to ${gid}`, e);
                    }
                }
                logger.info(
                    "JPM-SWGC",
                    `Done for ${sessionId}: sent=${sent}, skipped=${skipped}, failed=${failed}, total=${groupIds.length}`
                );
            } finally {
                activeDispatches.delete(sessionId);
            }
        })();

        return NextResponse.json({
            status: true,
            message: "JPM SWGC dispatch started",
            data: {
                total: groupIds.length,
                startedAt,
                scope,
                delayMs,
            },
        });
    } catch (error: any) {
        console.error("JPM SWGC error:", error);
        return NextResponse.json(
            { status: false, message: "Failed to start JPM SWGC", error: "Failed to start JPM SWGC" },
            { status: 500 }
        );
    }
}

/**
 * GET — check current dispatch status for this session.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const { sessionId } = await params;
    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    const inflight = activeDispatches.get(sessionId);
    return NextResponse.json({
        status: true,
        data: {
            running: !!inflight,
            startedAt: inflight ? new Date(inflight.startedAt).toISOString() : null,
            total: inflight?.total || 0,
        },
    });
}

/**
 * DELETE — manually clear a stale lock if a previous dispatch crashed.
 * Useful when the user is sure no dispatch is actually running but the
 * server still rejects with 409.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const { sessionId } = await params;
    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    const cleared = activeDispatches.delete(sessionId);
    return NextResponse.json({
        status: true,
        message: cleared ? "Lock cleared" : "No active dispatch",
    });
}

// Avoid Prisma import lint warning when not used
void prisma;
