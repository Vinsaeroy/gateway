import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use PUT/DELETE /api/profile/{sessionId}/picture instead.
 * This endpoint will be removed in a future version.
 */
// PUT: Update profile picture
export async function PUT(request: NextRequest) {
    console.warn('[DEPRECATED] PUT /api/profile/picture is deprecated. Use PUT /api/profile/{sessionId}/picture instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const sessionId = formData.get("sessionId") as string;
        const file = formData.get("file") as File;

        if (!sessionId || !file) {
            return NextResponse.json({ status: false, message: "sessionId and file are required", error: "sessionId and file are required" }, { status: 400 });
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

        // Get own JID
        const meJid = instance.socket.user?.id;
        if (!meJid) {
            return NextResponse.json({ status: false, message: "Unable to get own JID", error: "Unable to get own JID" }, { status: 500 });
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Update profile picture
        await instance.socket.updateProfilePicture(meJid, buffer);

        return NextResponse.json({ status: true, message: "Profile picture updated successfully" });

    } catch (error) {
        console.error("Update profile picture error:", error);
        return NextResponse.json({ status: false, message: "Failed to update profile picture", error: "Failed to update profile picture" }, { status: 500 });
    }
}

// DELETE: Remove profile picture
export async function DELETE(request: NextRequest) {
    console.warn('[DEPRECATED] DELETE /api/profile/picture is deprecated. Use DELETE /api/profile/{sessionId}/picture instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ status: false, message: "sessionId is required", error: "sessionId is required" }, { status: 400 });
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

        // Get own JID
        const meJid = instance.socket.user?.id;
        if (!meJid) {
            return NextResponse.json({ status: false, message: "Unable to get own JID", error: "Unable to get own JID" }, { status: 500 });
        }

        // Remove profile picture
        await instance.socket.removeProfilePicture(meJid);

        return NextResponse.json({ status: true, message: "Profile picture removed successfully" });

    } catch (error) {
        console.error("Remove profile picture error:", error);
        return NextResponse.json({ status: false, message: "Failed to remove profile picture", error: "Failed to remove profile picture" }, { status: 500 });
    }
}
