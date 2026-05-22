import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import type { AnyMessageContent } from "@whiskeysockets/baileys";
import { z } from "zod";

const broadcastBodySchema = z.object({
    recipients: z.array(z.string()),
    message: z.string().min(1),
    delay: z.number().optional()
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const body = await request.json();
        
        const parseResult = broadcastBodySchema.safeParse(body);
        if (!parseResult.success) {
             return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
        }
        
        const { recipients, message, delay } = parseResult.data;

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const messageContent: AnyMessageContent = { text: message };
        const io = (global as any).io;
        const broadcastId = `bc_${Date.now()}`;
        const total = recipients.length;

        // Emit initial state
        if (io) {
            io.to(sessionId).emit("broadcast.progress", {
                broadcastId,
                status: "running",
                total,
                sent: 0,
                failed: 0,
                current: null,
                startedAt: new Date().toISOString()
            });
        }

        // Process in background
        (async () => {
            let sent = 0;
            let failed = 0;
            const errors: { jid: string; error: string }[] = [];

             for (let i = 0; i < recipients.length; i++) {
                 const jid = recipients[i];
                 try {
                     await instance.socket!.sendMessage(jid, messageContent);
                     sent++;
                 } catch (e: any) {
                     failed++;
                     errors.push({ jid, error: e.message || "Unknown error" });
                     console.error(`Failed to send broadcast to ${jid}`, e);
                 }

                 if (io) {
                     io.to(sessionId).emit("broadcast.progress", {
                         broadcastId,
                         status: "running",
                         total,
                         sent,
                         failed,
                         current: jid,
                         progress: Math.round(((sent + failed) / total) * 100)
                     });
                 }

                 if (i < recipients.length - 1) {
                     const baseDelay = delay || 2000;
                     const randomDelay = baseDelay + Math.floor(Math.random() * (baseDelay * 0.5));
                     await new Promise(r => setTimeout(r, randomDelay));
                 }
             }

             if (io) {
                 io.to(sessionId).emit("broadcast.progress", {
                     broadcastId,
                     status: "completed",
                     total,
                     sent,
                     failed,
                     errors,
                     progress: 100,
                     completedAt: new Date().toISOString()
                 });
             }
             console.log(`Broadcast ${broadcastId} completed: ${sent} sent, ${failed} failed out of ${total}`);
        })();
        
        return NextResponse.json({ status: true, message: "Broadcast started", data: { broadcastId, total } });

    } catch (e) {
        console.error("Broadcast error", e);
        return NextResponse.json({ status: false, message: "Failed to start broadcast", error: "Failed to start broadcast" }, { status: 500 });
    }
}
