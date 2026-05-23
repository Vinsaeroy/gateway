import { prisma } from "./prisma";
import crypto from "crypto";
import { normalizeMessageContent, downloadMediaMessage, WAMessage } from "@whiskeysockets/baileys";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pino from "pino";
import { resolveToPhoneJidBySessionId as resolveToPhoneJid, isLidJid } from "./jid-utils";
import { logger } from "./logger";

// Event types that can trigger webhooks
export type WebhookEventType =
    | "message.received"
    | "message.sent"
    | "message.status"
    | "connection.update"
    | "group.update"
    | "contact.update"
    | "status.update"
    | "group.participant"
    | "message.deleted"
    | "message.edited";

interface WebhookPayload {
    event: WebhookEventType;
    sessionId: string;
    timestamp: string;
    data: any;
}

/**
 * Dispatch webhook to all matching endpoints
 */
export async function dispatchWebhook(
    sessionId: string,
    event: WebhookEventType,
    data: any
) {
    try {
        // Get the session to find the userId
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true, userId: true }
        });

        if (!session) {
            logger.warn("Webhook", `Dispatch: Session ${sessionId} not found`);
            return;
        }

        // Find all active webhooks for this user/session and anyone having shared access
        const accesses = await prisma.sessionAccess.findMany({
            where: { sessionId: session.id },
            select: { userId: true }
        });
        
        const userIds = [session.userId, ...accesses.map(a => a.userId)];

        const webhooks = await prisma.webhook.findMany({
            where: {
                userId: { in: userIds },
                isActive: true,
                OR: [
                    { sessionId: null }, // Global webhooks
                    { sessionId: session.id } // Session-specific webhooks
                ]
            }
        });

        if (webhooks.length === 0) return;

        const payload: WebhookPayload = {
            event,
            sessionId,
            timestamp: new Date().toISOString(),
            data: normalizePayloadData(event, data) // Normalize data before sending
        };

        // Dispatch to all matching webhooks
        for (const webhook of webhooks) {
            // Check if this webhook subscribes to this event
            const events = (webhook.events as string[]) || [];
            if (!events.includes(event) && !events.includes("*")) {
                continue;
            }

            // Send webhook in background
            sendWebhookRequest(webhook.url, payload, webhook.secret).catch(err => {
                logger.error("Webhook", `Webhook ${webhook.id} failed:`, err);
            });
        }
    } catch (error) {
        logger.error("Webhook", "Dispatch error:", error);
    }
}

/**
 * Normalize payload data to match API format and avoid Circular/BigInt errors
 */
function normalizePayloadData(event: WebhookEventType, data: any): any {
    if (event === "message.received" || event === "message.sent") {
        // If data is already simplified, return it
        if (data.type && data.content) return data;

        // If data is raw Baileys message (which we shouldn't be passing raw anymore, but just in case)
        // Ideally the caller (onMessageReceived) should have already simplified it.
        // But let's handle the specific fields passed by onMessageReceived below.
        return data;
    }
    return data;
}

/**
 * JSON Replacer to handle BigInt
 */
function jsonReplacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

/**
 * Send HTTP POST request to webhook endpoint
 */
async function sendWebhookRequest(url: string, payload: WebhookPayload, secret?: string | null) {
    // Use custom replacer for BigInt support
    const body = JSON.stringify(payload, jsonReplacer);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "WA-AKG-Webhook/1.0"
    };

    // Add HMAC signature if secret is provided
    if (secret) {
        const signature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }

    return response;
}

/**
 * Helper to download and save media
 */
