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
 * Group admins are exempt.
 */

// Detect WhatsApp invite links
const WA_INVITE_REGEX = /chat\.whatsapp\.com\/[A-Za-z0-9_-]{6,}/i;

// General URL detector — http(s)://, www., or bare domain.com/...
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}(?:\/[^\s]*)?)/i;

// Per-session warning counter
const warnCounters = new Map<string, Map<string, Map<string, number>>>();

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

/**
 * Compare two JIDs ignoring server suffix and `:device` part.
 * Baileys may give us "62812@s.whatsapp.net", "62812:5@s.whatsapp.net",
 * or "12345@lid" — all should match the same person.
 */
function sameUser(a: string | undefined | null, b: string | undefined | null): boolean {
    if (!a || !b) return false;
    const norm = (j: string) => j.split(/[:@]/)[0];
    return norm(a) === norm(b);
}

export function bindAntiLink(sock: WASocket, sessionId: string) {
    if (!sock?.ev) {
        logger.warn("AntiLink", `Cannot bind for ${sessionId} — socket missing`);
        return;
    }

    logger.info("AntiLink", `Bound to session ${sessionId}`);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        // Load fresh config per batch (DB hit is cheap, lets toggle take effect immediately)
        let config: any;
        try {
            const session = await prisma.session.findUnique({
                where: { sessionId },
                include: { botConfig: true },
            });
            if (!session?.botConfig) return;
            config = session.botConfig;
        } catch (e) {
            logger.error("AntiLink", "Failed to load config", e);
            return;
        }

        const mode = String(config.antiLinkMode || "OFF").toUpperCase();
        if (mode === "OFF") return;

        const action = String(config.antiLinkAction || "DELETE").toUpperCase();
        const limit = Math.max(1, Number(config.antiLinkLimit) || 3);

        for (const msg of messages) {
            try {
                const remoteJid = msg.key.remoteJid;
                if (!remoteJid || !remoteJid.endsWith("@g.us")) continue;
                if (msg.key.fromMe) continue;

                const senderJid = msg.key.participant || (msg as any).participant;
                if (!senderJid) continue;

                const text = extractText(msg);
                if (!text) continue;
                if (!detectViolation(text, mode)) continue;

                logger.info("AntiLink", `Detected ${mode} link from ${senderJid} in ${remoteJid}: ${text.slice(0, 60)}`);

                // Fetch group metadata to check admin status
                let groupMeta;
                try {
                    groupMeta = await sock.groupMetadata(remoteJid);
                } catch (e) {
                    logger.warn("AntiLink", `Failed to fetch group metadata for ${remoteJid}`, e);
                    continue;
                }

                // Identify bot's own JID — handle both standard and LID formats
                const botUserId = sock.user?.id || "";
                const botLid = sock.user?.lid || "";

                const myParticipant = groupMeta.participants.find(
                    (p) => sameUser(p.id, botUserId) || sameUser(p.id, botLid)
                );
                const isBotAdmin = !!myParticipant && (myParticipant.admin === "admin" || myParticipant.admin === "superadmin");

                const senderParticipant = groupMeta.participants.find((p) => sameUser(p.id, senderJid));
                const senderIsAdmin = !!senderParticipant && (senderParticipant.admin === "admin" || senderParticipant.admin === "superadmin");

                if (senderIsAdmin) {
                    logger.debug("AntiLink", `Sender ${senderJid} is admin, exempt`);
                    continue;
                }

                if (!isBotAdmin) {
                    logger.warn(
                        "AntiLink",
                        `Bot is NOT admin in ${groupMeta.subject || remoteJid} — cannot delete/kick. Make the bot a group admin to enforce.`
                    );
                    // Still warn once so user knows
                    try {
                        await sock.sendMessage(remoteJid, {
                            text: "⚠️ Anti-link aktif tapi bot bukan admin. Jadikan bot admin agar bisa hapus/kick.",
                        });
                    } catch { /* ignore */ }
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
                    logger.info("AntiLink", `Deleted offending message ${msg.key.id} in ${remoteJid}`);
                } catch (e) {
                    logger.error("AntiLink", "Failed to delete message", e);
                }

                // 2. Warn the sender (with mention)
                const count = incWarn(sessionId, remoteJid, senderJid);
                const phone = senderJid.split(/[:@]/)[0];
                let warningText = `⚠️ @${phone} dilarang mengirim link di grup ini.`;
                if (action === "KICK") {
                    warningText += `\nPeringatan ${count}/${limit}.`;
                    if (count >= limit) {
                        warningText += ` Anda akan dikeluarkan dari grup.`;
                    }
                }

                try {
                    await sock.sendMessage(remoteJid, {
                        text: warningText,
                        mentions: [senderJid],
                    });
                } catch (e) {
                    logger.warn("AntiLink", "Failed to send warning", e);
                }

                // 3. Kick if KICK action and threshold reached
                if (action === "KICK" && count >= limit) {
                    try {
                        await sock.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
                        resetWarn(sessionId, remoteJid, senderJid);
                        logger.info("AntiLink", `Kicked ${phone} from ${remoteJid} after ${count} violations`);
                    } catch (e) {
                        logger.error("AntiLink", "Failed to kick offender", e);
                    }
                }
            } catch (e) {
                logger.error("AntiLink", "Error processing message", e);
            }
        }
    });
}
