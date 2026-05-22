import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: Get chats assigned to a specific label
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const { searchParams } = new URL(request.url);
        const labelId = searchParams.get("labelId");

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!labelId) {
            return NextResponse.json({ status: false, message: "labelId query param is required" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });
        }

        // Verify label belongs to session
        const label = await prisma.label.findUnique({
            where: { id: labelId }
        });

        if (!label || label.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Label not found" }, { status: 404 });
        }

        // Resolve sessionId to dbSession id for contact lookup
        const dbSession = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        // Get all chatLabels for this label with contact info
        const chatLabels = await prisma.chatLabel.findMany({
            where: { labelId },
            orderBy: { createdAt: "desc" }
        });

        // Enrich with contact names if available
        const enriched = await Promise.all(
            chatLabels.map(async (cl) => {
                let contactName: string | undefined;
                if (dbSession) {
                    const contact = await prisma.contact.findFirst({
                        where: {
                            sessionId: dbSession.id,
                            jid: cl.chatJid
                        },
                        select: { name: true, notify: true }
                    });
                    contactName = contact?.name || contact?.notify || undefined;
                }
                return {
                    id: cl.id,
                    chatJid: cl.chatJid,
                    labelId: cl.labelId,
                    contactName
                };
            })
        );

        return NextResponse.json({ status: true, data: enriched });

    } catch (error) {
        console.error("Get label chats error:", error);
        return NextResponse.json({ status: false, message: "Failed to get label chats" }, { status: 500 });
    }
}