export async function downloadAndSaveMedia(message: WAMessage, sessionId: string): Promise<string | null> {
    try {
        const messageContent = normalizeMessageContent(message.message);
        if (!messageContent) {
            logger.debug("Media", "No content normalized");
            return null;
        }

        const messageType = Object.keys(messageContent)[0];

        if (!['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType)) {
            logger.debug("Media", `Message type ${messageType} is not a downloadable media.`);
            return null;
        }

        logger.debug("Media", `Attempting to download ${messageType}...`);

        let buffer: Buffer | null = null;
        const mediaObj = (messageContent as any)[messageType];

        // Newsletter media is NOT encrypted — no mediaKey present
        const isNewsletterMedia = !mediaObj.mediaKey && (mediaObj.directPath || mediaObj.thumbnailDirectPath);

        if (isNewsletterMedia) {
            logger.info("Media", "Downloading unencrypted media (newsletter) via direct fetch...");

            const dp = mediaObj.directPath || mediaObj.thumbnailDirectPath;
            const downloadUrl = dp.startsWith('http') ? dp : `https://mmg.whatsapp.net${dp}`;

            try {
                const res = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: { 'Origin': 'https://web.whatsapp.com' }
                });

                if (!res.ok) {
                    logger.error("Media", `Newsletter media HTTP ${res.status} ${res.statusText} for URL: ${downloadUrl}`);
                    return null;
                }

                buffer = Buffer.from(await res.arrayBuffer());
                logger.success("Media", `Newsletter media downloaded: ${buffer.length} bytes`);
            } catch (e) {
                logger.error("Media", "Failed to download newsletter media:", e);
                return null;
            }
        } else {
            // Regular encrypted media — use Baileys downloadMediaMessage
            try {
                buffer = await downloadMediaMessage(
                    message,
                    "buffer",
                    {}
                ) as Buffer;
            } catch (e: any) {
                // Common WhatsApp limitations — log at warn level, don't spam errors:
                //  • "bad decrypt" / "Provider routines" → media key expired or message too old
                //  • "404" / "410" → media removed from WhatsApp servers
                //  • "Stream closed" → connection dropped mid-download
                const msg = e?.message || String(e);
                const isExpected = (
                    msg.includes("bad decrypt") ||
                    msg.includes("Provider routines") ||
                    msg.includes("404") ||
                    msg.includes("410") ||
                    msg.includes("Stream closed") ||
                    msg.includes("AES_GCM_ERROR")
                );
                if (isExpected) {
                    logger.debug("Media", `Unable to decrypt media (likely expired): ${message.key?.id}`);
                } else {
                    logger.error("Media", "Failed to download encrypted media:", e);
                }
                return null;
            }
        }

        if (!buffer) {
            logger.warn("Media", "Buffer is empty/null");
            return null;
        }

        logger.success("Media", `Downloaded ${buffer.length} bytes.`);

        // Generate filename
        const extMap: Record<string, string> = {
            imageMessage: 'jpg',
            videoMessage: 'mp4',
            audioMessage: 'mp3',
            documentMessage: 'bin',
            stickerMessage: 'webp'
        };

        let ext = extMap[messageType] || 'bin';

        // Try to get extension from mimetype if available
        const mime = (messageContent as any)[messageType]?.mimetype;
        if (mime) {
            const mimeExt = mime.split('/')[1]?.split(';')[0];
            if (mimeExt) ext = mimeExt;
        }

        const filename = `${sessionId}-${message.key.id}.${ext}`;
        const mediaDir = path.join(process.cwd(), "data", "media");
        const filePath = path.join(mediaDir, filename);

        // Ensure directory exists (redundant if handled by OS, but safe)
        await mkdir(path.dirname(filePath), { recursive: true });

        await writeFile(filePath, buffer);

        // Return URL path using API route for reliable serving
        const fileUrl = `/api/media/${filename}`;
        logger.success("Media", `Success. URL: ${fileUrl}`);
        return fileUrl;

    } catch (e) {
        logger.error("Media", "Failed to download media:", e);
        return null;
    }
}

/**
 * Helper to dispatch message received event
 * Normalizes message content to match API structure
 */
