import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/messages/{sessionId}/{jid}/reply
 * Reply to a message with messageId provided in the request body
 * Uses same request format as /send: { message, mentions }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid: rawJid } = await params;
        const jid = decodeURIComponent(rawJid);

        const body = await request.json();
        const { messageId, message, mentions, fromMe } = body;

        if (!messageId) {
            return NextResponse.json({ status: false, message: "messageId is required", error: "messageId is required" }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ status: false, message: "message is required", error: "message is required" }, { status: 400 });
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

        // Construct the quoted message key
        const quotedMsgKey: any = {
            remoteJid: jid,
            fromMe: false, // Default fallback, overridden by DB
            id: messageId
        };

        let quotedMessageContent: any = { extendedTextMessage: { text: "" } }; // Default fallback
        let resolvedParticipant: string | undefined = undefined;
        let originalMsgTimestamp: number | undefined = undefined;
        let originalMsgPushName: string | undefined = undefined;

        try {
            // First resolve the user-friendly sessionId to the db session CUID
            const sessionData = await prisma.session.findUnique({
                where: { sessionId: sessionId },
                select: { id: true }
            });
            const dbSessionId = sessionData?.id;

            let originalMsg = null;
            if (dbSessionId) {
                // Always fetch original message to build a proper quoted context for WA Web
                originalMsg = await prisma.message.findUnique({
                    where: {
                        sessionId_keyId: {
                            sessionId: dbSessionId,
                            keyId: messageId
                        }
                    }
                });
            }

            if (originalMsg && dbSessionId) {
                // CRITICAL: WA Web drops the quote if fromMe does not match the actual sender
                quotedMsgKey.fromMe = originalMsg.fromMe;

                if (originalMsg.timestamp) {
                    originalMsgTimestamp = Math.floor(new Date(originalMsg.timestamp).getTime() / 1000);
                }
                if (originalMsg.pushName) {
                    originalMsgPushName = originalMsg.pushName;
                }
                // WA Web requires participant field for group chats
                if (jid.endsWith("@g.us") && originalMsg.senderJid) {
                    resolvedParticipant = originalMsg.senderJid;

                    // Attempt to resolve @lid to @s.whatsapp.net (Standard WA Phone Number)
                    // WA Web often fails to render quotes if the participant is purely a Linked Device ID
                    if (resolvedParticipant.includes("@lid")) {
                        const contact = await prisma.contact.findUnique({
                            where: {
                                sessionId_jid: { sessionId: dbSessionId, jid: resolvedParticipant }
                            },
                            select: { remoteJidAlt: true }
                        });

                        // Use the real phone number JID if available
                        if (contact?.remoteJidAlt) {
                            resolvedParticipant = contact.remoteJidAlt;
                        }
                    }

                    quotedMsgKey.participant = resolvedParticipant;
                }

                // Mock the quoted message content based on DB so WA Web displays the snippet
                switch (originalMsg.type) {
                    case 'TEXT':
                        quotedMessageContent = { extendedTextMessage: { text: originalMsg.content || "" } };
                        break;
                    case 'IMAGE':
                        quotedMessageContent = { imageMessage: { caption: originalMsg.content || "" } };
                        break;
                    case 'VIDEO':
                        quotedMessageContent = { videoMessage: { caption: originalMsg.content || "" } };
                        break;
                    case 'DOCUMENT':
                        quotedMessageContent = { documentMessage: { fileName: originalMsg.content || "Document" } };
                        break;
                    case 'AUDIO':
                        quotedMessageContent = { audioMessage: {} };
                        break;
                    case 'STICKER':
                        quotedMessageContent = { stickerMessage: {} };
                        break;
                    case 'CONTACT':
                        quotedMessageContent = { contactMessage: { displayName: originalMsg.content || "" } };
                        break;
                    case 'LOCATION':
                        quotedMessageContent = { locationMessage: {} };
                        break;
                }
            }
        } catch (dbError) {
            console.warn("Could not fetch original message for quoted reply context:", dbError);
        }

        const quotedMsg = {
            key: quotedMsgKey,
            message: quotedMessageContent,
            participant: resolvedParticipant,
            messageTimestamp: originalMsgTimestamp,
            pushName: originalMsgPushName
        };

        // Process message payload (same as /send)
        let msgPayload = message;

        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        // Send the reply with quoted reference
        await instance.socket.sendMessage(jid, msgPayload, {
            quoted: quotedMsg as any
        });

        return NextResponse.json({ status: true, message: "Message sent successfully" });

    } catch (error) {
        console.error("Reply message error:", error);
        return NextResponse.json({ status: false, message: "Failed to send reply", error: "Failed to send reply" }, { status: 500 });
    }
}
