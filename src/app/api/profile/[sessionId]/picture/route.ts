import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ status: false, message: "Image is required" }, { status: 400 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            return NextResponse.json({ status: false, message: "WhatsApp instance not connected" }, { status: 503 });
        }

        const buffer = Buffer.from(await image.arrayBuffer());

        // WhatsApp Baileys updates profile picture
        await instance.socket.updateProfilePicture(instance.socket.user?.id || "", buffer);

        return NextResponse.json({ status: true, message: "Profile picture updated" });

    } catch (error: any) {
        console.error("Update profile picture error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            return NextResponse.json({ status: false, message: "WhatsApp instance not connected" }, { status: 503 });
        }

        // WhatsApp Baileys removes profile picture
        await instance.socket.removeProfilePicture(instance.socket.user?.id || "");

        return NextResponse.json({ status: true, message: "Profile picture removed" });

    } catch (error: any) {
        console.error("Remove profile picture error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