export async function onMessageReceived(sessionId: string, message: any, existingFileUrl?: string | null) {
    // Re-calculate fields to match store logic EXACTLY
    const remoteJid = message.key?.remoteJid || "";
    const fromMe = message.key?.fromMe || false;
    const isGroup = remoteJid.endsWith("@g.us");
    const participant = isGroup ? (message.key?.participant || message.participant) : undefined;

    // Extract Alt JID (e.g. Phone Number JID when remoteJid is LID)
    const remoteJidAlt = message.key?.remoteJidAlt || null;

    // --- Consistent JID Normalization ---
    // Always prefer @s.whatsapp.net format over @lid
    const normalizedFrom = await resolveToPhoneJid(remoteJid, sessionId, remoteJidAlt);

    // "sender" is who sent it. In DM: remoteJid. In Group: participant.
    let senderJid: string = isGroup ? (participant || "") : remoteJid;
    const normalizedSender = await resolveToPhoneJid(senderJid, sessionId);
    let sender: any = normalizedSender;

    // Enrich Participant Data if Group
    let participantDetail: any = await resolveToPhoneJid(participant || "", sessionId);

    if (isGroup && typeof sender === 'string') {
        try {
            const session = await prisma.session.findUnique({
                where: { sessionId },
                select: { id: true }
            });

            if (session) {
                const group = await prisma.group.findUnique({
                    where: {
                        sessionId_jid: {
                            sessionId: session.id,
                            jid: remoteJid
                        }
                    },
                    select: { participants: true }
                });

                if (group && group.participants) {
                    const parts = group.participants as any[];
                    const found = parts.find(p => p.id === senderJid || p.id === participant || p.id === normalizedSender);
                    if (found) {
                        sender = found;
                        participantDetail = found;
                    }
                }
            }
        } catch (e) {
            logger.error("Store", "Failed to enrich participant", e);
        }
    }

    // Download media if available (or use existing).
    // Note: store/index.ts already attempts this once and passes the result via existingFileUrl.
    // We DO NOT retry here for messages that have a media payload but no fileUrl, because
    // re-downloading encrypted media that already failed once will just fail again with the
    // same "bad decrypt" error and pollute logs.
    const fileUrl: string | null = existingFileUrl || null;

    const normalized = extractMessageContent(message);
    const quoted = await extractQuotedMessageAsync(message, sessionId);

    dispatchWebhook(sessionId, "message.received", {
        key: {
            id: message.key?.id,
            remoteJid: normalizedFrom,
            fromMe: fromMe,
            participant: participantDetail
        },
        pushName: message.pushName,
        messageTimestamp: message.messageTimestamp,

        // Simplified Fields — always @s.whatsapp.net format
        from: normalizedFrom,       // Chat ID (normalized)
        sender: sender,             // Who Sent It (normalized JID or enriched Object)
        isGroup: isGroup,           // Boolean
        chatType: getChatType(remoteJid), // PERSONAL | GROUP | STATUS | NEWSLETTER

        // Message Content
        type: normalized.type,
        content: normalized.content,
        fileUrl: fileUrl,
        caption: normalized.caption,
        quoted: quoted,

        // Raw Data
        raw: message
    });
}

/**
 * Helper to dispatch message sent event
 */
export async function onMessageSent(sessionId: string, message: any, existingFileUrl?: string | null) {
    const normalized = extractMessageContent(message);
    const quoted = await extractQuotedMessageAsync(message, sessionId);
    const remoteJid = message.key?.remoteJid || "";
    const isGroup = remoteJid.endsWith("@g.us");
    const remoteJidAlt = message.key?.remoteJidAlt || null;

    // Download media for sent messages too.
    // See onMessageReceived comment — we only honor existingFileUrl from the caller (store)
    // to avoid duplicate decrypt attempts that always fail with the same error.
    const fileUrl: string | null = existingFileUrl || null;

    // --- Consistent JID Normalization (same as onMessageReceived) ---
    const normalizedFrom = await resolveToPhoneJid(remoteJid, sessionId, remoteJidAlt);

    // For sent messages, sender is "ME" (self)
    // But we still normalize the participant JID if in a group
    const rawSender = message.key?.participant || (message.key?.fromMe ? "ME" : remoteJid);
    const sender = rawSender === "ME" ? "ME" : await resolveToPhoneJid(rawSender, sessionId);

    dispatchWebhook(sessionId, "message.sent", {
        key: {
            id: message.key?.id,
            remoteJid: normalizedFrom,
            fromMe: message.key?.fromMe || true,
            participant: isGroup ? sender : undefined
        },

        // Simplified Fields — always @s.whatsapp.net format
        from: normalizedFrom,       // Chat ID (normalized)
        sender: sender,             // "ME" or normalized JID
        isGroup: isGroup,           // Boolean
        chatType: getChatType(remoteJid), // PERSONAL | GROUP | STATUS | NEWSLETTER

        type: normalized.type,
        content: normalized.content,
        fileUrl: fileUrl,
        caption: normalized.caption,
        quoted: quoted,

        timestamp: Date.now(),
        raw: message
    });
}

/**
 * Determine chat type from JID
 */
function getChatType(jid: string): "PERSONAL" | "GROUP" | "STATUS" | "NEWSLETTER" | "UNKNOWN" {
    if (!jid) return "UNKNOWN";
    if (jid.endsWith("@g.us")) return "GROUP";
    if (jid.endsWith("@s.whatsapp.net")) return "PERSONAL";
    if (jid.endsWith("@lid")) return "PERSONAL"; // LID is also a personal chat
    if (jid === "status@broadcast") return "STATUS";
    if (jid.endsWith("@newsletter")) return "NEWSLETTER";
    return "UNKNOWN";
}


/**
 * Helper to dispatch connection update event
 */
