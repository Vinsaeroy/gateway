import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const all = searchParams.get('all'); // ?all=1 → delete all for current user

        if (all === "1" || all === "true") {
            const result = await prisma.notification.deleteMany({
                where: { userId: session.user.id }
            });
            return NextResponse.json({ status: true, message: `Deleted ${result.count} notifications`, data: { count: result.count } });
        }

        if (!id) {
            return NextResponse.json({ status: false, message: "Notification ID required", error: "Notification ID required" }, { status: 400 });
        }

        // Delete notification only if it belongs to the user
        const result = await prisma.notification.deleteMany({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (result.count === 0) {
            return NextResponse.json(
                { status: false, message: "Notification not found or already deleted", error: "Notification not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ status: true, message: "Notification deleted", data: { count: result.count } });
    } catch (e) {
        console.error("Delete notification error:", e);
        return NextResponse.json({ status: false, message: "Error deleting notification", error: "Error deleting notification" }, { status: 500 });
    }
}
