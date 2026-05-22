import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/{jid}/location instead.
 * This endpoint will be removed in a future version.
 */
// POST: Send location message
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/location is deprecated. Use POST /api/messages/{sessionId}/{jid}/location instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, latitude, longitude, name, address } = body;

        if (!sessionId || !jid || latitude === undefined || longitude === undefined) {
            return NextResponse.json({ status: false, message: "sessionId, jid, latitude, and longitude are required", error: "sessionId, jid, latitude, and longitude are required" }, { status: 400 });
        }

        // Validate latitude and longitude ranges
        if (latitude < -90 || latitude > 90) {
            return NextResponse.json({ status: false, message: "Latitude must be between -90 and 90", error: "Latitude must be between -90 and 90" }, { status: 400 });
        }

        if (longitude < -180 || longitude > 180) {
            return NextResponse.json({ status: false, message: "Longitude must be between -180 and 180", error: "Longitude must be between -180 and 180" }, { status: 400 });
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

        // Send location message
        await instance.socket.sendMessage(jid, {
            location: {
                degreesLatitude: latitude,
                degreesLongitude: longitude,
                name: name || undefined,
                address: address || undefined
            }
        });

        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (error) {
        console.error("Send location error:", error);
        return NextResponse.json({ status: false, message: "Failed to send location", error: "Failed to send location" }, { status: 500 });
    }
}
