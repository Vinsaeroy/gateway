import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/labels/{sessionId} instead.
 * This endpoint will be removed in a future version.
 */
// GET: Get all labels for a session
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/labels is deprecated. Use GET /api/labels/{sessionId} instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ status: false, message: "sessionId is required", error: "sessionId is required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const labels = await prisma.label.findMany({
            where: { sessionId },
            include: {
                _count: {
                    select: { chatLabels: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ status: true, message: "Operation successful", data: { labels } });

    } catch (error) {
        console.error("Get labels error:", error);
        return NextResponse.json({ status: false, message: "Failed to get labels", error: "Failed to get labels" }, { status: 500 });
    }
}

/**
 * @deprecated This endpoint is deprecated. Use POST /api/labels/{sessionId} instead.
 * This endpoint will be removed in a future version.
 */
// POST: Create a new label
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/labels is deprecated. Use POST /api/labels/{sessionId} instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, name, color } = body;

        if (!sessionId || !name) {
            return NextResponse.json({ status: false, message: "sessionId and name are required", error: "sessionId and name are required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // Validate color (0-19 for WhatsApp colors)
        const colorValue = color !== undefined ? color : 0;
        if (colorValue < 0 || colorValue > 19) {
            return NextResponse.json({ status: false, message: "Color must be between 0 and 19", error: "Color must be between 0 and 19" }, { status: 400 });
        }

        // Color mapping (WhatsApp internal colors to hex)
        const colorMap = [
            "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF",
            "#4B0082", "#9400D3", "#FF1493", "#00CED1", "#32CD32",
            "#FFD700", "#FF69B4", "#8B4513", "#2F4F4F", "#696969",
            "#708090", "#778899", "#B0C4DE", "#ADD8E6", "#F0E68C"
        ];

        const label = await prisma.label.create({
            data: {
                sessionId,
                name,
                color: colorValue,
                colorHex: colorMap[colorValue]
            }
        });

        return NextResponse.json({ status: true, message: "Operation successful", data: { label } });

    } catch (error) {
        console.error("Create label error:", error);
        return NextResponse.json({ status: false, message: "Failed to create label", error: "Failed to create label" }, { status: 500 });
    }
}
