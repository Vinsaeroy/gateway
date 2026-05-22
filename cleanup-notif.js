const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const result = await p.notification.deleteMany({
        where: {
            OR: [
                { href: { contains: 'mrifqidaffaaditya' } },
                { message: { contains: 'mrifqidaffaaditya' } }
            ]
        }
    });
    console.log('Deleted old notifications:', result);
    await p.$disconnect();
}

main();
