import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

// ============================================================
// PAYMENT GATEWAY SETTINGS (KlikQRIS) — SUPERADMIN ONLY
// ------------------------------------------------------------
// API key & merchant id pembayaran HANYA bisa dilihat/diatur oleh
// SUPERADMIN (admin dev). API key tidak pernah dikembalikan utuh
// (di-mask) supaya tidak bocor.
// ============================================================

function mask(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.length <= 6) return "••••••";
    return value.slice(0, 3) + "••••" + value.slice(-3);
}

export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "SUPERADMIN") {
        return NextResponse.json(
            { status: false, message: "Forbidden — SUPERADMIN only", error: "forbidden" },
            { status: 403 }
        );
    }

    const cfg = await prisma.systemConfig.findUnique({ where: { id: "default" } });

    return NextResponse.json({
        status: true,
        data: {
            provider: "klikqris",
            klikqrisBaseUrl: cfg?.klikqrisBaseUrl || "https://klikqris.com/api",
            klikqrisMerchantId: cfg?.klikqrisMerchantId || "",
            klikqrisApiKeyMasked: mask(cfg?.klikqrisApiKey),
            klikqrisApiKeySet: Boolean(cfg?.klikqrisApiKey),
            klikqrisEnabled: Boolean(cfg?.klikqrisEnabled)
        }
    });
}

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "SUPERADMIN") {
        return NextResponse.json(
            { status: false, message: "Forbidden — SUPERADMIN only", error: "forbidden" },
            { status: 403 }
        );
    }

    let body: any = {};
    try {
        body = await request.json();
    } catch {
        /* empty body */
    }

    const { klikqrisBaseUrl, klikqrisApiKey, klikqrisMerchantId, klikqrisEnabled } = body;

    const patch: Record<string, unknown> = {};
    if (klikqrisBaseUrl !== undefined) patch.klikqrisBaseUrl = String(klikqrisBaseUrl).trim();
    if (klikqrisMerchantId !== undefined) patch.klikqrisMerchantId = String(klikqrisMerchantId).trim();
    if (klikqrisEnabled !== undefined) patch.klikqrisEnabled = Boolean(klikqrisEnabled);
    // API key hanya di-update kalau dikirim & tidak kosong (biar tidak terhapus
    // saat admin cuma ubah field lain). Kirim string kosong eksplisit "" untuk hapus.
    if (typeof klikqrisApiKey === "string" && klikqrisApiKey.trim() !== "") {
        patch.klikqrisApiKey = klikqrisApiKey.trim();
    } else if (klikqrisApiKey === null) {
        patch.klikqrisApiKey = null;
    }

    const cfg = await prisma.systemConfig.upsert({
        where: { id: "default" },
        update: patch,
        create: {
            id: "default",
            klikqrisBaseUrl: (patch.klikqrisBaseUrl as string) || "https://klikqris.com/api",
            klikqrisApiKey: (patch.klikqrisApiKey as string) || null,
            klikqrisMerchantId: (patch.klikqrisMerchantId as string) || null,
            klikqrisEnabled: (patch.klikqrisEnabled as boolean) ?? false
        }
    });

    return NextResponse.json({
        status: true,
        message: "Pengaturan pembayaran disimpan",
        data: {
            klikqrisBaseUrl: cfg.klikqrisBaseUrl,
            klikqrisMerchantId: cfg.klikqrisMerchantId,
            klikqrisApiKeySet: Boolean(cfg.klikqrisApiKey),
            klikqrisEnabled: cfg.klikqrisEnabled
        }
    });
}
