import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { canAccessSession } from "@/lib/api-auth";
import { enforceApiQuota } from "@/lib/rate-limit";
import Sticker from "wa-sticker-formatter";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/chat/{sessionId}/send instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    try {
        const gate = await enforceApiQuota(request);
        if (gate.error) return gate.error;
        const { user } = gate;

        const body = await request.json();
        const { sessionId, jid, message, mentions } = body;

        // Log deprecation warning
        console.warn('[DEPRECATED] POST /api/chat/send is deprecated. Use POST /api/messages/[sessionId]/[jid]/send instead.');

        if (!sessionId || !jid || !message) {
            return NextResponse.json({ status: false, message: "Invalid payload", error: "sessionId, jid, and message are required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found or disconnected" }, { status: 404 });
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

            // SSRF Protection: Only allow http/https and block internal IPs
            try {
                const parsedUrl = new URL(url);
                if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                    return NextResponse.json({ status: false, message: "Invalid sticker URL protocol", error: "Only http/https URLs allowed" }, { status: 400 });
                }
                const hostname = parsedUrl.hostname;
                if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
                    return NextResponse.json({ status: false, message: "Invalid sticker URL", error: "Internal URLs not allowed" }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ status: false, message: "Invalid sticker URL", error: "Invalid URL format" }, { status: 400 });
            }

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch sticker media: ${res.statusText}`);
                const buffer = await res.arrayBuffer();

                const sticker = new Sticker(Buffer.from(buffer), {
                    pack: msgPayload.sticker.pack || process.env.APP_NAME || "Sticker",
                    author: msgPayload.sticker.author || process.env.APP_NAME || "Sticker",
                    type: "full",
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                msgPayload = { sticker: stickerBuffer };

            } catch (e) {
                console.error("Sticker generation from URL failed:", e);
                return NextResponse.json({ status: false, message: "Failed to generate sticker", error: "Failed to generate sticker from URL" }, { status: 400 });
            }
        }

        // Send Message
        // Ensure mentions are passed in options and also in message content if it's a text message
        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        await socket.sendMessage(jid, msgPayload, { mentions: mentions || [] } as any);

        return NextResponse.json({ status: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ status: false, message: "Failed to send message", error: "Failed to send message" }, { status: 500 });
    }
}
