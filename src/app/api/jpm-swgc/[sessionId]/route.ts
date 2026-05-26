import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";
import { generateWAMessageContent } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

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

        // Build innerContent based on media type
        const sock = instance.socket;
        let innerContent: any;

        if (mediaType === "image" || mediaType === "video") {
            // Resolve media buffer
            let buffer: Buffer;
            try {
                if (mediaUrl.startsWith("/api/media/")) {
                    const fs = require("fs");
                    const path = require("path");
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

        // Resolve group list
        let groupIds: string[];
        if (scope === "SPECIFIC") {
            groupIds = targets.filter((t) => t.endsWith("@g.us"));
        } else {
            const groups = await sock.groupFetchAllParticipating();
            groupIds = Object.keys(groups || {});
        }

        // Send asynchronously and return immediately with a job id-like response.
        // We don't await the loop because some sessions have hundreds of groups
        // and the request would time out.
        const startedAt = new Date().toISOString();
        let sent = 0;
        let skipped = 0;
        let failed = 0;

        // Fire-and-forget loop — caller polls /api/jpm-swgc/.../status if desired.
        // For simplicity we just track via logs.
        (async () => {
            for (const gid of groupIds) {
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

// Avoid Prisma import lint warning when not used
void prisma;
