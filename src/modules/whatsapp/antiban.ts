import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// ============================================================
// ANTI-BAN HUMANIZER
// ------------------------------------------------------------
// WA makin ketat ke nomor yang ngirim "kayak bot" (instan, tanpa
// presence, spam cepat). Modul ini bikin pola kirim lebih manusiawi:
//   1. Subscribe presence ke lawan chat
//   2. Tampilkan status "mengetik"/"merekam" sebentar
//   3. Kasih jeda acak (skala panjang teks) sebelum benar-benar kirim
//   4. Set presence "paused" setelah kirim
//
// Dikontrol per-sesi lewat BotConfig (antiBanEnabled, dst).
// Semua best-effort: kalau gagal, JANGAN blokir pengiriman pesan.
// ============================================================

interface AntiBanConfig {
    antiBanEnabled: boolean;
    antiBanTyping: boolean;
    antiBanReadFirst: boolean;
    antiBanMinDelay: number;
    antiBanMaxDelay: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class AntiBanManager {
    private static instance: AntiBanManager;
    private cache: Map<string, { config: AntiBanConfig | null; at: number }> = new Map();

    static getInstance() {
        if (!AntiBanManager.instance) AntiBanManager.instance = new AntiBanManager();
        return AntiBanManager.instance;
    }

    clearCache(sessionId: string) {
        this.cache.delete(sessionId);
    }

    private async getConfig(sessionId: string): Promise<AntiBanConfig | null> {
        const cached = this.cache.get(sessionId);
        if (cached && Date.now() - cached.at < 10000) return cached.config;

        try {
            const session = await prisma.session.findUnique({
                where: { sessionId },
                select: {
                    botConfig: {
                        select: {
                            antiBanEnabled: true,
                            antiBanTyping: true,
                            antiBanReadFirst: true,
                            antiBanMinDelay: true,
                            antiBanMaxDelay: true
                        }
                    }
                }
            });

            const row = session?.botConfig;
            // Default: aktif walau botConfig belum ada (aman by default)
            const config: AntiBanConfig = row
                ? {
                      antiBanEnabled: row.antiBanEnabled ?? true,
                      antiBanTyping: row.antiBanTyping ?? true,
                      antiBanReadFirst: row.antiBanReadFirst ?? false,
                      antiBanMinDelay: Number(row.antiBanMinDelay) || 600,
                      antiBanMaxDelay: Number(row.antiBanMaxDelay) || 2500
                  }
                : {
                      antiBanEnabled: true,
                      antiBanTyping: true,
                      antiBanReadFirst: false,
                      antiBanMinDelay: 600,
                      antiBanMaxDelay: 2500
                  };

            this.cache.set(sessionId, { config, at: Date.now() });
            return config;
        } catch (e) {
            logger.debug("Anti-Ban", `Config fetch gagal untuk ${sessionId}`, e);
            this.cache.set(sessionId, { config: null, at: Date.now() });
            return null;
        }
    }

    /** Jenis konten yang TIDAK perlu dihumanize (presence/koreksi). */
    private shouldSkip(content: any): boolean {
        if (!content || typeof content !== "object") return true;
        if (content.react || content.delete || content.edit || content.protocolMessage) return true;
        // presence / status update bukan kiriman pesan biasa
        if (content.disappearingMessagesInChat !== undefined) return true;
        return false;
    }

    private presenceFor(content: any): "composing" | "recording" {
        if (content?.audio && content?.ptt) return "recording";
        return "composing";
    }

    private estimateLength(content: any): number {
        if (!content) return 0;
        if (typeof content.text === "string") return content.text.length;
        if (typeof content.caption === "string") return content.caption.length;
        return 0;
    }

    /**
     * Jalankan humanizer sebelum pesan benar-benar dikirim.
     * @param sock socket Baileys
     * @param sessionId id sesi
     * @param jid tujuan
     * @param content payload pesan
     */
    async humanize(sock: any, sessionId: string, jid: string, content: any): Promise<void> {
        try {
            if (!sock || !jid || this.shouldSkip(content)) return;

            const config = await this.getConfig(sessionId);
            if (!config || !config.antiBanEnabled) return;

            const presence = this.presenceFor(content);

            // Tandai dibaca dulu (opsional)
            if (config.antiBanReadFirst) {
                await sock.sendPresenceUpdate("available", jid).catch(() => {});
            }

            if (config.antiBanTyping) {
                await sock.presenceSubscribe?.(jid).catch?.(() => {});
                await sock.sendPresenceUpdate(presence, jid).catch(() => {});
            }

            // Jeda manusiawi: base acak + tambahan kecil sesuai panjang teks
            const min = Math.max(0, config.antiBanMinDelay);
            const max = Math.max(min, config.antiBanMaxDelay);
            const base = Math.floor(Math.random() * (max - min + 1)) + min;
            const lenBonus = Math.min(2500, this.estimateLength(content) * 25); // ~25ms/char, cap 2.5s
            const delay = base + (config.antiBanTyping ? lenBonus : 0);

            await sleep(delay);

            if (config.antiBanTyping) {
                await sock.sendPresenceUpdate("paused", jid).catch(() => {});
            }
        } catch (e) {
            // best-effort — jangan pernah menggagalkan pengiriman
            logger.debug("Anti-Ban", "humanize error (diabaikan):", e);
        }
    }
}

export const antiban = AntiBanManager.getInstance();
