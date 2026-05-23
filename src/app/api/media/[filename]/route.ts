import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// Media directory — private, NOT in public/
// Use a function to avoid Turbopack static file tracing
function getMediaDir() {
    return path.join(process.cwd(), "data", "media");
}

/**
 * Extract sessionId from media filename.
 * Format: {sessionId}-{messageId}.{ext}
 * e.g. "marketing-1-ABCDEF123456.jpg" → "marketing-1"
 */
function extractSessionId(filename: string): string | null {
    // Remove extension
    const base = filename.replace(/\.[^.]+$/, "");
    // The last segment after the last "-" is the messageId
    const lastDash = base.lastIndexOf("-");
    if (lastDash <= 0) return null;
    return base.substring(0, lastDash);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        // Authentication check — require session or API key
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { filename } = await params;

        // Security: Prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ status: false, message: "Invalid filename", error: "Invalid filename" }, { status: 400 });
        }

        // Session ownership check — extract sessionId from filename
        const sessionId = extractSessionId(filename);
        if (sessionId) {
            const canAccess = await canAccessSession(user.id, user.role, sessionId);
            if (!canAccess) {
                return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session's media", error: "Forbidden - Cannot access this session's media" }, { status: 403 });
            }
        }

        const MEDIA_DIR = getMediaDir();
        const filePath = path.join(MEDIA_DIR, filename);

        // Ensure resolved path is still within MEDIA_DIR
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(MEDIA_DIR))) {
            return NextResponse.json({ status: false, message: "Access denied", error: "Access denied" }, { status: 403 });
        }

        if (!existsSync(filePath)) {
            return NextResponse.json(
                { status: false, message: "File not found" },
                { 
                    status: 404,
                    headers: { 'Cache-Control': 'public, max-age=86400' } // Cache 404 for 1 day to prevent retry spam
                }
            );
        }

        const fileBuffer = await readFile(filePath);

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.opus': 'audio/opus',
            '.m4a': 'audio/mp4',
            '.pdf': 'application/pdf',
            '.bin': 'application/octet-stream',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'private, max-age=3600',
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error: any) {
        console.error("Media serve error:", error);
        return NextResponse.json({ status: false, message: "Failed to serve media", error: "Failed to serve media" }, { status: 500 });
    }
}
