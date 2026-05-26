import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket,
    ConnectionState
} from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import { usePrismaAuthState } from "./auth/usePrismaAuthState";
import { Server } from "socket.io";
import pino from "pino";
import { bindSessionStore } from "./store";
import { syncGroups } from "./store/groups";
import { bindContactSync } from "./store/contacts";
import { bindAutoReply } from "./store/autoreply";
import { bindAntiLink } from "./store/antilink";
import { bindPpGuard } from "./store/ppguard";
import { antispam } from "./antispam";
import { logger } from "@/lib/logger";

export class WhatsAppInstance {
    socket: WASocket | null = null;
    qr: string | null = null;
    rq: string | null = null;
    status: string = "DISCONNECTED";
    sessionId: string;
    userId: string;
    io: Server;
    config: any = {};
    startTime: Date | null = null;
    pairingCode: string | null = null;
    private groupSyncInterval: NodeJS.Timeout | null = null;

    isStopped: boolean = false;

    constructor(sessionId: string, userId: string, io: Server) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.io = io;
    }

    async init() {
        const sessionData = await prisma.session.findUnique({
            where: { sessionId: this.sessionId },
            include: { botConfig: true }
        });
        this.config = sessionData?.config || {};
        const botConfig = (sessionData as any)?.botConfig;

        const { state, saveCreds } = await usePrismaAuthState(this.sessionId);
        const { version } = await fetchLatestBaileysVersion();

        // Force silent logger to prevent Baileys debug spam (Railway log rate limit)
        const silentLogger = pino({ level: "silent" }) as any;

        this.socket = makeWASocket({
            version,
            logger: silentLogger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
            },
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            markOnlineOnConnect: botConfig?.alwaysOnline ?? true,
            syncFullHistory: false, // Use partial sync only
        });

        // Apply Anti-Spam Wrapper to sendMessage
        // This wraps the socket's sendMessage so ALL outgoing messages go through the queue
        const originalSendMessage = this.socket.sendMessage.bind(this.socket);
        const sessionId = this.sessionId;
        this.socket.sendMessage = async function (jid: string, content: any, options?: any) {
            await antispam.enqueue(sessionId, jid, content);
            return originalSendMessage(jid, content, options);
        } as any;

        // Bind Store for DB Sync (handles incoming messages)
        bindSessionStore(this.socket, this.sessionId, this.io);

        // Bind Contact Sync (handles contacts.update and messaging-history.set events)
        bindContactSync(this.socket, this.sessionId);

        this.socket.ev.on("creds.update", saveCreds);

        this.socket.ev.on("connection.update", async (update) => {
            await this.handleConnectionUpdate(update);
        });
    }

    async handleConnectionUpdate(update: Partial<ConnectionState>) {
        const { connection, lastDisconnect, qr } = update;

        try {
            if (qr) {
                if (this.isStopped) return; // Don't emit QR if stopped
                this.qr = qr;
                this.status = "SCAN_QR";

                // Emit QR to Socket Room
                this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr });

                // Update DB
                await prisma.session.update({
                    where: { sessionId: this.sessionId },
                    data: { qr, status: "SCAN_QR" }
                });
            }

            if (connection === "close") {
                const code = (lastDisconnect?.error as any)?.output?.statusCode;
                const isLoggedOut = code === DisconnectReason.loggedOut;

                // Stop the periodic group sync interval
                if (this.groupSyncInterval) {
                    clearInterval(this.groupSyncInterval);
                    this.groupSyncInterval = null;
                }

                // Only reconnect if NOT logged out AND NOT explicitly stopped
                const shouldReconnect = !isLoggedOut && !this.isStopped;

                // Determine status based on reason
                if (isLoggedOut) {
                    this.status = "LOGGED_OUT";
                } else if (this.isStopped) {
                    this.status = "STOPPED";
                } else {
                    this.status = "DISCONNECTED";
                }

                this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr: null });

                // Use try-catch specifically for update as session might be deleted
                try {
                    await prisma.session.update({
                        where: { sessionId: this.sessionId },
                        data: { status: this.status, qr: null }
                    });
                } catch (e) {
                    // Ignore if session not found (deleted)
                }

                if (shouldReconnect) {
                    // Connection lost unexpectedly, reconnect
                    this.init();
                } else if (isLoggedOut) {
                    // Explicit logout: delete credentials
                    logger.info("Instance", `Session ${this.sessionId} logged out. Deleting credentials...`);
                    try {
                        await prisma.$transaction([
                            prisma.session.update({
                                where: { sessionId: this.sessionId },
                                data: { status: "LOGGED_OUT", qr: null }
                            }),
                            prisma.authState.deleteMany({
                                where: { sessionId: this.sessionId }
                            })
                        ]);
                    } catch (e) { /* ignore */ }
                    this.socket = null;
                    this.config = {}; // Clear config cache
                    logger.success("Instance", `Session ${this.sessionId} credentials deleted.`);
                } else if (this.isStopped) {
                    // Stopped: preserve credentials for future restart
                    logger.warn("Instance", `Session ${this.sessionId} stopped. Credentials preserved for auto-login.`);
                    this.socket = null;
                }
            }


            if (connection === "open") {
                this.status = "CONNECTED";
                this.qr = null;
                this.startTime = new Date();

                this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr: null });

                // Sync Groups from WhatsApp (with error handling)
                try {
                    await syncGroups(this.socket as WASocket, this.sessionId);
                } catch (e) {
                    logger.error("Instance", "Group sync failed:", e);
                }

                // Periodic resync every 10 minutes — catches groups that missed
                // the realtime upsert event (e.g. mobile app added user offline)
                if (this.groupSyncInterval) clearInterval(this.groupSyncInterval);
                this.groupSyncInterval = setInterval(async () => {
                    if (!this.socket || this.isStopped) return;
                    try {
                        await syncGroups(this.socket as WASocket, this.sessionId);
                    } catch (e) {
                        logger.debug("Instance", "Periodic group sync failed (non-fatal)", e);
                    }
                }, 10 * 60 * 1000);

                // Sync Newsletter/Channel names
                this.syncNewsletterNames().catch(e => {
                    logger.error("Instance", "Newsletter sync failed:", e);
                });

                // Bind Auto Reply (only if socket still exists)
                if (this.socket) {
                    bindAutoReply(this.socket as WASocket, this.sessionId);
                }

                // Bind Anti-Link (group link blocker)
                if (this.socket) {
                    bindAntiLink(this.socket as WASocket, this.sessionId);
                }

                // Bind PP Guard (only if socket still exists)
                if (this.socket) {
                    bindPpGuard(this.socket as WASocket, this.sessionId);
                }

                await prisma.session.update({
                    where: { sessionId: this.sessionId },
                    data: { status: "CONNECTED", qr: null }
                });

                logger.success("Instance", `Session ${this.sessionId} connected and synced successfully`);
            }
        } catch (error: any) {
            // Catch global errors in handler (like Record Not Found if session deleted mid-process)
            if (error.code === 'P2025') {
                logger.warn("Instance", `Session ${this.sessionId} record not found during update. Stopping instance.`);
                try {
                    // Defer to break circular import — manager already imports from instance
                    const { waManager } = await import("./manager");
                    waManager.cleanupOrphanInstance(this.sessionId);
                } catch {
                    this.socket?.end(undefined);
                    this.socket = null;
                }
            } else {
                logger.error("Instance", "Error in handleConnectionUpdate:", error);
            }
        }
    }

    async requestPairingCode(phoneNumber: string) {
        if (!this.socket) {
            throw new Error("Socket not initialized");
        }

        try {
            // Validate phone number (basic check)
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (!cleanNumber) throw new Error("Invalid phone number");

            const code = await this.socket.requestPairingCode(cleanNumber);
            this.pairingCode = code;
            this.status = "SCAN_QR"; // Or specialized status? "PAIRING" is better but SCAN_QR triggers the right UI blocks usually

            // Emit update
            this.io?.to(this.sessionId).emit("connection.update", {
                status: this.status,
                qr: this.qr,
                pairingCode: code
            });

            return code;
        } catch (error) {
            logger.error("Instance", "Pairing code error:", error);
            throw error;
        }
    }

    /**
     * Sync newsletter/channel names from WhatsApp.
     * Fetches metadata for all newsletter JIDs that don't have a name in the database.
     */
    private async syncNewsletterNames() {
        if (!this.socket) return;

        // Wait a bit for history sync to complete first
        await new Promise(resolve => setTimeout(resolve, 5000));

        const session = await prisma.session.findUnique({
            where: { sessionId: this.sessionId },
            select: { id: true }
        });
        if (!session) return;

        // Find all newsletter JIDs from messages
        const newsletterMessages = await prisma.message.findMany({
            where: {
                sessionId: session.id,
                remoteJid: { endsWith: "@newsletter" }
            },
            distinct: ['remoteJid'],
            select: { remoteJid: true }
        });

        // Also check contacts table for newsletters
        const newsletterContacts = await prisma.contact.findMany({
            where: {
                sessionId: session.id,
                jid: { endsWith: "@newsletter" }
            },
            select: { jid: true, name: true }
        });

        const contactNameMap = new Map(newsletterContacts.map(c => [c.jid, c.name]));

        // Collect all newsletter JIDs
        const allNewsletterJids = new Set([
            ...newsletterMessages.map(m => m.remoteJid),
            ...newsletterContacts.map(c => c.jid)
        ]);

        // Filter out ones that already have names
        const jidsNeedingNames = Array.from(allNewsletterJids).filter(jid => !contactNameMap.get(jid));

        logger.info("Instance", `Newsletter sync: ${allNewsletterJids.size} total, ${jidsNeedingNames.length} need names (session: ${this.sessionId})`);

        if (jidsNeedingNames.length === 0) return;

        let synced = 0;
        for (const jid of jidsNeedingNames) {
            if (!this.socket) break; // Socket might disconnect during sync
            try {
                const metadata = await this.socket.newsletterMetadata("jid", jid);
                // Handle different response formats from Baileys
                let channelName: string | null = null;
                if (metadata) {
                    if (typeof metadata.name === 'string' && metadata.name) {
                        channelName = metadata.name;
                    } else if ((metadata as any).thread_metadata?.name?.text) {
                        channelName = (metadata as any).thread_metadata.name.text;
                    } else if ((metadata as any).thread_metadata?.name && typeof (metadata as any).thread_metadata.name === 'string') {
                        channelName = (metadata as any).thread_metadata.name;
                    }
                }

                if (channelName) {
                    await prisma.contact.upsert({
                        where: { sessionId_jid: { sessionId: session.id, jid } },
                        create: {
                            sessionId: session.id,
                            jid,
                            name: channelName,
                            notify: channelName,
                            profilePic: metadata?.picture?.url || (metadata?.picture as any)?.directPath || null
                        },
                        update: {
                            name: channelName,
                            notify: channelName,
                            profilePic: metadata?.picture?.url || (metadata?.picture as any)?.directPath || undefined
                        }
                    });
                    synced++;
                    logger.info("Instance", `Newsletter "${channelName}" (${jid})`);
                } else {
                    logger.warn("Instance", `Newsletter ${jid}: no name in response: ${JSON.stringify(metadata).slice(0, 300)}`);
                }
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e: any) {
                logger.warn("Instance", `Newsletter ${jid} failed: ${e.message || e}`);
            }
        }

        logger.success("Instance", `Newsletter sync done: ${synced}/${jidsNeedingNames.length} names fetched`);
    }
}
