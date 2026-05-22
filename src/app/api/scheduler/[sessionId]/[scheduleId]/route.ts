import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import moment from "moment-timezone";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const body = await request.json();
        const { jid, content, sendAt, mediaUrl, mediaType } = body;

        if (!jid || !content || !sendAt) {
            return NextResponse.json({ status: false, message: "JID, content, and sendAt are required", error: "JID, content, and sendAt are required" }, { status: 400 });
        }

        // Fetch system timezone
        // @ts-ignore
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        const timezone = systemConfig?.timezone || "Asia/Jakarta";

        console.log(`[Scheduler:PUT] Received sendAt: ${sendAt}, using timezone: ${timezone}`);
        const utcDate = moment.tz(sendAt, timezone).toDate();
        console.log(`[Scheduler:PUT] Resolved UTC Date: ${utcDate.toISOString()}`);

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id: scheduleId },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ status: false, message: "Message not found", error: "Message not found" }, { status: 404 });
        }

        // Verify the schedule belongs to this session
        if (msg.session.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Schedule not found in this session", error: "Schedule not found in this session" }, { status: 404 });
        }

        const updated = await prisma.scheduledMessage.update({
            where: { id: scheduleId },
            data: {
                jid,
                content,
                sendAt: utcDate,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update schedule error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id: scheduleId },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ status: false, message: "Message not found", error: "Message not found" }, { status: 404 });
        }

        // Verify the schedule belongs to this session
        if (msg.session.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Schedule not found in this session", error: "Schedule not found in this session" }, { status: 404 });
        }

        await prisma.scheduledMessage.delete({ where: { id: scheduleId } });
        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (error) {
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}
