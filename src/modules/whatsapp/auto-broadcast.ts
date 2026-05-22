import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";
import { logger } from "@/lib/logger";

/**
 * Auto Broadcast Cron Job
 * Runs every minute, checks if any auto broadcast is due to send
 */
export function startAutoBroadcast() {
    logger.info("AutoBroadcast", "Auto Broadcast scheduler started");

    // Check every minute
    cron.schedule("* * * * *", async () => {
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

                // Check if it's time to send
                const lastSent = broadcast.lastSentAt;
                const intervalMs = broadcast.intervalMin * 60 * 1000;

                if (lastSent && (now.getTime() - lastSent.getTime()) < intervalMs) {
                    continue; // Not yet time
                }

                // Time to send!
                logger.info("AutoBroadcast", `Sending broadcast "${broadcast.name}" for session ${broadcast.session.sessionId}`);

                const instance = waManager.getInstance(broadcast.session.sessionId);
                if (!instance || !instance.socket) continue;

                // Determine target groups
                let targetJids: string[] = [];
                const targets = broadcast.targets as string[];

                if (targets.includes("ALL")) {
                    // Get all groups for this session
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
                    continue;
                }

                // Send to each group
                let sentCount = 0;
                for (const jid of targetJids) {
                    try {
                        if (broadcast.mediaUrl && broadcast.mediaType) {
                            // Send media with caption
                            const mediaContent: any = {};
                            
                            if (broadcast.mediaType === "image") {
                                mediaContent.image = { url: broadcast.mediaUrl };
                                mediaContent.caption = broadcast.message;
                            } else if (broadcast.mediaType === "video") {
                                mediaContent.video = { url: broadcast.mediaUrl };
                                mediaContent.caption = broadcast.message;
                            } else if (broadcast.mediaType === "document") {
                                mediaContent.document = { url: broadcast.mediaUrl };
                                mediaContent.caption = broadcast.message;
                            }

                            await instance.socket.sendMessage(jid, mediaContent);
                        } else {
                            // Send text only
                            await instance.socket.sendMessage(jid, { text: broadcast.message });
                        }
                        sentCount++;

                        // Delay between messages to avoid spam detection
                        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
                    } catch (e) {
                        logger.error("AutoBroadcast", `Failed to send to ${jid}:`, e);
                    }
                }

                // Update lastSentAt
                await prisma.autoBroadcast.update({
                    where: { id: broadcast.id },
                    data: { lastSentAt: now }
                });

                logger.success("AutoBroadcast", `Broadcast "${broadcast.name}" sent to ${sentCount}/${targetJids.length} groups`);
            }
        } catch (error) {
            logger.error("AutoBroadcast", "Error in auto broadcast loop:", error);
        }
    });
}
