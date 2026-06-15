import { prisma } from "@/lib/prisma";
import { batchResolveToPhoneJid, normalizeJid } from "@/lib/jid-utils";
import { waManager } from "@/modules/whatsapp/manager";
import Sticker from "wa-sticker-formatter";

export class ChatService {
    /**
     * Get the active chats list for a session, including last message preview.
     */
    static async getChatsList(dbSessionId: string) {
        // 1. Get contacts
        const contacts = await prisma.contact.findMany({
            where: { sessionId: dbSessionId },
            orderBy: { updatedAt: 'desc' },
            select: { jid: true, name: true, notify: true, profilePic: true }
        });

        // 2. Get Groups for subjects
        const groups = await prisma.group.findMany({
            where: { sessionId: dbSessionId },
            select: { jid: true, subject: true }
        });

        // 3. Get the session's sessionId for WhatsApp instance access
        const sessionRecord = await prisma.session.findUnique({
            where: { id: dbSessionId },
            select: { sessionId: true }
        });

        // 4. Get all messages grouped by remoteJid with last message info (single query)
        const lastMessages = await prisma.$queryRaw<Array<{ remoteJid: string; content: string | null; timestamp: Date; type: string }>>`
            SELECT DISTINCT ON ("remoteJid") "remoteJid", "content", "timestamp", "type"
            FROM "Message"
            WHERE "sessionId" = ${dbSessionId}
            ORDER BY "remoteJid", "timestamp" DESC
        `;

        const lastMessageMap = new Map<string, { content: string | null; timestamp: Date; type: string }>();
        lastMessages.forEach(m => lastMessageMap.set(m.remoteJid, m));

        const allJids = new Set([
            ...contacts.map(c => c.jid),
            ...groups.map(g => g.jid),
            ...lastMessages.map(m => m.remoteJid)
        ]);

        // Ensure all newsletter contacts appear in the list even without messages
        contacts.filter(c => c.jid.endsWith("@newsletter")).forEach(c => allJids.add(c.jid));

        const jidMap = await batchResolveToPhoneJid(Array.from(allJids), dbSessionId);

        const contactMap = new Map();
        contacts.forEach(c => contactMap.set(c.jid, c));
        groups.forEach(g => contactMap.set(g.jid, { jid: g.jid, name: g.subject, notify: g.subject, profilePic: null }));

        // For newsletter/channel JIDs without a name, try to get pushName from their messages
        const allNewsletterJids = Array.from(allJids).filter(jid => jid.endsWith("@newsletter"));
        const newsletterJidsWithoutName = allNewsletterJids.filter(jid => {
            const info = contactMap.get(jid);
            return !info || !info.name;
        });
        if (newsletterJidsWithoutName.length > 0) {
            const newsletterNames = await prisma.message.findMany({
                where: {
                    sessionId: dbSessionId,
                    remoteJid: { in: newsletterJidsWithoutName },
                    pushName: { not: null }
                },
                distinct: ['remoteJid'],
                select: { remoteJid: true, pushName: true },
                orderBy: { timestamp: 'desc' }
            });
            newsletterNames.forEach(m => {
                if (m.pushName) {
                    const existing = contactMap.get(m.remoteJid);
                    if (existing) {
                        existing.name = m.pushName;
                        existing.notify = m.pushName;
                    } else {
                        contactMap.set(m.remoteJid, { jid: m.remoteJid, name: m.pushName, notify: m.pushName, profilePic: null });
                    }
                }
            });
        }

        // Also enrich existing contacts that have no name with pushName from messages
        const namelessJids = Array.from(allJids).filter(jid => {
            const info = contactMap.get(jid);
            return info && !info.name && !info.notify;
        });
        if (namelessJids.length > 0) {
            const fallbackNames = await prisma.message.findMany({
                where: {
                    sessionId: dbSessionId,
                    remoteJid: { in: namelessJids },
                    pushName: { not: null }
                },
                distinct: ['remoteJid'],
                select: { remoteJid: true, pushName: true },
                orderBy: { timestamp: 'desc' }
            });
            fallbackNames.forEach(m => {
                if (m.pushName) {
                    const existing = contactMap.get(m.remoteJid);
                    if (existing) {
                        existing.name = m.pushName;
                        existing.notify = m.pushName;
                    }
                }
            });
        }

        // Fetch newsletter metadata from WhatsApp for channels still without names
        const stillNamelessNewsletters = Array.from(allJids).filter(jid => {
            if (!jid.endsWith("@newsletter")) return false;
            const info = contactMap.get(jid);
            return !info || !info.name;
        });

        if (stillNamelessNewsletters.length > 0 && sessionRecord?.sessionId) {
            const instance = waManager.getInstance(sessionRecord.sessionId);
            if (instance?.socket) {
                // Fetch metadata in parallel (max 5 at a time to avoid rate limiting)
                const batchSize = 5;
                for (let i = 0; i < stillNamelessNewsletters.length; i += batchSize) {
                    const batch = stillNamelessNewsletters.slice(i, i + batchSize);
                    const results = await Promise.allSettled(
                        batch.map(jid => instance.socket!.newsletterMetadata("jid", jid))
                    );

                    results.forEach((result, idx) => {
                        if (result.status === "fulfilled" && result.value?.name) {
                            const jid = batch[idx];
                            const name = result.value.name;
                            contactMap.set(jid, { 
                                jid, 
                                name, 
                                notify: name, 
                                profilePic: result.value.picture?.url || null 
                            });

                            // Also save to DB for future use
                            prisma.contact.upsert({
                                where: { sessionId_jid: { sessionId: dbSessionId, jid } },
                                create: { sessionId: dbSessionId, jid, name, notify: name },
                                update: { name, notify: name }
                            }).catch(() => {}); // fire and forget
                        }
                    });
                }
            }
        }

        const chatList = Array.from(allJids).map((originalJid) => {
            const resolvedJid = jidMap.get(originalJid) || originalJid;
            const normalizedJid = normalizeJid(resolvedJid);
            const contactInfo = contactMap.get(originalJid) || contactMap.get(normalizedJid) || { jid: normalizedJid, name: null, notify: null, profilePic: null };

            // Use the pre-fetched last message map instead of running findFirst per chat
            const lastMessage = lastMessageMap.get(originalJid) || lastMessageMap.get(normalizedJid);

            return {
                ...contactInfo,
                jid: normalizedJid,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    timestamp: lastMessage.timestamp.toISOString(),
                    type: lastMessage.type
                } : undefined
            };
        });

