import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { proto } from "@whiskeysockets/baileys";

// POST: Forward message to other chats
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
        const body = await request.json();
        const { fromJid, messageId, toJids } = body;

        if (!fromJid || !messageId || !toJids || !Array.isArray(toJids)) {
             return NextResponse.json({ status: false, message: "fromJid, messageId, and toJids (array) are required", error: "fromJid, messageId, and toJids (array) are required" }, { status: 400 });
        }
        
        if (toJids.length === 0) {
            return NextResponse.json({ status: false, message: "At least one recipient is required", error: "At least one recipient is required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

         // Forward message to each recipient
        for (const toJid of toJids) {
            await instance.socket.sendMessage(toJid, {
                forward: {
                    key: {
                        remoteJid: fromJid,
                        fromMe: false,
                        id: messageId
                    },
                    message: {} as proto.IMessage
                }
            });
        }

        return NextResponse.json({ status: true, message: `Message forwarded to ${toJids.length} recipient(s)` });

    } catch (error) {
        console.error("Forward message error:", error);
        return NextResponse.json({ status: false, message: "Failed to forward message", error: "Failed to forward message" }, { status: 500 });
    }
}
