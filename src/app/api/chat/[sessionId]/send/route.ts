import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import Sticker from "wa-sticker-formatter";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    console.warn('[DEPRECATED] POST /api/chat/[sessionId]/send is deprecated. Use POST /api/messages/[sessionId]/[jid]/send instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const body = await request.json();
        const { jid, message, mentions } = body;

        if (!jid || !message) {
            return NextResponse.json({ status: false, message: "jid and message are required", error: "jid and message are required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance) {
            return NextResponse.json({ status: false, message: "Session not found or disconnected", error: "Session not found or disconnected" }, { status: 404 });
        }

        const socket = instance.socket;
        if (!socket) {
             return NextResponse.json({ status: false, message: "Socket not ready", error: "Socket not ready" }, { status: 503 });
        }

        // Process Message
        let msgPayload = message;

        // Custom Handler for Sticker URL
        if (msgPayload.sticker && (msgPayload.sticker.url || typeof msgPayload.sticker === 'string')) {
            const url = msgPayload.sticker.url || msgPayload.sticker;
            
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch sticker media: ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                
                const sticker = new Sticker(Buffer.from(buffer), {
                    pack: msgPayload.sticker.pack || "WA-AKG Bot",
                    author: msgPayload.sticker.author || "WA-AKG",
                    type: "full",
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                msgPayload = { sticker: stickerBuffer };

            } catch (e) {
                console.error("Sticker generation from URL failed:", e);
                return NextResponse.json({ error: `Failed to generate sticker from URL: ${(e as any).message}` }, { status: 400 });
            }
        }

        // Send Message
        // Ensure mentions are passed in options and also in message content if it's a text message
        if (msgPayload.text && mentions && Array.isArray(mentions)) {
             msgPayload.mentions = mentions;
        }

        await socket.sendMessage(jid, msgPayload, { mentions: mentions || [] } as any);

        return NextResponse.json({ status: true, message: "Operation successful" });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ status: false, message: "Failed to send message", error: "Failed to send message" }, { status: 500 });
    }
}
