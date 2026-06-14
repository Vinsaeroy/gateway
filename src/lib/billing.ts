import { prisma } from "./prisma";
import { getPlanConfig } from "./plans";
import { logger } from "./logger";

/**
 * Tandai sebuah Payment sebagai PAID lalu aktifkan plan user.
 * Idempotent: kalau payment sudah PAID, tidak melakukan apa-apa.
 *
 * Perpanjangan masa aktif:
 * - kalau plan user masih aktif (planExpiresAt > now), durasi ditambahkan
 *   ke sisa masa aktif (extend).
 * - kalau sudah lewat / belum punya, dihitung dari sekarang.
 */
export async function markPaymentPaidAndActivate(paymentId: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment) {
            logger.warn("Billing", `Payment ${paymentId} tidak ditemukan`);
            return false;
        }
        if (payment.status === "PAID") {
            return true; // idempotent
        }

        const cfg = getPlanConfig(payment.plan);
        const durationDays = payment.durationDays || cfg.durationDays || 30;

        const user = await tx.user.findUnique({ where: { id: payment.userId } });
        const now = new Date();

        let base = now;
        if (
            user?.plan === payment.plan &&
            user?.planExpiresAt &&
            new Date(user.planExpiresAt).getTime() > now.getTime()
        ) {
            base = new Date(user.planExpiresAt); // extend dari sisa masa aktif
        }

        const newExpiry = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);

        await tx.payment.update({
            where: { id: payment.id },
            data: { status: "PAID", paidAt: now }
        });

        await tx.user.update({
            where: { id: payment.userId },
            data: { plan: payment.plan, planExpiresAt: newExpiry }
        });

        // Notifikasi in-app
        await tx.notification.create({
            data: {
                userId: payment.userId,
                title: `Plan ${cfg.name} aktif 🎉`,
                message: `Pembayaran berhasil. Plan ${cfg.name} aktif sampai ${newExpiry.toLocaleString("id-ID")}.`,
                type: "SUCCESS",
                href: "/dashboard/billing"
            }
        }).catch(() => {});

        logger.success("Billing", `Plan ${payment.plan} aktif untuk user ${payment.userId} s/d ${newExpiry.toISOString()}`);
        return true;
    });
}
