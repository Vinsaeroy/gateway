import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Accept group invite using invite code
/**
 * @deprecated This endpoint is deprecated. Use POST /api/groups/{sessionId}/invite/accept instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(
    request: NextRequest
) {
    console.warn('[DEPRECATED] POST /api/groups/invite/accept is deprecated. Use POST /api/groups/{sessionId}/invite/accept instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, inviteCode } = body;

        if (!sessionId || !inviteCode) {
            return NextResponse.json({ status: false, message: "sessionId and inviteCode are required", error: "sessionId and inviteCode are required" }, { status: 400 });
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

        // Accept group invite
        const result = await instance.socket.groupAcceptInvite(inviteCode);

        return NextResponse.json({ status: true, message: "Group invite accepted successfully", data: { groupJid: result } });

    } catch (error: any) {
        console.error("Accept group invite error:", error);
        
        if (error.message?.includes("invalid") || error.message?.includes("expired")) {
            return NextResponse.json({ status: false, message: "Invalid or expired invite code", error: "Invalid or expired invite code" }, { status: 400 });
        }
        
        return NextResponse.json({ status: false, message: "Failed to accept group invite", error: "Failed to accept group invite" }, { status: 500 });
    }
}
