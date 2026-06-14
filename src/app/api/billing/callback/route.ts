import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature, parseCallback } from "@/lib/klikqris";
import { markPaymentPaidAndActivate } from "@/lib/billing";
import { logger } from "@/lib/logger";

// POST /api/billing/callback
// Webhook dari KlikQRIS. Daftarkan URL ini di dashboard KlikQRIS:
//   https://rifalos.shop/api/billing/callback
//
// Validasi sesuai dok: bandingkan `signature` di payload callback dengan
// `signature` yang disimpan saat create transaksi (Payment.signature).
// Wajib balas HTTP 200 OK supaya gateway tidak retry terus.
export async function POST(request: NextRequest) {
    const rawBody = await request.text();

    let body: any;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ status: false, message: "Invalid JSON" }, { status: 400 });
    }

    const { orderId, status, signature } = parseCallback(body);
    if (!orderId) {
        return NextResponse.json({ status: false, message: "Missing order_id" }, { status: 400 });
    }

    // order_id yang kita kirim = Payment.id; reference juga diisi order_id
    const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: orderId }, { reference: orderId }] }
    });

    if (!payment) {
        logger.warn("Billing", `Callback untuk order_id tidak dikenal: ${orderId}`);
        // balas 200 biar gateway berhenti retry untuk data sampah
        return NextResponse.json({ status: true, message: "Ignored (unknown order)" });
    }

    // Validasi signature terhadap signature yang disimpan saat create
    if (!verifyCallbackSignature(signature, payment.signature)) {
        logger.warn("Billing", `Signature callback tidak cocok untuk ${orderId} — ditolak`);
        return NextResponse.json({ status: false, message: "Invalid signature" }, { status: 401 });
    }

    try {
        if (status === "PAID") {
            // Idempotent: markPaymentPaidAndActivate skip kalau sudah PAID
            await markPaymentPaidAndActivate(payment.id);
        } else if (status === "EXPIRED" || status === "FAILED" || status === "CANCELLED") {
            if (payment.status !== "PAID") {
                await prisma.payment.update({ where: { id: payment.id }, data: { status } });
            }
        }
    } catch (e) {
        logger.error("Billing", "Gagal memproses callback:", e);
        return NextResponse.json({ status: false, message: "Processing error" }, { status: 500 });
    }

    return NextResponse.json({ status: true, message: "OK" });
}
