import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, isAdmin } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/groups/{sessionId} instead.
 * This endpoint will be removed in a future version.
 */
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/groups is deprecated. Use GET /api/groups/{sessionId} instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        let targetSessionId = "";

        if (sessionId) {
            // Verify access
            const canAccess = await import("@/lib/api-auth").then(m => m.canAccessSession(user.id, user.role, sessionId));
            if (!canAccess) {
                return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
            }
            // Get internal ID
            const session = await prisma.session.findUnique({
                where: { sessionId: sessionId },
                select: { id: true }
            });
            if (!session) return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
            targetSessionId = session.id;
        } else {
            // Fallback: Get first connected session based on role (Legacy behavior or default)
            let userSession;
            if (isAdmin(user.role)) {
                userSession = await prisma.session.findFirst({
                    where: { status: 'CONNECTED' },
                    select: { id: true, sessionId: true }
                });
            } else {
                userSession = await prisma.session.findFirst({
                    where: { userId: user.id, status: 'CONNECTED' },
                    select: { id: true, sessionId: true }
                });
            }
            if (!userSession) {
                return NextResponse.json({ status: false, message: "No connected session", error: "No connected session" }, { status: 404 });
            }
            targetSessionId = userSession.id;
        }



        const groups = await prisma.group.findMany({
            where: { sessionId: targetSessionId },
            orderBy: { subject: 'asc' }
        });

        return NextResponse.json({ status: true, message: "Groups retrieved successfully", data: groups });
    } catch (error) {
        console.error("Get groups error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch groups", error: "Failed to fetch groups" }, { status: 500 });
    }
}
