import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/chats/{sessionId}/by-label/{labelId} instead.
 * This endpoint will be removed in a future version.
 */
// GET: Get all chats with a specific label
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ labelId: string }> }
) {
    console.warn('[DEPRECATED] GET /api/chats/by-label/{labelId} is deprecated. Use GET /api/chats/{sessionId}/by-label/{labelId} instead.');
    const { labelId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Verify label exists and get sessionId
        const label = await prisma.label.findUnique({
            where: { id: labelId }
        });

        if (!label) {
            return NextResponse.json({ status: false, message: "Label not found", error: "Label not found" }, { status: 404 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, label.sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this label", error: "Forbidden - Cannot access this label" }, { status: 403 });
        }

        // Get all chats with this label
        const chatLabels = await prisma.chatLabel.findMany({
            where: {
                labelId
            },
            include: {
                label: true
            }
        });

        const chatJids = chatLabels.map(cl => cl.chatJid);

        return NextResponse.json({ 
            success: true,
            label,
            chats: chatJids,
            count: chatJids.length
        });

    } catch (error) {
        console.error("Get chats by label error:", error);
        return NextResponse.json({ status: false, message: "Failed to get chats by label", error: "Failed to get chats by label" }, { status: 500 });
    }
}
