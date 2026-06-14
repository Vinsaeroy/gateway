// ============================================================
// PLAN & PRICING CONFIG (sumber kebenaran tunggal)
// ------------------------------------------------------------
// Ubah angka/harga di sini aja — landing page, pembatasan API,
// dan checkout semua ikut dari config ini.
//
// Catatan limit:
// - FREE  : 1000 request/bulan, 100 request/hari (sesuai permintaan)
// - lainnya: REKOMENDASI, silakan disesuaikan kapan saja.
// - limit -1 = unlimited.
// ============================================================

export type PlanId = "FREE" | "STANDARD" | "PRO" | "ENTERPRISE";

export interface PlanConfig {
    id: PlanId;
    name: string;
    /** Harga per bulan dalam IDR. 0 = gratis, null = custom/hubungi sales */
    price: number | null;
    /** Durasi langganan dalam hari saat dibeli */
    durationDays: number;
    /** Limit request API per hari (-1 = unlimited) */
    dailyLimit: number;
    /** Limit request API per bulan (-1 = unlimited) */
    monthlyLimit: number;
    /** Maksimum sesi WhatsApp (-1 = unlimited) */
    maxSessions: number;
    /** Ditandai "paling populer" di UI */
    highlight?: boolean;
    /** Daftar fitur yang ditampilkan di kartu pricing */
    features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
    FREE: {
        id: "FREE",
        name: "Free",
        price: 0,
        durationDays: 0, // tidak kedaluwarsa
        dailyLimit: 100,
        monthlyLimit: 1000,
        maxSessions: 1,
        features: [
            "1 sesi WhatsApp",
            "100 request / hari",
            "1.000 request / bulan",
            "Auto-reply dasar",
            "Akses REST API",
            "Komunitas support"
        ]
    },
    STANDARD: {
        id: "STANDARD",
        name: "Standard",
        price: 50000, // rekomendasi — silakan disesuaikan
        durationDays: 30,
        dailyLimit: 1000,
        monthlyLimit: 20000,
        maxSessions: 3,
        highlight: true,
        features: [
            "3 sesi WhatsApp",
            "1.000 request / hari",
            "20.000 request / bulan",
            "Auto-reply + scheduler",
            "Webhook event",
            "Email support"
        ]
    },
    PRO: {
        id: "PRO",
        name: "Pro",
        price: 150000, // rekomendasi — silakan disesuaikan
        durationDays: 30,
        dailyLimit: 5000,
        monthlyLimit: 100000,
        maxSessions: 10,
        features: [
            "10 sesi WhatsApp",
            "5.000 request / hari",
            "100.000 request / bulan",
            "Semua fitur Standard",
            "Auto broadcast",
            "Priority support"
        ]
    },
    ENTERPRISE: {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: null, // custom / hubungi sales
        durationDays: 30,
        dailyLimit: -1,
        monthlyLimit: -1,
        maxSessions: -1,
        features: [
            "Sesi WhatsApp unlimited",
            "Request unlimited",
            "Semua fitur Pro",
            "SLA & dedicated server",
            "Onboarding khusus",
            "Dedicated support"
        ]
    }
};

export const PLAN_ORDER: PlanId[] = ["FREE", "STANDARD", "PRO", "ENTERPRISE"];

export function getPlanConfig(plan: string | null | undefined): PlanConfig {
    const id = (plan || "FREE").toUpperCase() as PlanId;
    return PLANS[id] || PLANS.FREE;
}

/**
 * Plan efektif: kalau langganan berbayar sudah lewat masa aktif,
 * otomatis dianggap FREE.
 */
export function effectivePlan(user: {
    plan?: string | null;
    planExpiresAt?: Date | string | null;
}): PlanId {
    const plan = (user.plan || "FREE").toUpperCase() as PlanId;
    if (plan === "FREE" || !PLANS[plan]) return "FREE";

    // FREE tidak punya expiry; plan berbayar dicek tanggalnya
    if (user.planExpiresAt) {
        const exp = new Date(user.planExpiresAt).getTime();
        if (!Number.isNaN(exp) && exp < Date.now()) return "FREE";
    }
    return plan;
}

export function formatIDR(amount: number | null): string {
    if (amount === null) return "Custom";
    if (amount === 0) return "Gratis";
    return "Rp" + amount.toLocaleString("id-ID");
}
