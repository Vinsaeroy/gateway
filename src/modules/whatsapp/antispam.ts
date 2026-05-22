import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface AntiSpamConfig {
    antiSpamEnabled: boolean;
    spamLimit: number;
    spamInterval: number;
    spamDelayMin: number;
    spamDelayMax: number;
}

interface QueueItem {
    id: number;
    sessionId: string;
    jid: string;
    messageType: string;
    queuedAt: number;
    resolve: () => void;
    reject: (err: any) => void;
}

class AntiSpamManager {
    private static instance: AntiSpamManager;
    private sessionHistory: Map<string, number[]> = new Map();
    private configCache: Map<string, { config: AntiSpamConfig | null; cachedAt: number }> = new Map();
    private processing: Map<string, boolean> = new Map();
    private queues: Map<string, QueueItem[]> = new Map();
    private messageCounter = 0;

    private constructor() { }

    static getInstance() {
        if (!AntiSpamManager.instance) {
            AntiSpamManager.instance = new AntiSpamManager();
        }
        return AntiSpamManager.instance;
    }

    /**
     * Enqueue a message and wait for it to be processed.
     * Returns only when it's this message's turn to send.
     */
    async enqueue(sessionId: string, jid: string, content: any): Promise<void> {
        const config = await this.getAntiSpamConfig(sessionId);

        if (!config || !config.antiSpamEnabled) {
            return; // Anti-spam disabled, send immediately
        }

        const messageType = this.detectMessageType(content);
        const msgId = ++this.messageCounter;

        return new Promise<void>((resolve, reject) => {
            const item: QueueItem = {
                id: msgId,
                sessionId,
                jid,
                messageType,
                queuedAt: Date.now(),
                resolve,
                reject,
            };

            if (!this.queues.has(sessionId)) {
                this.queues.set(sessionId, []);
            }
            this.queues.get(sessionId)!.push(item);

            const queue = this.queues.get(sessionId)!;
            const position = queue.length;

            logger.debug("Anti-Spam", 
                `📥 QUEUED  | Session: ${sessionId} | #${msgId} | To: ${this.formatJid(jid)} | Type: ${messageType} | Queue position: ${position}`
            );

            // Start processing if not already running
            this.processQueue(sessionId);
        });
    }

    private async processQueue(sessionId: string) {
        if (this.processing.get(sessionId)) return; // Already processing
        this.processing.set(sessionId, true);

        const config = await this.getAntiSpamConfig(sessionId);
        if (!config) {
            this.processing.set(sessionId, false);
            return;
        }

        while (true) {
            const queue = this.queues.get(sessionId);
            if (!queue || queue.length === 0) break;

            const item = queue[0]; // Peek at front
            const now = Date.now();
            const history = this.sessionHistory.get(sessionId) || [];

            // Clean history: keep only messages in the current window
            const windowStart = now - (config.spamInterval * 1000);
            const recentMessages = history.filter(ts => ts > windowStart);
            this.sessionHistory.set(sessionId, recentMessages);

            if (recentMessages.length >= config.spamLimit) {
                // Rate limit reached — calculate and apply delay
                const delay = Math.floor(
                    Math.random() * (config.spamDelayMax - config.spamDelayMin + 1)
                ) + config.spamDelayMin;

                const sendAt = new Date(now + delay);
                const waitingSince = now - item.queuedAt;

                logger.warn("Anti-Spam", 
                    `⏳ DELAY   | Session: ${sessionId} | #${item.id} | Rate: ${recentMessages.length}/${config.spamLimit} in ${config.spamInterval}s | Delay: ${delay}ms | Send at: ${sendAt.toLocaleTimeString()} | Waiting: ${waitingSince}ms | Queue: ${queue.length} remaining`
                );

                await this.sleep(delay);

                // Re-fetch config (might have changed during delay)
                const freshConfig = await this.getAntiSpamConfig(sessionId);
                if (!freshConfig || !freshConfig.antiSpamEnabled) {
                    // Anti-spam was disabled during delay, flush all
                    logger.warn("Anti-Spam", `⚡ DISABLED | Session: ${sessionId} | Flushing ${queue.length} queued messages immediately`);
                    while (queue.length > 0) {
                        const q = queue.shift()!;
                        this.recordSend(sessionId);
                        q.resolve();
                    }
                    break;
                }
                continue; // Re-check rate after delay
            }

            // Rate is within limit — send this message
            queue.shift(); // Remove from queue
            this.recordSend(sessionId);

            const totalWait = now - item.queuedAt;
            const remainingInQueue = queue.length;

            if (totalWait > 50) {
                logger.success("Anti-Spam", 
                    `✅ SENDING | Session: ${sessionId} | #${item.id} | To: ${this.formatJid(item.jid)} | Type: ${item.messageType} | Waited: ${totalWait}ms | Queue: ${remainingInQueue} remaining`
                );
            } else {
                logger.success("Anti-Spam", 
                    `✅ INSTANT | Session: ${sessionId} | #${item.id} | To: ${this.formatJid(item.jid)} | Type: ${item.messageType} | Rate: ${recentMessages.length + 1}/${config.spamLimit} | Queue: ${remainingInQueue} remaining`
                );
            }

            item.resolve();
        }

        this.processing.set(sessionId, false);
    }

