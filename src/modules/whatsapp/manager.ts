import { prisma } from "@/lib/prisma";
import { WhatsAppInstance } from "./instance";
import { Server } from "socket.io";
import { initScheduler } from "@/lib/cron";
import { logger } from "@/lib/logger";

export class WhatsAppManager {
    private static instance: WhatsAppManager;
    private sessions: Map<string, WhatsAppInstance> = new Map();
    public io: Server | null = null;
    private watchdogInterval: NodeJS.Timeout | null = null;

    private constructor() {
        initScheduler();
    }

    public static getInstance(): WhatsAppManager {
        if (!WhatsAppManager.instance) {
            WhatsAppManager.instance = new WhatsAppManager();
        }
        return WhatsAppManager.instance;
    }

    setup(io: Server) {
        this.io = io;
    }

    async loadSessions() {
        if (!this.io) throw new Error("Socket.IO not initialized in WhatsAppManager");
        // Jangan auto-start session yang LOGGED_OUT atau yang sengaja di-STOP user.
        // (Dulu STOPPED ikut ke-load → setelah container restart, session yang
        //  sudah di-stop malah connect sendiri.)
        const sessions = await prisma.session.findMany({
            where: { status: { notIn: ["LOGGED_OUT", "STOPPED"] } }
        });

        for (const session of sessions) {
            const instance = new WhatsAppInstance(session.sessionId, session.userId, this.io);
            this.sessions.set(session.sessionId, instance);
            await instance.init();
        }
        logger.success("Manager", `Loaded ${sessions.length} sessions.`);

        // Watchdog auto-reconnect berjalan di background (server-side) supaya
        // sesi yang putus sendiri (network blip, idle timeout, dll) otomatis
        // konek lagi tanpa user harus refresh / start manual.
        this.startWatchdog();
    }

    /**
     * Watchdog: tiap 45 detik memeriksa semua sesi.
     * 1. Sesi yang harusnya hidup tapi DISCONNECTED → reconnect otomatis.
     * 2. Sesi di DB yang harusnya hidup tapi hilang dari memori → di-load ulang.
     * Sesi yang di-stop user atau diambil alih koneksi lain (replaced) dilewati.
     */
    startWatchdog() {
        if (this.watchdogInterval) return;
        this.watchdogInterval = setInterval(() => {
            this.runWatchdog().catch((e) => logger.debug("Watchdog", "tick error (non-fatal)", e));
        }, 45_000);
        logger.info("Manager", "Session watchdog aktif (auto-reconnect tiap 45s).");
    }

