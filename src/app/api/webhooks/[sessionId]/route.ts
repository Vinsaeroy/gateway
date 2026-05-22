import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify access to session
    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
    }

    try {
        // Resolve session string ID to internal ID if needed, or just look up webhooks
        // We need the internal ID to query the Webhook table
        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        const webhooks = await prisma.webhook.findMany({
            where: {
                userId: user.id,
                OR: [
                    { sessionId: session.id }, // Specific to this session
                    { sessionId: null }        // Global webhooks
                ]
            },
            include: {
                session: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ status: true, message: "Webhooks retrieved successfully", data: webhooks });
    } catch (error) {
        console.error("Fetch webhooks error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch webhooks", error: "Failed to fetch webhooks" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, url, secret, events } = body;

        if (!name || !url || !events || events.length === 0) {
            return NextResponse.json({ status: false, message: "Name, URL, and at least one event are required", error: "Name, URL, and at least one event are required" }, { status: 400 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        const webhook = await prisma.webhook.create({
            data: {
                userId: user.id,
                name,
                url,
                secret: secret || null,
                sessionId: session.id, // Strictly link to this session
                events,
                isActive: true
            }
        });

        return NextResponse.json({ status: true, message: "Webhook created successfully", data: webhook });
    } catch (error: any) {
        console.error("Create webhook error detailed:", error);
        return NextResponse.json({ status: false, message: "Failed to create webhook", error: "Failed to create webhook", details: error.message }, { status: 500 });
    }
}
