import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// GET: List auto broadcasts for a session
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    try {
        const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
        if (!session) return NextResponse.json({ status: false, message: "Session not found" }, { status: 404 });

        const broadcasts = await prisma.autoBroadcast.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ status: true, message: "Auto broadcasts fetched", data: broadcasts });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to fetch auto broadcasts" }, { status: 500 });
    }
}

// POST: Create new auto broadcast
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    try {
        const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
        if (!session) return NextResponse.json({ status: false, message: "Session not found" }, { status: 404 });

        const body = await request.json();
        const { name, message, mediaUrl, mediaType, targets, intervalMin } = body;

        if (!name || !message) {
            return NextResponse.json({ status: false, message: "Name and message are required" }, { status: 400 });
        }

        const broadcast = await prisma.autoBroadcast.create({
            data: {
                sessionId: session.id,
                name,
                message,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
                targets: targets || ["ALL"],
                intervalMin: intervalMin || 60,
                isActive: true
            }
        });

        return NextResponse.json({ status: true, message: "Auto broadcast created", data: broadcast });
    } catch (error) {
        console.error("Create auto broadcast error:", error);
        return NextResponse.json({ status: false, message: "Failed to create auto broadcast" }, { status: 500 });
    }
}

// PUT: Update auto broadcast
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { id, name, message, mediaUrl, mediaType, targets, intervalMin, isActive } = body;

        if (!id) return NextResponse.json({ status: false, message: "Broadcast ID required" }, { status: 400 });

        const broadcast = await prisma.autoBroadcast.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(message !== undefined && { message }),
                ...(mediaUrl !== undefined && { mediaUrl }),
                ...(mediaType !== undefined && { mediaType }),
                ...(targets !== undefined && { targets }),
                ...(intervalMin !== undefined && { intervalMin }),
                ...(isActive !== undefined && { isActive }),
            }
        });

        return NextResponse.json({ status: true, message: "Auto broadcast updated", data: broadcast });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to update auto broadcast" }, { status: 500 });
    }
}

// DELETE: Delete auto broadcast
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden" }, { status: 403 });

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ status: false, message: "Broadcast ID required" }, { status: 400 });

        await prisma.autoBroadcast.delete({ where: { id } });
        return NextResponse.json({ status: true, message: "Auto broadcast deleted" });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to delete auto broadcast" }, { status: 500 });
    }
}