    stopWatchdog() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
            this.watchdogInterval = null;
        }
    }

    private async runWatchdog() {
        if (!this.io) return;

        // 1) Reconnect sesi in-memory yang mati.
        for (const [sessionId, inst] of this.sessions) {
            if (inst.isStopped || !inst.autoReconnect) continue;

            // Sesi yang "CONNECTED" tapi websocket sebenarnya mati (zombie):
            // paksa reconnect supaya benar-benar online 24 jam.
            if (inst.status === "CONNECTED") {
                if (!inst.isSocketAlive() && Date.now() - inst.lastInitAt > 60_000 && !inst.initializing) {
                    logger.warn("Watchdog", `Sesi ${sessionId} CONNECTED tapi socket mati (zombie) → reconnect`);
                    inst.init().catch((e) => logger.error("Watchdog", `Reconnect zombie ${sessionId} gagal:`, e));
                }
                continue;
            }

            if (inst.status === "SCAN_QR") continue;
            if (inst.initializing || inst.reconnectPending) continue;
            // Beri waktu handshake setelah init terakhir sebelum coba lagi.
            if (Date.now() - inst.lastInitAt < 60_000) continue;

            logger.info("Watchdog", `Auto-reconnect sesi ${sessionId} (status ${inst.status})`);
            inst.init().catch((e) => logger.error("Watchdog", `Reconnect ${sessionId} gagal:`, e));
        }

        // 2) Load ulang sesi yang harusnya jalan tapi hilang dari memori.
        try {
            const dbSessions = await prisma.session.findMany({
                where: { status: { notIn: ["LOGGED_OUT", "STOPPED"] } },
                select: { sessionId: true, userId: true },
            });
            for (const s of dbSessions) {
                if (this.sessions.has(s.sessionId)) continue;
                logger.info("Watchdog", `Load ulang sesi yang hilang: ${s.sessionId}`);
                const inst = new WhatsAppInstance(s.sessionId, s.userId, this.io);
                this.sessions.set(s.sessionId, inst);
                inst.init().catch((e) => logger.error("Watchdog", `Init ${s.sessionId} gagal:`, e));
            }
        } catch {
            // DB error → lewati, coba lagi tick berikutnya.
        }
    }

    async createSession(userId: string, name: string, customSessionId?: string) {
        // Fallback to global IO if instance IO is missing (Next.js Context Issue)
        if (!this.io && (global as any).io) {
            this.io = (global as any).io;
        }

        if (!this.io) {
            logger.error("Manager", "Socket.IO not initialized in WhatsAppManager, and global fallback failed.");
            throw new Error("Socket.IO not initialized");
        }

        // Use custom ID if provided, otherwise generate random
        const sessionId = customSessionId || Math.random().toString(36).substring(7);

        const session = await prisma.session.create({
            data: {
                userId,
                name,
                sessionId,
                status: "DISCONNECTED",
                botConfig: {
                    create: {
                        enabled: true,
                        botMode: "OWNER",
                        autoReplyMode: "ALL"
                    }
                }
            }
        });

        const instance = new WhatsAppInstance(sessionId, userId, this.io);
        this.sessions.set(sessionId, instance);
        await instance.init();

        return session;
    }

    public getInstance(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    async deleteSession(sessionId: string) {
        const instance = this.sessions.get(sessionId);
        if (instance) {
            // Logout/Close socket
            instance.socket?.end(undefined);
            this.sessions.delete(sessionId);
        }
        // deleteMany is idempotent: tidak melempar P2025 kalau record sudah
        // terhapus (mis. delete ganda / balapan event dari socket zombie).
        await prisma.session.deleteMany({ where: { sessionId } });
    }

    /**
     * Cleanup an in-memory instance without touching the DB.
     * Used when the DB session has already been deleted but a zombie
     * Baileys socket is still emitting events.
     */
    cleanupOrphanInstance(sessionId: string) {
        const instance = this.sessions.get(sessionId);
        if (instance) {
            try {
                instance.isStopped = true;
                instance.socket?.end(undefined);
                instance.socket = null as any;
            } catch { /* ignore */ }
            this.sessions.delete(sessionId);
        }
    }

    async stopSession(sessionId: string) {
        const instance = this.sessions.get(sessionId);
        if (instance) {
            instance.isStopped = true; // Prevent auto-reconnect
            instance.socket?.end(undefined);
            instance.status = "STOPPED";
            this.io?.to(sessionId).emit("connection.update", { sessionId, status: "STOPPED", qr: null });
            await prisma.session.update({
                where: { sessionId },
                data: { status: "STOPPED" }
            });
        }
    }

    async startSession(sessionId: string) {
        // If already running, do nothing
        const existingInstance = this.sessions.get(sessionId);
        if (existingInstance && existingInstance.status === "CONNECTED") {
            return;
        }

        const session = await prisma.session.findUnique({ where: { sessionId } });
        if (!session) throw new Error("Session not found");

        // Re-initialize
        let instance = this.sessions.get(sessionId);
        if (!instance) {
            instance = new WhatsAppInstance(sessionId, session.userId, this.io!);
            this.sessions.set(sessionId, instance);
        }

        await instance.init();
    }

    async restartSession(sessionId: string) {
        await this.stopSession(sessionId);
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.startSession(sessionId);
    }

    async requestPairingCode(sessionId: string, phoneNumber: string) {
        const instance = this.sessions.get(sessionId);
        if (!instance) throw new Error("Instance not found or not running");
        return await instance.requestPairingCode(phoneNumber);
    }
}

const globalForWhatsapp = global as unknown as { waManager: WhatsAppManager };

export const waManager = globalForWhatsapp.waManager || WhatsAppManager.getInstance();

// Always store in global to ensure singleton across Next.js compilations/chunks
globalForWhatsapp.waManager = waManager;