export function onConnectionUpdate(sessionId: string, status: string, qr?: string) {
    dispatchWebhook(sessionId, "connection.update", {
        status,
        qr: qr || null
    });
}

/**
 * Extract content and type from Baileys message
 */
function extractMessageContent(msg: any): { type: string, content: string, caption?: string } {
    const messageContent = normalizeMessageContent(msg.message);
    let text = "";
    let caption = undefined;
    let messageType = "TEXT";

    if (!messageContent) return { type: "UNKNOWN", content: "" };

    if (messageContent.conversation) {
        text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage) {
        messageType = "IMAGE";
        caption = messageContent.imageMessage.caption || "";
        text = caption; // Content often used as text display
    } else if (messageContent.videoMessage) {
        messageType = "VIDEO";
        caption = messageContent.videoMessage.caption || "";
        text = caption;
    } else if (messageContent.audioMessage) {
        messageType = "AUDIO";
    } else if (messageContent.documentMessage) {
        messageType = "DOCUMENT";
        text = messageContent.documentMessage.fileName || "";
        caption = messageContent.documentMessage.caption || "";
    } else if (messageContent.stickerMessage) {
        messageType = "STICKER";
    } else if (messageContent.locationMessage) {
        messageType = "LOCATION";
        text = `${messageContent.locationMessage.degreesLatitude},${messageContent.locationMessage.degreesLongitude}`;
    } else if (messageContent.contactMessage) {
        messageType = "CONTACT";
        text = messageContent.contactMessage.displayName || "";
    }

    return { type: messageType, content: text, caption };
}



/**
 * Extract Quoted Message recursively (Async to Lookup DB)
 */
async function extractQuotedMessageAsync(msg: any, sessionId: string): Promise<any> {
    const messageContent = normalizeMessageContent(msg.message);
    if (!messageContent) return null;

    // Check for contextInfo in common message types
    let contextInfo: any = null;

    if (messageContent.extendedTextMessage) {
        contextInfo = messageContent.extendedTextMessage.contextInfo;
    } else if (messageContent.imageMessage) {
        contextInfo = messageContent.imageMessage.contextInfo;
    } else if (messageContent.videoMessage) {
        contextInfo = messageContent.videoMessage.contextInfo;
    } else if (messageContent.audioMessage) {
        contextInfo = messageContent.audioMessage.contextInfo;
    } else if (messageContent.stickerMessage) {
        contextInfo = messageContent.stickerMessage.contextInfo;
    } else if (messageContent.documentMessage) {
        contextInfo = messageContent.documentMessage.contextInfo;
    } else if (messageContent.contactMessage) {
        contextInfo = messageContent.contactMessage.contextInfo;
    } else if (messageContent.locationMessage) {
        contextInfo = messageContent.locationMessage.contextInfo;
    }

    if (contextInfo && contextInfo.quotedMessage) {
        const quotedMsg = contextInfo.quotedMessage;
        const normalized = extractMessageContent({ message: quotedMsg });

        let fileUrl = null;

        // Lookup Media URL in DB if possible
        if (contextInfo.stanzaId) {
            try {
                // We need the dbSessionId... this is tricky without fetching session again.
                // But we can try to look up by sessionId (baileys ID) and keyId
                // Message table has @@unique([sessionId, keyId]). BUT sessionId there is the CUID, not the string.

                // Fetch CUID First
                const session = await prisma.session.findUnique({
                    where: { sessionId },
                    select: { id: true }
                });

                if (session) {
                    const savedMsg = await prisma.message.findUnique({
                        where: {
                            sessionId_keyId: {
                                sessionId: session.id,
                                keyId: contextInfo.stanzaId
                            }
                        },
                        select: { mediaUrl: true }
                    });

                    if (savedMsg?.mediaUrl) {
                        fileUrl = savedMsg.mediaUrl;
                    }
                }
            } catch (e) {
                logger.error("Media", "Failed to lookup quoted media url", e);
            }
        }

        return {
            key: {
                remoteJid: contextInfo.remoteJid || null, // Group JID
                participant: contextInfo.participant || null, // Sender JID
                fromMe: contextInfo.participant === undefined, // Not reliable, better check participant
                id: contextInfo.stanzaId || null
            },
            type: normalized.type,
            content: normalized.content, // Text or Caption
            caption: normalized.caption,
            fileUrl: fileUrl, // <--- Added!
            // We don't download quoted media automatically unless it was already saved
            // raw: quotedMsg 
        };
    }

    return null;
}