        // Deduplicate unified list
        const uniqueChats = new Map();
        chatList.forEach(chat => {
            const existing = uniqueChats.get(chat.jid);
            if (!existing || (chat.lastMessage?.timestamp && (!existing.lastMessage?.timestamp || new Date(chat.lastMessage.timestamp) > new Date(existing.lastMessage.timestamp)))) {
                uniqueChats.set(chat.jid, chat);
            }
        });

        const finalChats = Array.from(uniqueChats.values());

        finalChats.sort((a, b) => {
            const tA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
            const tB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
            return tB - tA;
        });

        return finalChats;
    }

    /**
     * Get recent messages for a specific chat.
     */
    static async getMessages(dbSessionId: string, jid: string, take: number = 100) {
        // Query with normalized JID to handle @c.us / @s.whatsapp.net variations
        const normalizedJid = normalizeJid(jid);
        
        // Find if this contact has both LID and Phone JID in the database
        const contact = await prisma.contact.findFirst({
            where: {
                sessionId: dbSessionId,
                OR: [{ jid: jid }, { lid: jid }, { remoteJidAlt: jid }, { jid: normalizedJid }]
            },
            select: { jid: true, lid: true, remoteJidAlt: true }
        });

        const queryJids = new Set([jid, normalizedJid]);
        if (contact) {
            if (contact.jid) queryJids.add(contact.jid);
            if (contact.lid) queryJids.add(contact.lid);
            if (contact.remoteJidAlt) queryJids.add(contact.remoteJidAlt);
        }

        const messages = await prisma.message.findMany({
            where: {
                sessionId: dbSessionId,
                remoteJid: { in: Array.from(queryJids) }
            },
            orderBy: { timestamp: 'desc' },
            take
        });
        return messages.reverse();
    }

    /**
     * Send a text message, optionally with mentions and stickers if formatted as URL.
     */
    static async sendTextMessage(sessionId: string, jid: string, messagePayload: any, mentions?: string[]) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }
        // Socket bisa ada tapi koneksi sedang reconnect/putus → kirim bisa gagal diam-diam.
        // Wajib status CONNECTED supaya pesan benar-benar terkirim (anti "kadang ga ngirim").
        if (instance.status !== "CONNECTED") {
            throw new Error(`WhatsApp session belum CONNECTED (status: ${instance.status}). Coba lagi sebentar.`);
        }

        let msgPayload = { ...messagePayload };

        // Normalize "text" to "caption" if a media message is sent with "text"
        if (msgPayload.text && (msgPayload.image || msgPayload.video || msgPayload.document || msgPayload.audio)) {
            if (!msgPayload.caption) {
                msgPayload.caption = msgPayload.text;
            }
            delete msgPayload.text;
        }

        if (msgPayload.sticker && (msgPayload.sticker.url || typeof msgPayload.sticker === 'string')) {
            const url = msgPayload.sticker.url || msgPayload.sticker;
            // SSRF Protection
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error("Only http/https URLs allowed");
            const hostname = parsedUrl.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
                throw new Error("Internal URLs not allowed");
            }
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch sticker media`);
                const buffer = await res.arrayBuffer();
                const sticker = new Sticker(Buffer.from(buffer), {
                    pack: msgPayload.sticker.pack || process.env.APP_NAME || "Sticker",
                    author: msgPayload.sticker.author || process.env.APP_NAME || "Sticker",
                    type: "full",
                    quality: 50
                });
                msgPayload = { sticker: await sticker.toBuffer() };
            } catch (e: any) {
                throw new Error(`Failed to generate sticker from URL: ${e.message}`);
            }
        }

        if (msgPayload.image && typeof msgPayload.image === 'object' && msgPayload.image.url) {
            try {
                const res = await fetch(msgPayload.image.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.image = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch image from URL: ${e.message}`);
            }
        }

        if (msgPayload.video && typeof msgPayload.video === 'object' && msgPayload.video.url) {
            try {
                const res = await fetch(msgPayload.video.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.video = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch video from URL: ${e.message}`);
            }
        }

        if (msgPayload.document && typeof msgPayload.document === 'object' && msgPayload.document.url) {
            try {
                const res = await fetch(msgPayload.document.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.document = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch document from URL: ${e.message}`);
            }
        }

        if (msgPayload.audio && typeof msgPayload.audio === 'object' && msgPayload.audio.url) {
            try {
                const res = await fetch(msgPayload.audio.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.audio = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch audio from URL: ${e.message}`);
            }
        }

        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        return await instance.socket.sendMessage(jid, msgPayload, { mentions: mentions || [] } as any);
    }

    /**
     * Send a media message locally from a buffer.
     */
    static async sendMediaMessage(
        sessionId: string, 
        jid: string, 
        buffer: Buffer, 
        type: string, 
        mimetype: string,
        fileName: string, 
        caption: string
    ) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        const messageOptions: any = {};
        if (caption) messageOptions.caption = caption;
        messageOptions.mimetype = mimetype;
        
        let content: any = {};

        if (type === 'image') {
            content = { image: buffer, ...messageOptions };
        } else if (type === 'video') {
             content = { video: buffer, ...messageOptions };
        } else if (type === 'audio') {
             content = { audio: buffer, mimetype: 'audio/mp4', ptt: false };
        } else if (type === 'voice') {
             content = { audio: buffer, mimetype: 'audio/mp4', ptt: true };
        } else if (type === 'document') {
             content = { document: buffer, mimetype, fileName, ...messageOptions };
        } else if (type === 'sticker') {
            const sticker = new Sticker(buffer, {
                pack: process.env.APP_NAME || "Sticker",
                author: process.env.APP_NAME || "Sticker",
                type: "full",
                quality: 50
            });
            content = { sticker: await sticker.toBuffer() };
        } else {
             content = { document: buffer, mimetype, fileName, ...messageOptions };
        }

        return await instance.socket.sendMessage(jid, content);
    }
}
