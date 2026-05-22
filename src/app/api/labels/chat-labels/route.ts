import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/labels/{sessionId}/chat/{jid}/labels instead.
 * This endpoint will be removed in a future version.
 */
// GET: Get labels for a chat
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/labels/chat-labels is deprecated. Use GET /api/labels/{sessionId}/chat/{jid}/labels instead.');
    const { searchParams } = new URL(request.url);
    const jid = searchParams.get("jid");
    
    if (!jid) {
        return NextResponse.json({ status: false, message: "jid is required", error: "jid is required" }, { status: 400 });
    }
    
    const decodedJid = decodeURIComponent(jid);

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

        const chatLabels = await prisma.chatLabel.findMany({
            where: {
                chatJid: decodedJid,
                label: { sessionId }
            },
            include: {
                label: true
            }
        });

        const labels = chatLabels.map(cl => cl.label);

        return NextResponse.json({ status: true, message: "Operation successful", data: { labels } });

    } catch (error) {
        console.error("Get chat labels error:", error);
        return NextResponse.json({ status: false, message: "Failed to get chat labels", error: "Failed to get chat labels" }, { status: 500 });
    }
}

/**
 * @deprecated This endpoint is deprecated. Use PUT /api/labels/{sessionId}/chat/{jid}/labels instead.
 * This endpoint will be removed in a future version.
 */
// PUT: Add or remove labels from chat
export async function PUT(request: NextRequest) {
    console.warn('[DEPRECATED] PUT /api/labels/chat-labels is deprecated. Use PUT /api/labels/{sessionId}/chat/{jid}/labels instead.');
    const { searchParams } = new URL(request.url);
    const jid = searchParams.get("jid");
    
    if (!jid) {
        return NextResponse.json({ status: false, message: "jid is required", error: "jid is required" }, { status: 400 });
    }
    
    const decodedJid = decodeURIComponent(jid);

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, labelIds, action } = body;

        if (!sessionId || !labelIds || !Array.isArray(labelIds) || !action) {
            return NextResponse.json({ status: false, message: "sessionId, labelIds (array), and action are required", error: "sessionId, labelIds (array), and action are required" }, { status: 400 });
        }

        if (!['add', 'remove'].includes(action)) {
            return NextResponse.json({ status: false, message: "action must be 'add' or 'remove'", error: "action must be 'add' or 'remove'" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        if (action === 'add') {
            // Add labels to chat
            for (const labelId of labelIds) {
                // Verify label belongs to this session
                const label = await prisma.label.findUnique({
                    where: { id: labelId }
                });

                if (!label || label.sessionId !== sessionId) {
                    continue; // Skip invalid labels
                }

                // Check if already exists
                const existing = await prisma.chatLabel.findFirst({
                    where: {
                        labelId,
                        chatJid: decodedJid
                    }
                });

                if (!existing) {
                    await prisma.chatLabel.create({
                        data: {
                            labelId,
                            chatJid: decodedJid
                        }
                    });
                }
            }
        } else {
            // Remove labels from chat
            await prisma.chatLabel.deleteMany({
                where: {
                    labelId: { in: labelIds },
                    chatJid: decodedJid
                }
            });
        }

        // Get updated labels
        const chatLabels = await prisma.chatLabel.findMany({
            where: {
                chatJid: decodedJid,
                label: { sessionId }
            },
            include: {
                label: true
            }
        });

        const labels = chatLabels.map(cl => cl.label);

        return NextResponse.json({ 
            success: true,
            message: `Labels ${action === 'add' ? 'added to' : 'removed from'} chat`,
            labels
        });

    } catch (error) {
        console.error("Update chat labels error:", error);
        return NextResponse.json({ status: false, message: "Failed to update chat labels", error: "Failed to update chat labels" }, { status: 500 });
    }
}
