import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send spam messages
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const body = await request.json();
        const { message, count = 10, delay = 500 } = body; 
        
        if (!message) {
             return NextResponse.json({ status: false, message: "message is required", error: "message is required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const decodedJid = decodeURIComponent(jid);

        // Run in background
        (async () => {
             for (let i = 0; i < count; i++) {
                 try {
                     await instance.socket!.sendMessage(decodedJid, { text: message });
                     await new Promise(r => setTimeout(r, delay));
                 } catch (e) {
                     console.error(`Spam failed ${i}`, e);
                 }
             }
        })();
        
        return NextResponse.json({ status: true, message: `Bombing ${count} messages started` });

    } catch (e) {
        console.error("Spam error", e);
        return NextResponse.json({ status: false, message: "Failed to start spam", error: "Failed to start spam" }, { status: 500 });
    }
}
