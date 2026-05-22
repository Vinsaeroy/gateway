import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * POST /api/messages/{sessionId}/{jid}/{messageId}/star
 * Star or unstar a specific message
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string; messageId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid: rawJid, messageId } = await params;
        const jid = decodeURIComponent(rawJid);

        const body = await request.json();
        const { star = true, fromMe = false } = body;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Star/unstar the message
        await (instance.socket as any).chatModify({
            star: {
                messages: [{ id: messageId, fromMe }],
                star
            }
        }, jid);

        return NextResponse.json({
            success: true,
            message: star ? "Message starred" : "Message unstarred"
        });

    } catch (error) {
        console.error("Star message error:", error);
        return NextResponse.json({ status: false, message: "Failed to star/unstar message", error: "Failed to star/unstar message" }, { status: 500 });
    }
}
