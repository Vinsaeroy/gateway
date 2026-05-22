import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Toggle ephemeral/disappearing messages
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }
        
        const { sessionId, jid } = await params;
        const decodedJid = decodeURIComponent(jid);
        const body = await request.json();
        const { expiration } = body; // expiration is duration in seconds

        if (expiration === undefined) {
            return NextResponse.json({ status: false, message: "expiration is required", error: "expiration is required" }, { status: 400 });
        }

        // Expiration values: 0 (off), 86400 (1 day), 604800 (7 days), 7776000 (90 days)
        const validExpirations = [0, 86400, 604800, 7776000];
        if (!validExpirations.includes(expiration)) {
            return NextResponse.json({ status: false, message: "Invalid expiration. Must be 0 (off), 86400 (1 day), 604800 (7 days), or 7776000 (90 days)", error: "Invalid expiration. Must be 0 (off), 86400 (1 day), 604800 (7 days), or 7776000 (90 days)" }, { status: 400 });
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

        // Toggle ephemeral messages
        await instance.socket.groupToggleEphemeral(decodedJid, expiration);

        const expirationLabels: Record<number, string> = {
            0: 'off',
            86400: '1 day',
            604800: '7 days',
            7776000: '90 days'
        };

        return NextResponse.json({ 
            success: true,
            message: `Disappearing messages ${expiration === 0 ? 'disabled' : 'enabled'}`,
            expiration,
            expirationLabel: expirationLabels[expiration]
        });

    } catch (error: any) {
        console.error("Toggle ephemeral error:", error);
        
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ status: false, message: "Bot must be admin to toggle ephemeral messages", error: "Bot must be admin to toggle ephemeral messages" }, { status: 403 });
        }
        
        return NextResponse.json({ status: false, message: "Failed to toggle ephemeral messages", error: "Failed to toggle ephemeral messages" }, { status: 500 });
    }
}
