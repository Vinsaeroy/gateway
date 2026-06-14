import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { downloadMediaMessage, jidNormalizedUser, areJidsSameUser } from "@whiskeysockets/baileys";
import Sticker from "wa-sticker-formatter";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "@/lib/logger";

const execAsync = promisify(exec);

// Map to track start times for uptime
const startTimes = new Map<string, number>();

// Default bot config
// Default bot config
const DEFAULT_CONFIG = {
    enabled: true,
    botMode: 'OWNER',
    botAllowedJids: [] as string[],
    autoReplyMode: 'ALL',
    autoReplyAllowedJids: [] as string[],
    enableSticker: true,
    enableVideoSticker: true,
    maxStickerDuration: 10,
    enablePing: true,
    enableUptime: true,
    botName: "WA-AKG Bot",
    prefix: "#",
    removeBgApiKey: null as string | null
};

export function setSessionStartTime(sessionId: string) {
    if (!startTimes.has(sessionId)) {
        startTimes.set(sessionId, Date.now());
    }
}

// ===== Helper untuk command grup =====
function isGroupJid(jid: string) {
    return jid.endsWith("@g.us");
}

/**
 * Pastikan: di grup, pengirim admin (atau owner/fromMe), dan bot adalah admin.
 * Mengembalikan metadata kalau lolos, atau pesan error.
 */
async function requireGroupAdmin(
    sock: WASocket,
    remoteJid: string,
    msg: WAMessage,
    fromMe: boolean
): Promise<{ ok: boolean; metadata?: any; error?: string }> {
    if (!isGroupJid(remoteJid)) return { ok: false, error: "❌ Perintah ini hanya bisa dipakai di dalam grup." };

    let metadata: any;
    try {
        metadata = await sock.groupMetadata(remoteJid);
    } catch {
        return { ok: false, error: "❌ Gagal ambil data grup." };
    }

    const participants = metadata.participants || [];
    const isAdmin = (jid: string) =>
        participants.some(
            (p: any) => p.id && areJidsSameUser(p.id, jid) && (p.admin === "admin" || p.admin === "superadmin")
        );

    const botJid = jidNormalizedUser(sock.user?.id || "");
    const botIsAdmin = isAdmin(botJid);

    const senderJid = msg.key.participant || (msg as any).participant || "";
    const senderIsAdmin = fromMe || isAdmin(senderJid);

    if (!senderIsAdmin) return { ok: false, error: "❌ Khusus admin grup." };
    if (!botIsAdmin) return { ok: false, error: "❌ Jadikan bot sebagai admin grup dulu." };

    return { ok: true, metadata };
}

/** Ambil target JID dari: mention > reply > nomor di argumen. */
function resolveTargetJids(msg: WAMessage, args: string[]): string[] {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid || [];
    if (mentioned.length) return mentioned;
    if (ctx?.participant) return [ctx.participant];
    const nums = args.map((a) => a.replace(/[^0-9]/g, "")).filter((n) => n.length >= 6);
    return nums.map((n) => `${n}@s.whatsapp.net`);
}

