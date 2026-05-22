import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ status: false, message: "Notification ID required", error: "Notification ID required" }, { status: 400 });
        }

        // Delete notification only if it belongs to the user
        await prisma.notification.deleteMany({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        return NextResponse.json({ status: true, message: "Notification deleted" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: false, message: "Error deleting notification", error: "Error deleting notification" }, { status: 500 });
    }
}
