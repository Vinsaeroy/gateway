
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    const email = "test@api.com";
    const apiKey = "wag_TESTAPIKEY123";
    const password = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { apiKey, role: 'SUPERADMIN' },
        create: {
            email,
            password,
            name: "Test User",
            apiKey,
            role: 'SUPERADMIN'
        }
    });

    console.log(`User ${user.email} ready with API Key: ${user.apiKey}`);
    
    // Also ensure a session exists for testing
    const session = await prisma.session.upsert({
        where: { sessionId: "test-session" },
        update: { userId: user.id },
        create: {
            sessionId: "test-session",
            name: "Test Session",
            userId: user.id,
            status: "CONNECTED"
        }
    });
    console.log(`Session ${session.sessionId} ready.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
