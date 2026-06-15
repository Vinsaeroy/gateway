import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";
import { logger } from "@/lib/logger";
import { userPlanAllows } from "@/lib/plans-store";

const checkScheduledMessages = async () => {
    try {
        const now = new Date();
        logger.debug("Scheduler", `Checking for messages due before ${now.toISOString()}...`);

        const pendingMessages = await prisma.scheduledMessage.findMany({
            where: {
                status: "PENDING",
                sendAt: { lte: now }
            }
        });

        if (pendingMessages.length > 0) {
            logger.info("Scheduler", `Found ${pendingMessages.length} pending messages.`);
        }

        for (const msg of pendingMessages) {
            // Plan gating: skip kalau plan pemilik session tidak mengizinkan scheduler.
            const ownerSess = await prisma.session.findUnique({
                where: { id: msg.sessionId },
                select: { userId: true }
            });
            if (ownerSess && !(await userPlanAllows(ownerSess.userId, "scheduler"))) {
                logger.debug("Scheduler", `Skip msg ${msg.id}: plan tidak mengizinkan scheduler`);
                continue;
            }

            const instance = waManager.getInstance(msg.sessionId);

            if (instance?.socket) {
                try {
                    let content: any = {};
                    if (msg.mediaUrl) {
                        const url = msg.mediaUrl;
                        const type = msg.mediaType || 'image'; // Default to image if null

                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`Failed to fetch media from URL: ${res.status} ${res.statusText}`);
                        const buffer = Buffer.from(await res.arrayBuffer());

                        if (type === 'video') {
                            content = { video: buffer, caption: msg.content };
                        } else if (type === 'document') {
                            content = { document: buffer, caption: msg.content, fileName: url.split('/').pop() || 'file', mimetype: 'application/octet-stream' };
                        } else {
                            content = { image: buffer, caption: msg.content };
                        }
                    } else {
                        content = { text: msg.content };
                    }

                    await instance.socket.sendMessage(msg.jid, content);

                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "SENT" }
                    });
                    logger.success("Scheduler", `Msg ${msg.id} sent to ${msg.jid}`);

                } catch (err) {
                    logger.error("Scheduler", `Failed to send scheduled msg ${msg.id}`, err);
                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "FAILED" }
                    });
                }
            } else {
                logger.warn("Scheduler", `Session ${msg.sessionId} not connected for scheduled msg ${msg.id}`);
                // Optionally mark as failed or leave pending
            }
        }
    } catch (e: any) {
        const code = e?.code;
        // Error koneksi transient (mis. Neon free-tier cold start / auto-suspend).
        // Jangan teriak ERROR — cukup warning ringan & skip siklus, nanti dicoba lagi.
        const connErrors = ["P1001", "P1002", "P1008", "P1017"];
        if (connErrors.includes(code)) {
            logger.warn("Scheduler", `Database belum siap (${code}) — skip siklus ini, dicoba lagi 30s lagi.`);
        } else {
            const detail = e?.message || String(e);
            logger.error("Scheduler", `Error executing scheduler loop:${code ? ` [${code}]` : ""} ${detail}`);
        }
    }
};

export function startScheduler() {
    logger.info("Scheduler", "Starting Message Scheduler...");

    // Run immediately on start
    checkScheduledMessages();

    // Then run every 30 seconds
    setInterval(checkScheduledMessages, 30 * 1000);
}
