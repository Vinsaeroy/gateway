import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; replyId: string }> }
) {
    try {
        const { sessionId, replyId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const body = await request.json();
        const { keyword, response, matchType, triggerType, isMedia, mediaUrl } = body;

        if (!keyword || !response) {
            return NextResponse.json({ status: false, message: "Keyword and response are required", error: "Keyword and response are required" }, { status: 400 });
        }

        const updated = await prisma.autoReply.update({
            where: { id: replyId },
            data: {
                keyword,
                response,
                matchType: matchType || "EXACT",
                triggerType: triggerType || "ALL",
                isMedia: isMedia || false,
                mediaUrl: mediaUrl || null
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update auto reply error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; replyId: string }> }
) {
    try {
        const { sessionId, replyId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const rule = await prisma.autoReply.findUnique({
            where: { id: replyId },
            include: { session: true }
        });

        if (!rule) {
            return NextResponse.json({ status: false, message: "Rule not found", error: "Rule not found" }, { status: 404 });
        }

        // Verify the rule belongs to this session
        if (rule.session.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Rule not found in this session", error: "Rule not found in this session" }, { status: 404 });
        }

        await prisma.autoReply.delete({ where: { id: replyId } });
        return NextResponse.json({ status: true, message: "Operation successful" });

    } catch (error) {
        console.error("Delete auto reply error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}