export async function handleBotCommand(
    sock: WASocket | undefined,
    sessionId: string,
    msg: WAMessage
) {
    if (!sock || !msg.message || !msg.key.remoteJid) return;

    const remoteJid = msg.key.remoteJid;
    const fromMe = msg.key.fromMe || false;

    // Get text content
    let text = "";
    const messageContent = msg.message;

    if (messageContent.conversation) {
        text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage?.caption) {
        text = messageContent.imageMessage.caption;
    } else if (messageContent.videoMessage?.caption) {
        text = messageContent.videoMessage.caption;
    }

    // Quick check: skip non-command messages early (common prefixes)
    // We'll do a proper prefix check after loading config
    if (!text || text.length === 0) return;

    // Fetch session first
    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true }
    });

    if (!session) return;

    // Fetch BotConfig separately
    // @ts-ignore - Prisma Client types might lag in IDE
    const botConfig = await (prisma as any).botConfig.findUnique({
        where: { sessionId: session.id }
    });

    const config = botConfig || DEFAULT_CONFIG;

    if (!config.enabled) return;

    // Now check prefix with loaded config
    const prefix = (config as any).prefix || "#";
    if (!text.startsWith(prefix)) return;

    // Verify Access Permissions
    const botMode = (config as any).botMode || 'OWNER'; // Default to OWNER if missing

    // Check Permission
    let canExecute = false;

    if (fromMe) {
        canExecute = true; // Owner always allowed
    } else {
        if (botMode === 'ALL') {
            canExecute = true;
        } else if (botMode === 'SPECIFIC') {
            const allowedJids = (config as any).botAllowedJids || [];
            // Standardized Sender Logic (matches webhook & store)
            const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : msg.key.remoteJid) || "";

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            if (Array.isArray(allowedJids)) {
                canExecute = allowedJids.some(jid => senderJid.includes(jid));
            }
        } else if (botMode === 'BLACKLIST') {
            const blockedJids = (config as any).botBlockedJids || [];
            const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : msg.key.remoteJid) || "";

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            // If blacklist, allowed by default UNLESS in blocked list
            canExecute = true;
            if (Array.isArray(blockedJids)) {
                const isBlocked = blockedJids.some(jid => senderJid.includes(jid));
                if (isBlocked) canExecute = false;
            }
        }
    }

    if (!canExecute) return;

    const [command, ...args] = text.trim().split(" ");
    const cmd = command.toLowerCase().slice(prefix.length); // remove prefix

    try {
        switch (cmd) {
            case "ping": {
                if (!config.enablePing) return;
                await sock.sendMessage(remoteJid, { text: "Pong! 🏓" }, { quoted: msg });
                break;
            }

            case "id": {
                await sock.sendMessage(remoteJid, {
                    text: `*Chat ID:* \`${remoteJid}\``
                }, { quoted: msg });
                break;
            }

            case "uptime": {
                if (!config.enableUptime) return;

                const start = startTimes.get(sessionId) || Date.now();
                const uptimeMs = Date.now() - start;
                const hours = Math.floor(uptimeMs / 3600000);
                const minutes = Math.floor((uptimeMs % 3600000) / 60000);
                const seconds = Math.floor((uptimeMs % 60000) / 1000);

                await sock.sendMessage(remoteJid, {
                    text: `*Session Uptime:* ${hours}h ${minutes}m ${seconds}s`
                }, { quoted: msg });
                break;
            }

            case "sticker":
            case "s":
            case "stiker": {
                if (!config.enableSticker) return;

                // Check if message has image or video
                let mediaMsg: WAMessage | null = msg;

                // If quoted, check quoted
                const quoted = messageContent.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quoted) {
                    mediaMsg = {
                        key: {
                            remoteJid,
                            id: messageContent.extendedTextMessage?.contextInfo?.stanzaId,
                        },
                        message: quoted
                    } as WAMessage;
                }

                const msgContent = mediaMsg.message;
                const isImage = !!msgContent?.imageMessage;
                const isVideo = !!msgContent?.videoMessage;

                if (!isImage && !isVideo) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please reply to an image/video or send media with caption #sticker" }, { quoted: msg });
                    return;
                }

                if (msgContent?.extendedTextMessage) {
                    await sock.sendMessage(remoteJid, { text: "❌ Cannot convert text message to sticker." }, { quoted: msg });
                    return;
                }

                // Handle Video Limits
                if (isVideo) {
                    if (!(config as any).enableVideoSticker) {
                        await sock.sendMessage(remoteJid, { text: "❌ Video stickers are disabled in bot settings." }, { quoted: msg });
                        return;
                    }

                    const seconds = msgContent?.videoMessage?.seconds || 0;
                    const maxDuration = (config as any).maxStickerDuration || 10;

                    if (seconds > maxDuration) {
                        await sock.sendMessage(remoteJid, { text: `❌ Video too long! Max duration is ${maxDuration} seconds.` }, { quoted: msg });
                        return;
                    }
                }

                await sock.sendMessage(remoteJid, { react: { text: "⏳", key: msg.key } });

                try {
                    // Download
                    let buffer = await downloadMediaMessage(
                        mediaMsg,
                        "buffer",
                        {},
                        {
                            logger: console as any,
                            reuploadRequest: sock.updateMediaMessage
                        }
                    ) as Buffer;

                    // Resize/Compress Logic
                    if (isImage) {
                        try {
                            // Use limitInputPixels: false to handle large images
                            buffer = await sharp(buffer, { limitInputPixels: false })
                                .resize(512, 512, { // Resize to standard 512x512 sticker size directly
                                    fit: 'inside',
                                    withoutEnlargement: true
                                })
                                .toBuffer();
                        } catch (resizeErr) {
                            logger.error("Bot", "Image Resize failed", resizeErr);
                        }
                    } else if (isVideo) {
                        try {
                            const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.mp4`);
                            const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.mp4`);

                            await fs.writeFile(tempInput, buffer);

                            // Compress Video using ffmpeg
                            // Extreme Compression: 8fps, CRF 40, 300k bitrate, ultrafast
                            await execAsync(`ffmpeg -y -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=10" -c:v libx264 -preset ultrafast -crf 40 -b:v 300k -maxrate 300k -bufsize 600k -an "${tempOutput}"`);

                            buffer = await fs.readFile(tempOutput);

                            // Cleanup
                            await fs.unlink(tempInput).catch(() => { });
                            await fs.unlink(tempOutput).catch(() => { });
                        } catch (videoErr) {
                            logger.error("Bot", "Video Compression failed", videoErr);
                            // Continue with original buffer if compression fails, or throw? 
                            // If it fails, likely original will fail too, but let's try.
                        }
                    }

                    // Check for background removal (Only for Images)
                    const isRemoveBg = args.includes("nobg") || args.includes("removebg");
                    if (isImage && isRemoveBg && config.removeBgApiKey) {
                        try {
                            // Convert Buffer to Uint8Array for Blob compatibility
                            const uint8Array = new Uint8Array(buffer);
                            const blob = new Blob([uint8Array], { type: 'image/png' });

                            const formData = new FormData();
                            formData.append('image_file', blob, 'image.png');
                            formData.append('size', 'auto');

                            const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                                method: 'POST',
                                headers: {
                                    'X-Api-Key': config.removeBgApiKey
                                },
                                body: formData
                            });

                            if (res.ok) {
                                const arrayBuffer = await res.arrayBuffer();
                                buffer = Buffer.from(arrayBuffer);
                            } else {
                                const err = await res.json();
                                throw new Error(`RemoveBG Error: ${(err as any).errors?.[0]?.title || res.statusText}`);
                            }
                        } catch (bgError) {
                            logger.error("Bot", "RemoveBG Failed:", bgError);
                            await sock.sendMessage(remoteJid, { text: `⚠️ Remove BG failed: ${(bgError as any).message}. Sending normal sticker...` }, { quoted: msg });
                        }
                    } else if (isImage && isRemoveBg && !config.removeBgApiKey) {
                        await sock.sendMessage(remoteJid, { text: `⚠️ Remove BG API Key not configured in dashboard. Sending normal sticker...` }, { quoted: msg });
                    }


                    // Convert
                    const sticker = new Sticker(buffer as Buffer, {
                        pack: (config as any).botName || "WA-AKG Bot",
                        author: "By " + ((config as any).botName || "WA-AKG Bot"),
                        type: "full", // full, crop, circle
                        quality: 15 // Extreme quality reduction for size
                    });

                    const stickerBuffer = await sticker.toBuffer();

                    // Send
                    await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
                    await sock.sendMessage(remoteJid, { react: { text: "✅", key: msg.key } });

                } catch (e) {
                    logger.error("Bot", "Sticker generation failed", e);
                    await sock.sendMessage(remoteJid, { text: "❌ Failed to create sticker. Error: " + (e as any).message }, { quoted: msg });
                }
                break;
            }

            case "menu":
            case "help": {
                const botName = (config as any).botName || "WA-AKG Bot";
                const menu = `
🤖 *${botName} Menu* 🤖

📌 *Commands:*
• *${prefix}sticker* / *${prefix}s*: Convert Image/Video to Sticker
  - Supports Images, GIFs, and Videos (max ${(config as any).maxStickerDuration || 10}s)
  - Use *${prefix}sticker nobg* to remove background (Images only)
• *${prefix}ping*: Check Bot Status
• *${prefix}uptime*: Check Session Uptime
• *${prefix}id*: Get Chat ID

👥 *Group (admin):*
• *${prefix}tagall* [pesan]: Tag semua anggota
• *${prefix}hidetag* [pesan]: Tag tersembunyi
• *${prefix}kick* (tag/reply/nomor): Keluarkan anggota
• *${prefix}add* <nomor>: Tambah anggota
• *${prefix}promote* / *${prefix}demote* (tag/reply): Jadikan/copot admin
• *${prefix}open* / *${prefix}close*: Buka/tutup grup

_Made with ❤️_
`;
                await sock.sendMessage(remoteJid, { text: menu }, { quoted: msg });
                break;
            }

            // ===== GROUP: TAG ALL =====
            case "tagall":
            case "everyone": {
                if (!isGroupJid(remoteJid)) {
                    await sock.sendMessage(remoteJid, { text: "❌ Hanya untuk grup." }, { quoted: msg });
                    return;
                }
                const metadata = await sock.groupMetadata(remoteJid);
                const parts = metadata.participants || [];
                const mentions = parts.map((p: any) => p.id);
                const note = args.join(" ").trim();
                let teks = note ? `${note}\n\n` : `📢 *Tag All* (${parts.length} anggota)\n\n`;
                for (const p of parts) teks += `• @${(p.id as string).split("@")[0]}\n`;
                await sock.sendMessage(remoteJid, { text: teks, mentions });
                break;
            }

            // ===== GROUP: HIDETAG (tag tersembunyi) =====
            case "hidetag":
            case "ht": {
                if (!isGroupJid(remoteJid)) {
                    await sock.sendMessage(remoteJid, { text: "❌ Hanya untuk grup." }, { quoted: msg });
                    return;
                }
                const metadata = await sock.groupMetadata(remoteJid);
                const mentions = (metadata.participants || []).map((p: any) => p.id);
                const teks = args.join(" ").trim() || "📢";
                await sock.sendMessage(remoteJid, { text: teks, mentions });
                break;
            }

            // ===== GROUP: KICK =====
            case "kick": {
                const gate = await requireGroupAdmin(sock, remoteJid, msg, fromMe);
                if (!gate.ok) {
                    await sock.sendMessage(remoteJid, { text: gate.error! }, { quoted: msg });
                    return;
                }
                const targets = resolveTargetJids(msg, args);
                if (!targets.length) {
                    await sock.sendMessage(remoteJid, { text: `❌ Tag/reply orangnya, atau ketik ${prefix}kick <nomor>.` }, { quoted: msg });
                    return;
                }
                try {
                    await sock.groupParticipantsUpdate(remoteJid, targets, "remove");
                    await sock.sendMessage(remoteJid, { text: `✅ Berhasil kick ${targets.length} anggota.`, mentions: targets }, { quoted: msg });
                } catch (e) {
                    await sock.sendMessage(remoteJid, { text: `❌ Gagal kick: ${(e as any)?.message || e}` }, { quoted: msg });
                }
                break;
            }

            // ===== GROUP: ADD =====
            case "add": {
                const gate = await requireGroupAdmin(sock, remoteJid, msg, fromMe);
                if (!gate.ok) {
                    await sock.sendMessage(remoteJid, { text: gate.error! }, { quoted: msg });
                    return;
                }
                const targets = resolveTargetJids(msg, args);
                if (!targets.length) {
                    await sock.sendMessage(remoteJid, { text: `❌ Ketik ${prefix}add <nomor> (pakai kode negara, mis. 628xxxx).` }, { quoted: msg });
                    return;
                }
                try {
                    const res: any = await sock.groupParticipantsUpdate(remoteJid, targets, "add");
                    const failed = Array.isArray(res) ? res.filter((r: any) => r.status !== "200") : [];
                    if (failed.length) {
                        await sock.sendMessage(remoteJid, { text: `⚠️ Sebagian gagal ditambah (mungkin privasi/sudah keluar). Berhasil: ${targets.length - failed.length}/${targets.length}.` }, { quoted: msg });
                    } else {
                        await sock.sendMessage(remoteJid, { text: `✅ Berhasil menambah ${targets.length} anggota.` }, { quoted: msg });
                    }
                } catch (e) {
                    await sock.sendMessage(remoteJid, { text: `❌ Gagal add: ${(e as any)?.message || e}` }, { quoted: msg });
                }
                break;
            }

            // ===== GROUP: PROMOTE / DEMOTE =====
            case "promote":
            case "demote": {
                const gate = await requireGroupAdmin(sock, remoteJid, msg, fromMe);
                if (!gate.ok) {
                    await sock.sendMessage(remoteJid, { text: gate.error! }, { quoted: msg });
                    return;
                }
                const targets = resolveTargetJids(msg, args);
                if (!targets.length) {
                    await sock.sendMessage(remoteJid, { text: `❌ Tag/reply orangnya untuk ${prefix}${cmd}.` }, { quoted: msg });
                    return;
                }
                try {
                    await sock.groupParticipantsUpdate(remoteJid, targets, cmd === "promote" ? "promote" : "demote");
                    await sock.sendMessage(remoteJid, {
                        text: cmd === "promote" ? `✅ Dijadikan admin.` : `✅ Dicopot dari admin.`,
                        mentions: targets
                    }, { quoted: msg });
                } catch (e) {
                    await sock.sendMessage(remoteJid, { text: `❌ Gagal: ${(e as any)?.message || e}` }, { quoted: msg });
                }
                break;
            }

            // ===== GROUP: OPEN / CLOSE (siapa yang bisa kirim pesan) =====
            case "open":
            case "close":
            case "mute":
            case "unmute": {
                const gate = await requireGroupAdmin(sock, remoteJid, msg, fromMe);
                if (!gate.ok) {
                    await sock.sendMessage(remoteJid, { text: gate.error! }, { quoted: msg });
                    return;
                }
                const lock = cmd === "close" || cmd === "mute";
                try {
                    await sock.groupSettingUpdate(remoteJid, lock ? "announcement" : "not_announcement");
                    await sock.sendMessage(remoteJid, {
                        text: lock ? "🔒 Grup ditutup — hanya admin yang bisa kirim pesan." : "🔓 Grup dibuka — semua anggota bisa kirim pesan."
                    }, { quoted: msg });
                } catch (e) {
                    await sock.sendMessage(remoteJid, { text: `❌ Gagal ubah pengaturan grup: ${(e as any)?.message || e}` }, { quoted: msg });
                }
                break;
            }

            default:
                // Ignore unknown commands
                break;
        }
    } catch (e) {
        logger.error("Bot", "Bot command error", e);
    }
}
