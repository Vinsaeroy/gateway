import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/chat/{sessionId}/{jid}/presence instead.
 * This endpoint will be removed in a future version.
 */
// POST: Send presence (typing, recording, online)
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/chat/presence is deprecated. Use POST /api/chat/{sessionId}/{jid}/presence instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, presence } = body;

        if (!sessionId || !jid || !presence) {
            return NextResponse.json({ status: false, message: "sessionId, jid, and presence are required", error: "sessionId, jid, and presence are required" }, { status: 400 });
        }

        const validPresences = ['composing', 'recording', 'paused', 'available', 'unavailable'];
        if (!validPresences.includes(presence)) {
            return NextResponse.json({ 
                error: `Invalid presence. Must be one of: ${validPresences.join(', ')}` 
            }, { status: 400 });
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

        // Send presence update
        await instance.socket.sendPresenceUpdate(presence as any, jid);

        return NextResponse.json({ status: true, message: `Presence '${presence}' sent to ${jid}` });

    } catch (error) {
        console.error("Send presence error:", error);
        return NextResponse.json({ status: false, message: "Failed to send presence", error: "Failed to send presence" }, { status: 500 });
    }
}
