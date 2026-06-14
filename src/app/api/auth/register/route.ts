import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

// Rate limit registrasi berbasis IP (anti-spam pembuatan akun massal).
// In-memory: reset saat restart, cukup untuk mencegah abuse otomatis.
const regAttempts = new Map<string, number[]>();
const REG_WINDOW_MS = 60 * 60 * 1000; // 1 jam
const REG_MAX = 5; // maks 5 percobaan daftar per IP per jam

function getClientIp(req: Request): string {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (regAttempts.get(ip) || []).filter((t) => now - t < REG_WINDOW_MS);
    // Cegah map membengkak tak terbatas.
    if (regAttempts.size > 5000) regAttempts.clear();
    if (recent.length >= REG_MAX) {
        regAttempts.set(ip, recent);
        return true;
    }
    recent.push(now);
    regAttempts.set(ip, recent);
    return false;
}

export async function POST(req: Request) {
    try {
        // Anti-spam: batasi jumlah registrasi per IP.
        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Terlalu banyak percobaan registrasi. Coba lagi dalam 1 jam." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, password, name } = registerSchema.parse(body);

        // Check if registration is enabled
        const systemConfig = await prisma.systemConfig.findUnique({
            where: { id: "default" },
            select: { enableRegistration: true }
        });
        if (systemConfig && systemConfig.enableRegistration === false) {
            return NextResponse.json(
                { error: "Registration is currently disabled by the administrator" },
                { status: 403 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Role: user PERTAMA yang daftar otomatis jadi SUPERADMIN (admin dev),
        // user berikutnya jadi STAFF (akses paling dasar; bisa di-upgrade admin).
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "SUPERADMIN" : "STAFF";

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid registration data provided" },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error during registration" },
            { status: 500 }
        );
    }
}