    private recordSend(sessionId: string) {
        const history = this.sessionHistory.get(sessionId) || [];
        history.push(Date.now());
        // Keep only last 60 seconds of history
        this.sessionHistory.set(
            sessionId,
            history.filter(ts => ts > Date.now() - 60000)
        );
    }

    private detectMessageType(content: any): string {
        if (!content) return "unknown";
        if (content.text) return "text";
        if (content.image) return "image";
        if (content.video) return "video";
        if (content.audio) return "audio";
        if (content.document) return "document";
        if (content.sticker) return "sticker";
        if (content.react) return "reaction";
        if (content.delete) return "delete";
        if (content.poll) return "poll";
        if (content.location) return "location";
        if (content.contact) return "contact";
        return "other";
    }

    private formatJid(jid: string): string {
        if (jid.endsWith("@s.whatsapp.net")) {
            return jid.replace("@s.whatsapp.net", "");
        }
        if (jid.endsWith("@g.us")) {
            return `group:${jid.replace("@g.us", "").slice(-6)}`;
        }
        return jid.slice(0, 15);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch anti-spam config with 10-second cache
     */
    private async getAntiSpamConfig(sessionId: string): Promise<AntiSpamConfig | null> {
        const cached = this.configCache.get(sessionId);
        if (cached && (Date.now() - cached.cachedAt) < 10000) {
            return cached.config;
        }

        try {
            const session = await prisma.session.findUnique({
                where: { sessionId },
                select: {
                    botConfig: {
                        select: {
                            antiSpamEnabled: true,
                            spamLimit: true,
                            spamInterval: true,
                            spamDelayMin: true,
                            spamDelayMax: true
                        }
                    }
                }
            });

            if (!session || !session.botConfig) {
                this.configCache.set(sessionId, { config: null, cachedAt: Date.now() });
                return null;
            }

            const row = session.botConfig;
            const config: AntiSpamConfig = {
                antiSpamEnabled: Boolean(row.antiSpamEnabled),
                spamLimit: Number(row.spamLimit) || 5,
                spamInterval: Number(row.spamInterval) || 10,
                spamDelayMin: Number(row.spamDelayMin) || 1000,
                spamDelayMax: Number(row.spamDelayMax) || 3000,
            };

            this.configCache.set(sessionId, { config, cachedAt: Date.now() });
            return config;
        } catch (error) {
            logger.error("Anti-Spam", `❌ ERROR   | Config fetch failed for ${sessionId}:`, error);
            this.configCache.set(sessionId, { config: null, cachedAt: Date.now() });
            return null;
        }
    }

    /** Clear cache for a session (call when config is updated) */
    clearCache(sessionId: string) {
        this.configCache.delete(sessionId);
    }
}

export const antispam = AntiSpamManager.getInstance();
