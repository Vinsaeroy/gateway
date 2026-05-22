import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/{jid}/spam instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/spam is deprecated. Use POST /api/messages/{sessionId}/{jid}/spam instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, message, count = 10, delay = 500 } = body; 
        
        if (!sessionId || !jid || !message) {
             return NextResponse.json({ status: false, message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
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

        // Run in background
        (async () => {
             for (let i = 0; i < count; i++) {
                 try {
                     await instance.socket!.sendMessage(jid, { text: message });
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
