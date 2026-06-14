import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey, hashApiKey, isHashedApiKey } from "@/lib/api-auth";

// Get current user's API key
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { apiKey: true }
        });

        const stored = user?.apiKey || null;
        // Key baru disimpan ter-hash → tidak bisa ditampilkan lagi (hanya sekali saat generate).
        // Key lama (legacy plaintext) masih bisa ditampilkan sampai user generate ulang.
        const hashed = isHashedApiKey(stored);
        return NextResponse.json({
            status: true,
            message: "API key fetched",
            data: {
                apiKey: hashed ? null : stored, // null kalau sudah ter-hash
                apiKeySet: !!stored,
                hidden: hashed
            }
        });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to fetch API key", error: "Failed to fetch API key" }, { status: 500 });
    }
}

// Generate new API key
export async function POST() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

    try {
        const newApiKey = generateApiKey();

        // Simpan HASH-nya saja di DB. Plaintext hanya dikembalikan sekali di response ini.
        await prisma.user.update({
            where: { id: session.user.id },
            data: { apiKey: hashApiKey(newApiKey) }
        });

        return NextResponse.json({
            status: true,
            message: "API key generated. Simpan sekarang — key ini tidak akan ditampilkan lagi.",
            data: { apiKey: newApiKey }
        });
    } catch (error) {
        console.error("Generate API key error:", error);
        return NextResponse.json({ status: false, message: "Failed to generate API key", error: "Failed to generate API key" }, { status: 500 });
    }
}

// Delete/revoke API key
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { apiKey: null }
        });

        return NextResponse.json({ status: true, message: "API key revoked" });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to revoke API key", error: "Failed to revoke API key" }, { status: 500 });
    }
}
