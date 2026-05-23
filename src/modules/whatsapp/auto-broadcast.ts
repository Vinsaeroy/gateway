import cron from "node-cron";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";
import { logger } from "@/lib/logger";

// Lock to prevent double execution
let isRunning = false;

// Track broadcasts currently being sent (prevent same broadcast from running twice)
const activeBroadcasts = new Set<string>();

/**
 * Auto Broadcast Cron Job
 * Runs every minute, checks if any auto broadcast is due to send
 */
export function startAutoBroadcast() {
    logger.info("AutoBroadcast", "Auto Broadcast scheduler started");

    // Check every minute
    cron.schedule("* * * * *", async () => {
        // Global lock — skip if previous run is still executing
        if (isRunning) {
            return;
        }

        isRunning = true;

        try {
            const now = new Date();

            // Find all active auto broadcasts
            const broadcasts = await prisma.autoBroadcast.findMany({
                where: { isActive: true },
                include: {
                    session: {
                        select: { sessionId: true, status: true }
                    }
                }
            });

            for (const broadcast of broadcasts) {
                // Skip if session is not connected
                if (broadcast.session.status !== "CONNECTED") continue;

                // Skip if this broadcast is already being sent
                if (activeBroadcasts.has(broadcast.id)) continue;

                // Check if it's time to send
                const lastSent = broadcast.lastSentAt;
                const intervalMs = broadcast.intervalMin * 60 * 1000;

                if (lastSent && (now.getTime() - lastSent.getTime()) < intervalMs) {
                    continue; // Not yet time
                }

                // Mark as active BEFORE sending to prevent double trigger
                activeBroadcasts.add(broadcast.id);

                // Update lastSentAt IMMEDIATELY to prevent next cron tick from picking it up
                await prisma.autoBroadcast.update({
                    where: { id: broadcast.id },
                    data: { lastSentAt: now }
                });

                // Send in background (don't block the loop)
                sendBroadcast(broadcast).finally(() => {
                    activeBroadcasts.delete(broadcast.id);
                });
            }
        } catch (error) {
            logger.error("AutoBroadcast", "Error in auto broadcast loop:", error);
        } finally {
            isRunning = false;
        }
    });
}

/**
 * Send broadcast to all target groups
 */
async function sendBroadcast(broadcast: any) {
    try {
        logger.info("AutoBroadcast", `Sending broadcast "${broadcast.name}" for session ${broadcast.session.sessionId}`);

        const instance = waManager.getInstance(broadcast.session.sessionId);
        if (!instance || !instance.socket) return;

        // Determine target groups
        let targetJids: string[] = [];
        const targets = broadcast.targets as string[];

        if (targets.includes("ALL")) {
            const groups = await prisma.group.findMany({
                where: { sessionId: broadcast.sessionId },
                select: { jid: true }
            });
            targetJids = groups.map(g => g.jid);
        } else {
            targetJids = targets;
        }

        if (targetJids.length === 0) {
            logger.warn("AutoBroadcast", `No targets for broadcast "${broadcast.name}"`);
            return;
        }

        // Send to each group
        let sentCount = 0;
        for (const jid of targetJids) {
            try {
                if (broadcast.mediaUrl && broadcast.mediaType) {
                    const mediaContent: any = {};
                    let mediaSource: any;

                    // Check if media is local file or URL
                    if (broadcast.mediaUrl.startsWith("/api/media/")) {
                        // Local file — read from disk
                        const filename = broadcast.mediaUrl.replace("/api/media/", "");

                        // Security: prevent path traversal
                        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
                            logger.warn("AutoBroadcast", `Invalid filename: ${filename}`);
                            continue;
                        }

                        const mediaDir = path.join(process.cwd(), "data", "media");
                        const filePath = path.join(mediaDir, filename);

                        // Ensure resolved path is within mediaDir
                        const resolved = path.resolve(filePath);
                        if (!resolved.startsWith(path.resolve(mediaDir))) {
                            logger.warn("AutoBroadcast", `Path traversal attempt: ${filename}`);
                            continue;
                        }

                        if (fs.existsSync(filePath)) {
                            mediaSource = fs.readFileSync(filePath);
                        } else {
                            logger.warn("AutoBroadcast", `Media file not found: ${filePath}`);
                            // Skip media — send as text only
                            await instance.socket.sendMessage(jid, { text: broadcast.message });
                            sentCount++;
                            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
                            continue;
                        }
                    } else {
                        mediaSource = { url: broadcast.mediaUrl };
                    }

                    if (broadcast.mediaType === "image") {
                        mediaContent.image = mediaSource;
                        mediaContent.caption = broadcast.message;
                    } else if (broadcast.mediaType === "video") {
                        mediaContent.video = mediaSource;
                        mediaContent.caption = broadcast.message;
                    } else if (broadcast.mediaType === "document") {
                        mediaContent.document = mediaSource;
                        mediaContent.caption = broadcast.message;
                    }

                    await instance.socket.sendMessage(jid, mediaContent);
                } else {
                    await instance.socket.sendMessage(jid, { text: broadcast.message });
                }
                sentCount++;

                // Delay between messages to avoid spam detection (2-5 seconds random)
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            } catch (e) {
                logger.error("AutoBroadcast", `Failed to send to ${jid}:`, e);
            }
        }

        logger.success("AutoBroadcast", `Broadcast "${broadcast.name}" sent to ${sentCount}/${targetJids.length} groups`);
    } catch (error) {
        logger.error("AutoBroadcast", `Error sending broadcast "${broadcast.name}":`, error);
    }
}
