import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/contacts/{sessionId}/{jid}/block instead.
 * This endpoint will be removed in a future version.
 */
// POST: Block a contact
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/contacts/block is deprecated. Use POST /api/contacts/{sessionId}/{jid}/block instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid } = body;

        if (!sessionId || !jid) {
            return NextResponse.json({ status: false, message: "sessionId and jid are required", error: "sessionId and jid are required" }, { status: 400 });
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

        // Block contact
        await instance.socket.updateBlockStatus(jid, "block");

        return NextResponse.json({ status: true, message: "Contact blocked successfully" });

    } catch (error) {
        console.error("Block contact error:", error);
        return NextResponse.json({ status: false, message: "Failed to block contact", error: "Failed to block contact" }, { status: 500 });
    }
}
