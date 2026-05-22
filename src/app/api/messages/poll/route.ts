import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/{jid}/poll instead.
 * This endpoint will be removed in a future version.
 */
// POST: Send poll message
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/poll is deprecated. Use POST /api/messages/{sessionId}/{jid}/poll instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, question, options, selectableCount } = body;

        if (!sessionId || !jid || !question || !options || !Array.isArray(options)) {
            return NextResponse.json({ status: false, message: "sessionId, jid, question, and options (array) are required", error: "sessionId, jid, question, and options (array) are required" }, { status: 400 });
        }

        if (options.length < 2 || options.length > 12) {
            return NextResponse.json({ status: false, message: "Poll must have between 2 and 12 options", error: "Poll must have between 2 and 12 options" }, { status: 400 });
        }

        const count = selectableCount || 1;
        if (count < 1 || count > options.length) {
            return NextResponse.json({ status: false, message: "selectableCount must be between 1 and number of options", error: "selectableCount must be between 1 and number of options" }, { status: 400 });
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

        // Send poll message
        await instance.socket.sendMessage(jid, {
            poll: {
                name: question,
                values: options,
                selectableCount: count
            }
        });

        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (error) {
        console.error("Send poll error:", error);
        return NextResponse.json({ status: false, message: "Failed to send poll", error: "Failed to send poll" }, { status: 500 });
    }
}
