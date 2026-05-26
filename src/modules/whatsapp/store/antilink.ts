import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

/**
 * Anti-Link feature
 *
 * Detects forbidden links in group chats and takes action against the sender.
 *
 * Modes (from BotConfig.antiLinkMode):
 *   - "OFF"     → disabled
 *   - "INVITE"  → only block WhatsApp group invite links (chat.whatsapp.com/...)
 *   - "ALL"     → block any URL (http(s)://..., www....)
 *
 * Actions (from BotConfig.antiLinkAction):
 *   - "DELETE"  → just delete the offending message + warn
 *   - "KICK"    → warn N times then kick the offender (N = antiLinkLimit)
 *
 * The bot must be group admin to delete or kick.
 * Group admins and the session owner are exempt.
 */

// Fast regex to detect WhatsApp invite links
const WA_INVITE_REGEX = /chat\.whatsapp\.com\/[A-Za-z0-9]{6,}/i;

// General URL detector — http://, https://, or bare hostname like example.com/path
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i;

// Per-session warning counter: Map<sessionId, Map<groupJid, Map<senderJid, count>>>
// Stays in memory because warns reset on bot restart, which is the expected behavior.
const warnCounters = new Map<string, Map<string, Map<string, number>>>();

function getWarn(sessionId: string, groupJid: string, senderJid: string): number {
    return warnCounters.get(sessionId)?.get(groupJid)?.get(senderJid) ?? 0;
}

function incWarn(sessionId: string, groupJid: string, senderJid: string): number {
    if (!warnCounters.has(sessionId)) warnCounters.set(sessionId, new Map());
    const sessMap = warnCounters.get(sessionId)!;
    if (!sessMap.has(groupJid)) sessMap.set(groupJid, new Map());
    const groupMap = sessMap.get(groupJid)!;
    const next = (groupMap.get(senderJid) ?? 0) + 1;
    groupMap.set(senderJid, next);
    return next;
}

function resetWarn(sessionId: string, groupJid: string, senderJid: string) {
    warnCounters.get(sessionId)?.get(groupJid)?.delete(senderJid);
}

function extractText(msg: WAMessage): string {
    const content = normalizeMessageContent(msg.message);
    if (!content) return "";
    return (
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        content.documentMessage?.caption ||
        ""
    );
}

function detectViolation(text: string, mode: string): boolean {
    if (!text) return false;
    if (mode === "INVITE") return WA_INVITE_REGEX.test(text);
    if (mode === "ALL") return URL_REGEX.test(text);
    return false;
}

export function bindAntiLink(sock: WASocket, sessionId: string) {
    if (!sock?.ev) return;

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        let config: any;
        try {
            const session = await prisma.session.findUnique({
                where: { sessionId },
                include: { botConfig: true },
            });
            if (!session?.botConfig) return;
            config = session.botConfig;
        } catch {
            return;
        }

        const mode = (config.antiLinkMode || "OFF").toUpperCase();
        if (mode === "OFF") return;

        const action = (config.antiLinkAction || "DELETE").toUpperCase();
        const limit = Math.max(1, config.antiLinkLimit || 3);

        for (const msg of messages) {
            try {
                const remoteJid = msg.key.remoteJid;
                if (!remoteJid || !remoteJid.endsWith("@g.us")) continue;
                if (msg.key.fromMe) continue;

                const senderJid = msg.key.participant || (msg as any).participant;
                if (!senderJid) continue;

                const text = extractText(msg);
                if (!detectViolation(text, mode)) continue;

                // Resolve admin status — admins and the bot itself are exempt
                let groupMeta;
                try {
                    groupMeta = await sock.groupMetadata(remoteJid);
                } catch {
                    continue; // can't verify perms — skip
                }

                const myJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
                const myParticipant = groupMeta.participants.find(
                    (p) => p.id === myJid || p.id === sock.user?.id
                );
                const isBotAdmin = !!myParticipant && (myParticipant.admin === "admin" || myParticipant.admin === "superadmin");

                const senderParticipant = groupMeta.participants.find((p) => p.id === senderJid);
                const senderIsAdmin = !!senderParticipant && (senderParticipant.admin === "admin" || senderParticipant.admin === "superadmin");

                if (senderIsAdmin) continue; // admins are exempt

                if (!isBotAdmin) {
                    // Bot can't delete or kick — just log and warn-once via reply
                    logger.debug("AntiLink", `Bot is not admin in ${remoteJid}, cannot enforce`);
                    continue;
                }

                // 1. Delete offending message
                try {
                    await sock.sendMessage(remoteJid, {
                        delete: {
                            remoteJid,
                            fromMe: false,
                            id: msg.key.id!,
                            participant: senderJid,
                        },
                    });
                } catch (e) {
                    logger.debug("AntiLink", "Failed to delete message", e);
                }

                // 2. Warn (with mention)
                const count = incWarn(sessionId, remoteJid, senderJid);
                const phone = senderJid.split("@")[0];
                let warningText = `⚠️ @${phone} dilarang mengirim link.`;
                if (action === "KICK") {
                    warningText += `\nPeringatan ${count}/${limit}.`;
                }

                try {
                    await sock.sendMessage(remoteJid, {
                        text: warningText,
                        mentions: [senderJid],
                    });
                } catch { /* ignore */ }

                // 3. Kick if action=KICK and threshold reached
                if (action === "KICK" && count >= limit) {
                    try {
                        await sock.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
                        resetWarn(sessionId, remoteJid, senderJid);
                        logger.info("AntiLink", `Kicked ${phone} from ${remoteJid} after ${count} violations`);
                    } catch (e) {
                        logger.warn("AntiLink", "Failed to kick offender", e);
                    }
                }
            } catch (e) {
                logger.debug("AntiLink", "Error processing message", e);
            }
        }
    });
}
