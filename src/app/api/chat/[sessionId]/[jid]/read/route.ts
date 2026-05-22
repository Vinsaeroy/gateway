import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Mark messages as read
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const body = await request.json();
        const { messageIds } = body;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Decode JID from URL parameter
        const decodedJid = decodeURIComponent(jid);

        // If specific message IDs provided, mark those as read
        // Otherwise, mark entire chat as read
        if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
            for (const messageId of messageIds) {
                await instance.socket.readMessages([{
                    remoteJid: decodedJid,
                    id: messageId,
                    participant: undefined
                }]);
            }
        } else {
            // Mark all messages in chat as read
            // Note: lastMessages is required by Baileys but can be empty array
            await instance.socket.chatModify(
                { markRead: true, lastMessages: [] },
                decodedJid
            );
        }

        return NextResponse.json({ status: true, message: "Messages marked as read" });

    } catch (error) {
        console.error("Mark as read error:", error);
        return NextResponse.json({ status: false, message: "Failed to mark messages as read", error: "Failed to mark messages as read" }, { status: 500 });
    }
}
