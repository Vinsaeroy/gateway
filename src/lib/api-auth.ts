import { prisma } from "./prisma";
import { NextRequest } from "next/server";
import { auth } from "./auth";
import { logger } from "./logger";
import crypto from "crypto";

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
    SUPERADMIN: 3,
    OWNER: 2,
    STAFF: 1
} as const;

type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Validate API key from request header
 */
export async function validateApiKey(request: NextRequest) {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
        return null;
    }

    // Key baru disimpan ter-hash (sha256). Cari berdasarkan hash DULU, lalu
    // fallback ke plaintext untuk key lama (legacy) yang belum dimigrasi —
    // jadi key lama tetap berfungsi sampai user generate ulang.
    const hashed = hashApiKey(apiKey);

    try {
        const user = await prisma.user.findFirst({
            where: { OR: [{ apiKey: hashed }, { apiKey }] },
            select: { id: true, email: true, name: true, role: true, plan: true, planExpiresAt: true }
        });

        return user;
    } catch {
        // Fallback: kalau kolom plan/planExpiresAt belum ada di DB (belum `db push`),
        // jangan bikin auth gagal total — anggap FREE dulu.
        try {
            const user = await prisma.user.findFirst({
                where: { OR: [{ apiKey: hashed }, { apiKey }] },
                select: { id: true, email: true, name: true, role: true }
            });
            return user ? { ...user, plan: "FREE", planExpiresAt: null } : null;
        } catch (e2) {
            logger.error("Auth", "API key validation error:", e2);
            return null;
        }
    }
}

/**
 * Get authenticated user from either session or API key
 */
export async function getAuthenticatedUser(request?: NextRequest) {
    // First try API key if request is provided
    if (request) {
        const apiKeyUser = await validateApiKey(request);
        if (apiKeyUser) {
            return { ...apiKeyUser, authMethod: "apiKey" as const };
        }
    }

    // Fall back to session auth
    const session = await auth();
    if (session?.user?.id) {
        // Fetch full user data including role
        let user: any = null;
        try {
            user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { id: true, email: true, name: true, role: true, plan: true, planExpiresAt: true }
            });
        } catch {
            // Fallback kalau kolom plan belum ada di DB (belum `db push`)
            try {
                const base = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { id: true, email: true, name: true, role: true }
                });
                user = base ? { ...base, plan: "FREE", planExpiresAt: null } : null;
            } catch (e) {
                logger.error("Auth", "Session user fetch error:", e);
                user = null;
            }
        }

        if (user) {
            return { ...user, authMethod: "session" as const };
        }
    }

    return null;
}

/**
 * Check if user has required role level
 */
export function hasRole(userRole: string, requiredRole: Role): boolean {
    const userLevel = ROLE_HIERARCHY[userRole as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
}

/**
 * Check if user is admin (SUPERADMIN or has admin privileges)
 */
export function isAdmin(userRole: string): boolean {
    return userRole === "SUPERADMIN";
}

/**
 * Check if user can access a session
 * - SUPERADMIN can access all sessions
 * - Other users can access their own sessions OR sessions shared with them
 */
export async function canAccessSession(userId: string, userRole: string, sessionId: string): Promise<boolean> {
    if (isAdmin(userRole)) {
        return true;
    }

    // Check if session belongs to user (ownership)
    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId, userId },
                { sessionId: sessionId, userId }
            ]
        }
    });

    if (session) return true;

    // Check if user has shared access
    const dbSession = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId },
                { sessionId: sessionId }
            ]
        },
        select: { id: true }
    });

    if (!dbSession) return false;

    const sharedAccess = await prisma.sessionAccess.findUnique({
        where: {
            sessionId_userId: {
                sessionId: dbSession.id,
                userId
            }
        }
    });

    return !!sharedAccess;
}

/**
 * Check if user is the actual owner of a session (not just shared access)
 * Used for protecting management endpoints (e.g. granting/revoking access)
 */
export async function isSessionOwner(userId: string, userRole: string, sessionId: string): Promise<boolean> {
    if (isAdmin(userRole)) {
        return true;
    }

    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId, userId },
                { sessionId: sessionId, userId }
            ]
        }
    });

    return !!session;
}

/**
 * Get sessions that user can access
 * - SUPERADMIN sees all
 * - Others see only their own
 */
export async function getAccessibleSessions(userId: string, userRole: string) {
    if (isAdmin(userRole)) {
        return prisma.session.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                botConfig: true,
                webhooks: true,
                _count: {
                    select: {
                        contacts: true,
                        messages: true,
                        groups: true,
                        autoReplies: true,
                        scheduledMessages: true
                    }
                }
            }
        });
    }

    // Get sessions owned by user + sessions shared with user
    const [ownedSessions, sharedAccess] = await Promise.all([
        prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                botConfig: true,
                webhooks: true,
                _count: {
                    select: {
                        contacts: true,
                        messages: true,
                        groups: true,
                        autoReplies: true,
                        scheduledMessages: true
                    }
                }
            }
        }),
        prisma.sessionAccess.findMany({
            where: { userId },
            select: { sessionId: true }
        })
    ]);

    if (sharedAccess.length === 0) return ownedSessions;

    const sharedSessionIds = sharedAccess.map(a => a.sessionId);
    const ownedIds = new Set(ownedSessions.map(s => s.id));
    const missingIds = sharedSessionIds.filter(id => !ownedIds.has(id));

    if (missingIds.length === 0) return ownedSessions;

    const sharedSessions = await prisma.session.findMany({
        where: { id: { in: missingIds } },
        orderBy: { createdAt: 'desc' },
        include: {
            botConfig: true,
            webhooks: true,
            _count: {
                select: {
                    contacts: true,
                    messages: true,
                    groups: true,
                    autoReplies: true,
                    scheduledMessages: true
                }
            }
        }
    });

    return [...ownedSessions, ...sharedSessions];
}

/**
 * Generate a new API key (cryptographically secure)
 */
export function generateApiKey(): string {
    const randomBytes = crypto.randomBytes(24).toString("base64url");
    return `wag_${randomBytes}`;
}

/**
 * Hash sebuah API key (sha256) untuk disimpan di DB.
 * Key plaintext hanya ditampilkan sekali ke user saat generate; DB hanya menyimpan hash.
 */
export function hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Deteksi apakah nilai tersimpan sudah berupa hash (64 hex) atau masih plaintext legacy.
 */
export function isHashedApiKey(value: string | null | undefined): boolean {
    return !!value && /^[a-f0-9]{64}$/.test(value);
}
