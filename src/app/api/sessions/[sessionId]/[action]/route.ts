import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, action: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const sessionId = resolvedParams.sessionId;
        const action = resolvedParams.action;

        // Verify access
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // Validate Action
        const validActions = ["start", "stop", "restart", "logout", "pair"];
        if (!validActions.includes(action)) {
            return NextResponse.json({ status: false, message: "Invalid action", error: "Invalid action" }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));

        switch (action) {
            case "pair":
                const { phoneNumber } = body;
                if (!phoneNumber) {
                    return NextResponse.json({ status: false, message: "Phone number required for pairing" }, { status: 400 });
                }
                const pairingCode = await waManager.requestPairingCode(sessionId, phoneNumber);
                return NextResponse.json({ status: true, message: "Pairing code generated", data: { pairingCode } });

            case "start":
                await waManager.startSession(sessionId);
                break;
            case "stop":
                await waManager.stopSession(sessionId);
                break;
            case "restart":
                await waManager.restartSession(sessionId);
                break;
            case "logout":
                // Retrieve instance to logout properly
                const instance = waManager.getInstance(sessionId);
                if (instance?.socket) {
                    await instance.socket.logout();
                } else {
                    // Fallback DB update if instance not running
                    await prisma.session.update({
                        where: { sessionId },
                        data: { status: "LOGGED_OUT", qr: null }
                    });
                }
                break;
        }

        return NextResponse.json({ status: true, message: `Session ${action}ed successfully` });

    } catch (error) {
        console.error("Session action error:", error);
        return NextResponse.json({ error: `Failed to ${(error as any).message || "perform action"}` }, { status: 500 });
    }
}
