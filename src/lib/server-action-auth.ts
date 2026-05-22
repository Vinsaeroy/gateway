import { auth } from "./auth";
import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * Gets the currently authenticated user from Next Auth without requiring a Request object.
 * Used primarily for Server Actions.
 */
export async function getAuthenticatedUserForAction() {
    try {
        const session = await auth();
        
        if (session?.user?.id) {
            // Fetch full user data including role to ensure it's up to date
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { id: true, email: true, name: true, role: true }
            });

            if (user) {
                return user;
            }
        }
        return null;
    } catch (error) {
        logger.error("Auth", "Error getting authenticated user for action:", error);
        return null;
    }
}
