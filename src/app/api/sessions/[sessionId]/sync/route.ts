import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";
import { syncGroups } from "@/modules/whatsapp/store/groups";

/**
 * Force a full sync of groups, contacts, and newsletter/channel metadata for the
 * active WhatsApp session. Useful when the user has just joined a new group or
 * followed a new channel and the realtime upsert event didn't fire (e.g. the
 * action happened on their phone while the gateway was offline).
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not connected", error: "Session not connected" }, { status: 503 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });
        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        const summary: { groups: number; channels: number; chats: number; errors: string[] } = {
            groups: 0,
            channels: 0,
            chats: 0,
            errors: [],
        };

        // 1. Sync groups + communities from WhatsApp
        try {
            await syncGroups(instance.socket, sessionId);
            const count = await prisma.group.count({ where: { sessionId: session.id } });
            summary.groups = count;
        } catch (e: any) {
            summary.errors.push(`groups: ${e?.message || String(e)}`);
        }

        // 2. Refresh newsletter/channel names for any DB rows missing them
        try {
            // Find newsletter contacts without a name
            const namelessNewsletters = await prisma.contact.findMany({
                where: {
                    sessionId: session.id,
                    jid: { endsWith: "@newsletter" },
                    OR: [
                        { name: null },
                        { name: "" },
                    ],
                },
                select: { jid: true },
                take: 50,
            });

            for (const c of namelessNewsletters) {
                try {
                    const metadata: any = await instance.socket.newsletterMetadata("jid", c.jid);
                    const name = metadata?.name || metadata?.metadata?.name || metadata?.subject;
                    if (name) {
                        await prisma.contact.update({
                            where: { sessionId_jid: { sessionId: session.id, jid: c.jid } },
                            data: { name, notify: name },
                        });
                        summary.channels++;
                    }
                } catch {
                    // Per-channel errors are non-fatal
                }
            }
        } catch (e: any) {
            summary.errors.push(`channels: ${e?.message || String(e)}`);
        }

        // 3. Count active chats for response
        try {
            summary.chats = await prisma.contact.count({ where: { sessionId: session.id } });
        } catch {
            // ignore
        }

        return NextResponse.json({
            status: true,
            message: "Sync completed",
            data: summary,
        });
    } catch (error) {
        console.error("Manual session sync error:", error);
        return NextResponse.json({ status: false, message: "Sync failed", error: "Sync failed" }, { status: 500 });
    }
}
