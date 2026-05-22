import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update group description
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
        const { description } = body;

        // Description can be empty string to remove
        if (description && description.length > 512) {
            return NextResponse.json({ status: false, message: "Description must be 512 characters or less", error: "Description must be 512 characters or less" }, { status: 400 });
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

        // Update group description
        await instance.socket.groupUpdateDescription(decodedJid, description || "");

        return NextResponse.json({ 
            success: true, 
            message: description ? "Group description updated successfully" : "Group description removed",
            description: description || null
        });

    } catch (error: any) {
        console.error("Update group description error:", error);
        
        // Handle specific errors
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ status: false, message: "Bot must be admin to update group description", error: "Bot must be admin to update group description" }, { status: 403 });
        }
        
        return NextResponse.json({ status: false, message: "Failed to update group description", error: "Failed to update group description" }, { status: 500 });
    }
}
