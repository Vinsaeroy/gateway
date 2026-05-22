import { prisma } from "@/lib/prisma";
import type { WASocket, GroupMetadata } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

export async function syncGroups(sock: WASocket, sessionId: string) {
    try {
        // Verify session exists and get the actual database ID
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });
        
        if (!session) {
            logger.error("Store", `Session ${sessionId} does not exist, cannot sync groups`);
            return;
        }

        // Use session.id (cuid) for foreign key, not sessionId string
        const dbSessionId = session.id;

        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups);

        logger.info("Store", `Found ${groupList.length} groups for session ${sessionId}`);

        for (const g of groupList) {
             try {
                 await prisma.group.upsert({
                     where: { sessionId_jid: { sessionId: dbSessionId, jid: g.id } },
                     create: {
                         sessionId: dbSessionId,
                         jid: g.id,
                         subject: g.subject,
                         description: g.desc,
                         ownerJid: g.owner,
                         creation: g.creation ? new Date(g.creation * 1000) : undefined,
                         restrict: g.restrict,
                         announce: g.announce,
                         participants: g.participants as any,
                         metadata: g as any,
                         isCommunity: g.isCommunity || false,
                         linkedParentJid: g.linkedParent || null
                     },
                     update: {
                         subject: g.subject,
                         description: g.desc,
                         ownerJid: g.owner,
                         restrict: g.restrict,
                         announce: g.announce,
                         participants: g.participants as any,
                         metadata: g as any,
                         isCommunity: g.isCommunity || false,
                         linkedParentJid: g.linkedParent || null
                     }
                 });
             } catch (e) {
                 console.error(`Failed to sync group ${g.id}`, e);
             }
        }
        logger.success("Store", `Synced ${groupList.length} groups for session ${sessionId}`);
    } catch (e) {
        logger.error("Store", "Failed to sync groups", e);
    }
}
