import { z } from "zod";

export const createGroupSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required"),
    subject: z.string().min(1, "Group subject is required").max(100, "Subject too long"),
    participants: z.array(z.string().regex(/@s\.whatsapp\.net$/, "Invalid participant JID")).min(1, "At least one participant required")
});

// Message content for Baileys - can be text object or media object
export const messageContentSchema = z.union([
    z.object({ text: z.string() }),
    z.object({ image: z.object({ url: z.string() }), caption: z.string().optional() }),
    z.object({ video: z.object({ url: z.string() }), caption: z.string().optional() }),
    z.object({ document: z.object({ url: z.string() }), mimetype: z.string().optional(), fileName: z.string().optional() }),
]);

export const broadcastSchema = z.object({
    sessionId: z.string().min(1),
    recipients: z.array(z.string()).min(1),
    message: z.string().min(1), // Accept string from frontend, convert to object in API
    delay: z.number().min(500).max(60000).optional().default(2000)
});

export const stickerSchema = z.object({
    sessionId: z.string().min(1),
    jid: z.string().min(1),
    // File validation handled separately as it comes from FormData
});
