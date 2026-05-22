import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update group members (add, remove, promote, demote)
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
        const decodedJid = decodeURIComponent(jid);
        const body = await request.json();
        const { action, participants } = body;

        if (!action || !participants || !Array.isArray(participants)) {
            return NextResponse.json({ status: false, message: "action and participants (array) are required", error: "action and participants (array) are required" }, { status: 400 });
        }

        const validActions = ['add', 'remove', 'promote', 'demote'];
        if (!validActions.includes(action)) {
            return NextResponse.json({ 
                error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
            }, { status: 400 });
        }

        if (participants.length === 0) {
            return NextResponse.json({ status: false, message: "Participants array cannot be empty", error: "Participants array cannot be empty" }, { status: 400 });
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

        // Execute the action
        const result = await instance.socket.groupParticipantsUpdate(
            decodedJid,
            participants,
            action as any
        );

        return NextResponse.json({ 
            success: true,
            message: `Successfully ${action}ed participants`,
            result
        });

    } catch (error: any) {
        console.error("Update group members error:", error);
        
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ status: false, message: "Bot must be admin to update group members", error: "Bot must be admin to update group members" }, { status: 403 });
        }
        
        if (error.message?.includes("not-authorized")) {
            return NextResponse.json({ status: false, message: "Not authorized to perform this action", error: "Not authorized to perform this action" }, { status: 403 });
        }
        
        return NextResponse.json({ status: false, message: "Failed to update group members", error: "Failed to update group members" }, { status: 500 });
    }
}
