import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// GET: Get group details
export async function GET(
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

        // Check verification
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
             return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
             return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Fetch Group Metadata
        let metadata;
        try {
            metadata = await instance.socket.groupMetadata(decodedJid);
        } catch (e) {
            console.error("Failed to fetch group metadata:", e);
             return NextResponse.json({ status: false, message: "Failed to fetch group metadata. Ensure the bot is in the group.", error: "Failed to fetch group metadata. Ensure the bot is in the group." }, { status: 404 });
        }

        // Fetch Profile Picture
        let ppUrl = null;
        try {
            ppUrl = await instance.socket.profilePictureUrl(decodedJid, 'image');
        } catch (e) {
            // Ignore error if no PP
        }

        return NextResponse.json({
            ...metadata,
            pictureUrl: ppUrl
        });

    } catch (error) {
        console.error("Get group details error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}
