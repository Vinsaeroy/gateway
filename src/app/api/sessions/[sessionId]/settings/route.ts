import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession, isAdmin } from "@/lib/api-auth";

// GET: Retrieve session settings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { config: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ status: true, message: "Session settings fetched successfully", data: session });
    } catch (e) {
        console.error("Get session settings error:", e);
        return NextResponse.json({ status: false, message: "Failed to get settings", error: "Failed to get settings" }, { status: 500 });
    }
}

// PATCH: Update session settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    return updateSettings(request, params);
}

// POST: Alias for PATCH (backward compat)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    return updateSettings(request, params);
}

async function updateSettings(
    request: NextRequest,
    paramsPromise: Promise<{ sessionId: string }>
) {
    const { sessionId } = await paramsPromise;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const body = await request.json();
        const { config } = body;

        if (!config || typeof config !== "object") {
            return NextResponse.json({ status: false, message: "Invalid config payload", error: "Invalid config payload" }, { status: 400 });
        }

        // Merge with existing config so partial updates don't wipe other keys
        const existing = await prisma.session.findUnique({
            where: { sessionId },
            select: { config: true }
        });

        const merged = {
            ...((existing?.config as object) || {}),
            ...config,
        };

        const updated = await prisma.session.update({
            where: { sessionId },
            data: { config: merged }
        });

        // Apply runtime changes to the active socket where possible
        try {
            const instance = waManager.getInstance(sessionId);
            if (instance?.socket) {
                // Ghost mode = don't send read receipts (mark messages as read locally only)
                // We set the runtime flag; the message handler reads it before calling readMessages.
                (instance as any).runtimeConfig = {
                    ghostMode: !!merged.ghostMode,
                    antiDelete: !!merged.antiDelete,
                    readReceipts: merged.readReceipts !== false,
                };
            }
        } catch {
            // Non-fatal — settings are still saved in DB and will apply on next reconnect
        }

        return NextResponse.json({ status: true, message: "Session settings updated successfully", data: updated });

    } catch (e) {
        console.error("Update session settings error:", e);
        return NextResponse.json({ status: false, message: "Failed to update settings", error: "Failed to update settings" }, { status: 500 });
    }
}

// DELETE: Delete a session
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot delete this session", error: "Forbidden - Cannot delete this session" }, { status: 403 });
        }

        // Disconnect WhatsApp session first
        const instance = waManager.getInstance(sessionId);
        if (instance?.socket) {
            try {
                await instance.socket.logout();
            } catch (e) {
                console.log("Session logout error (might be already disconnected):", e);
            }
        }
        // deleteSession sudah menutup socket + menghapus row DB (idempotent).
        // Jangan delete lagi di sini (dulu bikin P2025 "record not found").
        await waManager.deleteSession(sessionId);

        return NextResponse.json({ status: true, message: "Session deleted successfully" });

    } catch (e) {
        console.error("Delete session error:", e);
        return NextResponse.json({ status: false, message: "Failed to delete session", error: "Failed to delete session" }, { status: 500 });
    }
}
