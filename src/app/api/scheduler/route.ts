import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import moment from "moment-timezone";

/**
 * @deprecated These endpoints are deprecated. Use GET/POST /api/scheduler/{sessionId} instead.
 * These endpoints will be removed in a future version.
 */

// GET: List Scheduled Messages
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/scheduler is deprecated. Use GET /api/scheduler/{sessionId} instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ status: false, message: "Session ID is required", error: "Session ID is required" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
             return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        // Get session ID (CUID)
        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        const messages = await prisma.scheduledMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { sendAt: 'asc' }
        });

        return NextResponse.json(messages);

    } catch (error) {
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create Scheduled Message
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, content, sendAt, mediaUrl } = body;

        if (!sessionId || !jid || !content || !sendAt) {
            return NextResponse.json({ status: false, message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
             where: { sessionId: sessionId },
             select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }



        // @ts-ignore
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        const timezone = systemConfig?.timezone || "Asia/Jakarta";

        // Convert local time (sendAt) to UTC Date object using moment-timezone
        // sendAt is "YYYY-MM-DDTHH:mm" (local time string from input type="datetime-local")
        const utcDate = moment.tz(sendAt, timezone).toDate();

        const scheduled = await prisma.scheduledMessage.create({
            data: {
                sessionId: session.id,
                jid,
                content,
                mediaUrl,
                sendAt: utcDate,
                status: "PENDING"
            }
        });

        return NextResponse.json(scheduled);

    } catch (error) {
        console.error("Schedule error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}
