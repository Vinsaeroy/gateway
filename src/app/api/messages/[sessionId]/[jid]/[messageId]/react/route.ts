import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send reaction to message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string; messageId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid, messageId } = await params;
        const body = await request.json();
        const { emoji } = body;

        // Emoji empty string is valid (removes reaction)
        if (emoji === undefined) {
            return NextResponse.json({ status: false, message: "emoji is required", error: "emoji is required" }, { status: 400 });
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

        const decodedJid = decodeURIComponent(jid);

        // Send reaction (empty string removes reaction)
        // Note: fromMe is hardcoded to false as per previous implementation
        await instance.socket.sendMessage(decodedJid, {
            react: {
                text: emoji,
                key: {
                    remoteJid: decodedJid,
                    fromMe: false,
                    id: messageId
                }
            }
        });

        return NextResponse.json({ 
            success: true,
            message: emoji ? "Reaction sent" : "Reaction removed"
        });

    } catch (error) {
        console.error("Send reaction error:", error);
        return NextResponse.json({ status: false, message: "Failed to send reaction", error: "Failed to send reaction" }, { status: 500 });
    }
}
