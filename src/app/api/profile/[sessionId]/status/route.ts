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

        const body = await request.json();
        const { status } = body;

        if (status === undefined) {
            return NextResponse.json({ status: false, message: "Status text is required" }, { status: 400 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            return NextResponse.json({ status: false, message: "WhatsApp instance not connected" }, { status: 503 });
        }

        // WhatsApp Baileys updates status (about info)
        await instance.socket.updateProfileStatus(status);

        return NextResponse.json({ status: true, message: "Profile status updated" });

    } catch (error: any) {
        console.error("Update profile status error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
