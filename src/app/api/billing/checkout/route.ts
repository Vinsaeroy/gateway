import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig, type PlanId } from "@/lib/plans";
import { createQrisTransaction, isKlikQrisConfigured } from "@/lib/klikqris";
import { logger } from "@/lib/logger";

// POST /api/billing/checkout  { plan: "STANDARD" | "PRO" }
// Membuat transaksi QRIS KlikQRIS dan mengembalikan data QR untuk dibayar.
export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json(
            { status: false, message: "Unauthorized", error: "Unauthorized" },
            { status: 401 }
        );
    }

    let body: any = {};
    try {
        body = await request.json();
    } catch {
        /* body opsional */
    }

    const planId = String(body?.plan || "").toUpperCase() as PlanId;
    const cfg = getPlanConfig(planId);

    if (!planId || cfg.id !== planId) {
        return NextResponse.json(
            { status: false, message: "Plan tidak valid", error: "invalid_plan" },
            { status: 400 }
        );
    }

    if (planId === "FREE") {
        return NextResponse.json(
            { status: false, message: "Plan FREE tidak perlu pembayaran", error: "free_plan" },
            { status: 400 }
        );
    }

    if (cfg.price === null) {
        return NextResponse.json(
            {
                status: false,
                message: "Plan ini bersifat custom. Silakan hubungi admin/sales.",
                error: "custom_plan"
            },
            { status: 400 }
        );
    }

    if (!(await isKlikQrisConfigured())) {
        return NextResponse.json(
            {
                status: false,
                message:
                    "Payment gateway belum dikonfigurasi/diaktifkan oleh admin.",
                error: "gateway_not_configured"
            },
            { status: 503 }
        );
    }

    // Buat record Payment dulu (PENDING) supaya punya id sebagai order_id
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            plan: planId,
            amount: cfg.price,
            durationDays: cfg.durationDays,
            status: "PENDING",
            provider: "klikqris"
        }
    });

    try {
        const trx = await createQrisTransaction({
            amount: cfg.price,
            orderId: payment.id,
            description: `Upgrade plan ${cfg.name} (${user.email})`
        });

        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                reference: trx.reference,
                signature: trx.signature,
                totalAmount: trx.totalAmount ?? cfg.price,
                qrImageUrl: trx.qrImageUrl,
                expiresAt: trx.expiresAt,
                rawResponse: trx.raw ?? undefined
            }
        });

        return NextResponse.json({
            status: true,
            message: "Silakan scan QRIS untuk membayar",
            data: {
                paymentId: updated.id,
                reference: updated.reference,
                plan: planId,
                planName: cfg.name,
                amount: cfg.price,
                totalAmount: updated.totalAmount,
                qrString: updated.qrString,
                qrImageUrl: updated.qrImageUrl,
                expiresAt: updated.expiresAt
            }
        });
    } catch (e: any) {
        logger.error("Billing", "Checkout error:", e);
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" }
        }).catch(() => {});
        return NextResponse.json(
            { status: false, message: e?.message || "Gagal membuat transaksi", error: "checkout_failed" },
            { status: 502 }
        );
    }
}
