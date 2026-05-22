import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { generateWAMessageFromContent } from "@whiskeysockets/baileys";

// Simple mime type guesser
const getMimeType = (url: string) => {
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
    if (url.endsWith('.mp4')) return 'video/mp4';
    return undefined; // Let Baileys guess
};

/**
 * @deprecated This endpoint is deprecated. Use POST /api/status/{sessionId}/update instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/status/update is deprecated. Use POST /api/status/{sessionId}/update instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, content, type = "TEXT", mediaUrl, backgroundColor, font, mentions } = body; 
        
        if (!sessionId || !content) {
             return NextResponse.json({ status: false, message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const statusJid = 'status@broadcast';
        const userJid = instance.socket.user?.id || (instance.socket.authState.creds.me?.id);

        if (!userJid) {
             return NextResponse.json({ status: false, message: "Session not fully connected (User JID missing)", error: "Session not fully connected (User JID missing)" }, { status: 503 });
        }

        let resultId: string | undefined;

        if (type === 'TEXT') {
            // Use relayMessage for TEXT to support background color/font
            const messageContent: any = { 
                extendedTextMessage: {
                    text: content,
                    backgroundArgb: backgroundColor || 0xff000000,
                    font: font || 0,
                    contextInfo: {
                        mentionedJid: mentions && Array.isArray(mentions) ? mentions : [],
                        externalAdReply: { 
                            title: content,
                            body: "",
                            previewType: "PHOTO",
                            thumbnailUrl: "", 
                            sourceUrl: ""
                        }
                    }
                }
            };
             // Clean up
            if (!messageContent.extendedTextMessage.contextInfo.externalAdReply.sourceUrl) {
                delete messageContent.extendedTextMessage.contextInfo.externalAdReply;
            }

            const msg = generateWAMessageFromContent(statusJid, messageContent, { 
                userJid: userJid
            });

            resultId = await instance.socket.relayMessage(statusJid, msg.message!, { 
                messageId: msg.key.id!, 
                statusJidList: mentions && Array.isArray(mentions) && mentions.length > 0 ? mentions : undefined,
            });

        } else if (type === 'IMAGE') {
            if (!mediaUrl) return NextResponse.json({ status: false, message: "Media URL required for image status", error: "Media URL required for image status" }, { status: 400 });
            
            const sentMsg = await instance.socket.sendMessage(statusJid, {
                image: { url: mediaUrl },
                caption: content,
                mimetype: getMimeType(mediaUrl) || 'image/jpeg'
            }, {
                statusJidList: mentions && Array.isArray(mentions) && mentions.length > 0 ? mentions : undefined
            });
            resultId = sentMsg?.key.id!;

        } else if (type === 'VIDEO') {
            if (!mediaUrl) return NextResponse.json({ status: false, message: "Media URL required for video status", error: "Media URL required for video status" }, { status: 400 });
            
            const sentMsg = await instance.socket.sendMessage(statusJid, {
                video: { url: mediaUrl },
                caption: content,
                mimetype: getMimeType(mediaUrl) || 'video/mp4'
            }, {
                statusJidList: mentions && Array.isArray(mentions) && mentions.length > 0 ? mentions : undefined
            });
             resultId = sentMsg?.key.id!;

        } else {
             return NextResponse.json({ status: false, message: "Invalid status type", error: "Invalid status type" }, { status: 400 });
        }
        
        console.log("Status Sent ID:", resultId);

        // Get database session ID for foreign key logic (unchanged)
        // Note: moved this down to avoid DB call if send fails, but verifying session existence at start is better.
        // Re-fetching or just using logic below.
        
         const dbSession = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (dbSession) {
             await prisma.story.create({
                data: {
                    sessionId: dbSession.id,
                    jid: statusJid,
                    content,
                    mediaUrl,
                    type
                }
            });
        }

        return NextResponse.json({ status: true, message: "Operation successful", data: { id: resultId } });

    } catch (e: any) {
        console.error("Post status error details:", {
            message: e.message,
            stack: e.stack,
            name: e.name,
            cause: e.cause
        });
        return NextResponse.json({ 
            error: "Failed to post status", 
            details: e.message 
        }, { status: 500 });
    }
}
