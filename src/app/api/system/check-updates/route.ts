import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

// ============================================================
// UPSTREAM UPDATE CHECK DIMATIKAN (manual update only)
// ------------------------------------------------------------
// Sebelumnya route ini polling release dari repo lain
// (vinsaeroy/WA-AKG) lewat getLatestRelease(). Akibatnya tiap
// repo upstream rilis versi baru, instance ini ikut kena
// notifikasi/terdorong update.
//
// Sesuai permintaan: putuskan dari repo lain supaya perubahan di
// sana TIDAK ikut mengubah di sini. Update dilakukan manual lalu
// baru di-push ke main repo sendiri.
//
// Kalau suatu saat mau mengaktifkan lagi (mis. cek repo sendiri),
// import { getLatestRelease } from "@/lib/github" dan { prisma }
// from "@/lib/prisma", lalu kembalikan logika notifikasi di bawah.
// ============================================================

const CURRENT_VERSION = "v1.5.4";

export async function POST(req: NextRequest) {
    const user = await getAuthenticatedUser(req); // Support API Key
    if (!user) {
        return NextResponse.json(
            { status: false, message: "Unauthorized", error: "Unauthorized" },
            { status: 401 }
        );
    }

    // Tidak melakukan request apa pun ke GitHub / repo upstream.
    return NextResponse.json({
        status: true,
        message: "Update check is disabled (manual update mode)",
        data: { version: CURRENT_VERSION, upstreamCheck: false }
    });
}
