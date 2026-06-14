import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { canAccessSession } from "@/lib/api-auth";
import { enforceApiQuota } from "@/lib/rate-limit";
import Sticker from "wa-sticker-formatter";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/{jid}/sticker instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/sticker is deprecated. Use POST /api/messages/{sessionId}/{jid}/sticker instead.');
    try {
        const gate = await enforceApiQuota(request);
        if (gate.error) return gate.error;
        const { user } = gate;

        const formData = await request.formData();
        const sessionId = formData.get("sessionId") as string;
        const jid = formData.get("jid") as string;
        const file = formData.get("file") as File;
        
        if (!sessionId || !jid || !file) {
             return NextResponse.json({ status: false, message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
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

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create Sticker
        const sticker = new Sticker(buffer, {
            pack: process.env.APP_NAME || "Sticker",
            author: user.name || process.env.APP_NAME || "Sticker",
            type: "full",
            categories: ["🤩", "🎉"] as any,
            quality: 50,
            background: "transparent"
        });

        const stickerBuffer = await sticker.toBuffer();

        await instance.socket.sendMessage(jid, { sticker: stickerBuffer });

        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (e) {
        console.error("Sticker error", e);
        return NextResponse.json({ status: false, message: "Failed to create sticker", error: "Failed to create sticker" }, { status: 500 });
    }
}
