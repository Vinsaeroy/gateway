import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import Sticker from "wa-sticker-formatter";

// POST: Send sticker from image
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const formData = await request.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
             return NextResponse.json({ status: false, message: "file is required", error: "file is required" }, { status: 400 });
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

        const decodedJid = decodeURIComponent(jid);

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const pack = formData.get("pack") as string || "WA-AKG";
        const author = formData.get("author") as string || user.name || "User";
        const type = (formData.get("type") as string) || "full";
        const quality = parseInt(formData.get("quality") as string) || 50;

        // Create Sticker
        const sticker = new Sticker(buffer, {
            pack,
            author,
            type: type as any,
            categories: ["🤩", "🎉"] as any,
            quality,
            background: "transparent"
        });

        const stickerBuffer = await sticker.toBuffer();

        await instance.socket.sendMessage(decodedJid, { sticker: stickerBuffer });

        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (e) {
        console.error("Sticker error", e);
        return NextResponse.json({ status: false, message: "Failed to create sticker", error: "Failed to create sticker" }, { status: 500 });
    }
}
