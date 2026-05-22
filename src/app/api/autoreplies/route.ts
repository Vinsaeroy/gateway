import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession, isAdmin } from "@/lib/api-auth";

/**
 * @deprecated These endpoints are deprecated. Use GET/POST /api/autoreplies/{sessionId} instead.
 * These endpoints will be removed in a future version.
 */

// GET: List Auto Replies
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/autoreplies is deprecated. Use GET /api/autoreplies/{sessionId} instead.');
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

        // Verify access
        // We need to resolve sessionId (string) to session CUID for permission check? 
        // Or canAccessSession takes String? It checks sessionId OR id. So String is fine.
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        // Fetch rules
        // AutoReply is linked to Session CUID via `sessionId`.
        // We need to find Session CUID first from the String ID provided in query
        const session = await prisma.session.findUnique({
             where: { sessionId: sessionId },
             select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        const rules = await prisma.autoReply.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rules);

    } catch (error) {
        console.error("Fetch auto replies error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create Auto Reply
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, keyword, response, matchType } = body;

        if (!sessionId || !keyword || !response) {
            return NextResponse.json({ status: false, message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        // Get Session CUID
        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
       });

       if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
       }

        const newRule = await prisma.autoReply.create({
            data: {
                sessionId: session.id, // Link to CUID
                keyword,
                response,
                matchType: matchType || "EXACT",
                isMedia: false
            }
        });

        return NextResponse.json(newRule);

    } catch (error) {
        console.error("Create auto reply error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}
