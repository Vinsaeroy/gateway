import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Mute or unmute a chat
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
        const { mute, duration } = body;

        if (mute === undefined) {
            return NextResponse.json({ status: false, message: "mute (boolean) is required", error: "mute (boolean) is required" }, { status: 400 });
        }
        
        const decodedJid = decodeURIComponent(jid);

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Calculate mute duration
        // duration in seconds, null/0 = unmute, -1 = mute forever
        let muteEndTime: number | null = null;
        
        if (mute) {
            if (duration && duration > 0) {
                // Mute for specific duration
                muteEndTime = Date.now() + (duration * 1000);
            } else {
                // Mute forever (8 hours from now as default, or use very large number)
                muteEndTime = Date.now() + (8 * 60 * 60 * 1000);
            }
        }

        // Mute or unmute chat
        await instance.socket.chatModify(
            { 
                mute: mute ? muteEndTime : null,
                lastMessages: []
            },
            decodedJid
        );

        return NextResponse.json({ 
            success: true,
            message: mute ? "Chat muted successfully" : "Chat unmuted successfully"
        });

    } catch (error) {
        console.error("Mute chat error:", error);
        return NextResponse.json({ status: false, message: "Failed to mute/unmute chat", error: "Failed to mute/unmute chat" }, { status: 500 });
    }
}
