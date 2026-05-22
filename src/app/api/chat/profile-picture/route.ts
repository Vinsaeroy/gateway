import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/chat/{sessionId}/{jid}/profile-picture instead.
 * This endpoint will be removed in a future version.
 */
// POST: Fetch profile picture URL for a JID
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/chat/profile-picture is deprecated. Use POST /api/chat/{sessionId}/{jid}/profile-picture instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid } = body;

        if (!sessionId || !jid) {
            return NextResponse.json({ status: false, message: "sessionId and jid are required", error: "sessionId and jid are required" }, { status: 400 });
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

        // Fetch profile picture
        try {
            const profilePicUrl = await instance.socket.profilePictureUrl(jid, 'image');
            
            return NextResponse.json({ 
                success: true,
                jid,
                profilePicUrl
            });
        } catch (error: any) {
            // If no profile picture exists
            if (error.message?.includes('404') || error.message?.includes('not-found')) {
                return NextResponse.json({ 
                    success: true,
                    jid,
                    profilePicUrl: null,
                    message: "No profile picture found"
                });
            }
            throw error;
        }

    } catch (error) {
        console.error("Fetch profile picture error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch profile picture", error: "Failed to fetch profile picture" }, { status: 500 });
    }
}
