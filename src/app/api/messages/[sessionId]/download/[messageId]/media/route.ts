import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// GET: Download media from message
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; messageId: string }> }
) {
    const { sessionId, messageId } = await params;
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

        // Find message in database
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return NextResponse.json({ status: false, message: "Message not found", error: "Message not found" }, { status: 404 });
        }

        if (message.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Message does not belong to this session", error: "Message does not belong to this session" }, { status: 403 });
        }

        if (!message.mediaUrl) {
            return NextResponse.json({ status: false, message: "Message has no media", error: "Message has no media" }, { status: 404 });
        }

        // If mediaUrl is a local path, return it
        // If it's external URL, redirect to it
        if (message.mediaUrl.startsWith('http')) {
            return NextResponse.redirect(message.mediaUrl);
        }

        // For local files, read and return
        // Use runtime path resolution to avoid Turbopack static analysis
        const cwd = process.cwd();
        const filePath = path.resolve(cwd, message.mediaUrl);
        
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ status: false, message: "Media file not found on disk", error: "Media file not found on disk" }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = message.type === 'IMAGE' ? 'image/jpeg' 
            : message.type === 'VIDEO' ? 'video/mp4'
            : message.type === 'AUDIO' ? 'audio/mpeg'
            : message.type === 'DOCUMENT' ? 'application/pdf'
            : 'application/octet-stream';

        // Extract filename from path
        const fileName = path.basename(message.mediaUrl);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        console.error("Download media error:", error);
        return NextResponse.json({ status: false, message: "Failed to download media", error: "Failed to download media" }, { status: 500 });
    }
}
