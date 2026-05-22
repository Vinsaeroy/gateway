import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send contact card
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
        const { contacts } = body;

        if (!contacts || !Array.isArray(contacts)) {
            return NextResponse.json({ status: false, message: "contacts (array) is required", error: "contacts (array) is required" }, { status: 400 });
        }

        if (contacts.length === 0) {
            return NextResponse.json({ status: false, message: "At least one contact is required", error: "At least one contact is required" }, { status: 400 });
        }

        // Validate contacts structure
        for (const contact of contacts) {
            if (!contact.displayName || !contact.vcard) {
                return NextResponse.json({ status: false, message: "Each contact must have displayName and vcard", error: "Each contact must have displayName and vcard" }, { status: 400 });
            }
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

        // Send contact message
        await instance.socket.sendMessage(decodedJid, {
            contacts: {
                displayName: contacts.length > 1 ? "Contacts" : contacts[0].displayName,
                contacts: contacts
            }
        });

        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (error) {
        console.error("Send contact error:", error);
        return NextResponse.json({ status: false, message: "Failed to send contact", error: "Failed to send contact" }, { status: 500 });
    }
}
