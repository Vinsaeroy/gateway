import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getAuthenticatedUser } from "./api-auth";
import { effectivePlan, getPlanConfig, planAllows, type Capability, type PlanId } from "./plans";
import { getMergedPlan } from "./plans-store";
import { logger } from "./logger";

/**
 * Tanggal hari & bulan dalam timezone Asia/Jakarta.
 * en-CA menghasilkan format YYYY-MM-DD.
 */
function jakartaParts(d = new Date()): { day: string; month: string } {
    const day = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(d);
    return { day, month: day.slice(0, 7) };
}

export interface UsageInfo {
    plan: PlanId;
    dayCount: number;
    monthCount: number;
    dailyLimit: number;
    monthlyLimit: number;
    dailyRemaining: number;
    monthlyRemaining: number;
}

function remaining(limit: number, used: number): number {
    if (limit < 0) return -1; // unlimited
    return Math.max(0, limit - used);
}

/**
 * Baca pemakaian saat ini (tanpa menambah counter).
 */
export async function getUsage(userId: string, plan: PlanId): Promise<UsageInfo> {
    const { day, month } = jakartaParts();
    const cfg = await getMergedPlan(plan);

    const [today, monthAgg] = await Promise.all([
        prisma.apiUsage.findUnique({ where: { userId_day: { userId, day } } }),
        prisma.apiUsage.aggregate({ _sum: { count: true }, where: { userId, month } })
    ]);

    const dayCount = today?.count ?? 0;
    const monthCount = monthAgg._sum.count ?? 0;

    return {
        plan,
        dayCount,
        monthCount,
        dailyLimit: cfg.dailyLimit,
        monthlyLimit: cfg.monthlyLimit,
        dailyRemaining: remaining(cfg.dailyLimit, dayCount),
        monthlyRemaining: remaining(cfg.monthlyLimit, monthCount)
    };
}

export interface ConsumeResult {
    allowed: boolean;
    scope?: "day" | "month";
    usage: UsageInfo;
}

/**
 * Cek limit lalu tambah counter 1 kalau masih boleh.
 * (ada sedikit race antara cek & increment, cukup untuk use-case ini)
 */
export async function consumeQuota(userId: string, plan: PlanId): Promise<ConsumeResult> {
    const { day, month } = jakartaParts();
    const cfg = await getMergedPlan(plan);
    const usage = await getUsage(userId, plan);

    if (cfg.dailyLimit >= 0 && usage.dayCount >= cfg.dailyLimit) {
        return { allowed: false, scope: "day", usage };
    }
    if (cfg.monthlyLimit >= 0 && usage.monthCount >= cfg.monthlyLimit) {
        return { allowed: false, scope: "month", usage };
    }

    await prisma.apiUsage.upsert({
        where: { userId_day: { userId, day } },
        create: { userId, day, month, count: 1 },
        update: { count: { increment: 1 } }
    });

    const next: UsageInfo = {
        ...usage,
        dayCount: usage.dayCount + 1,
        monthCount: usage.monthCount + 1,
        dailyRemaining: remaining(cfg.dailyLimit, usage.dayCount + 1),
        monthlyRemaining: remaining(cfg.monthlyLimit, usage.monthCount + 1)
    };

    return { allowed: true, usage: next };
}

type EnforceResult =
    | { user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>; usage: UsageInfo; error?: undefined }
    | { error: NextResponse; user?: undefined; usage?: undefined };

/**
 * Helper utama untuk dipakai di API route:
 *   const gate = await enforceApiQuota(request);
 *   if (gate.error) return gate.error;
 *   const { user } = gate;
 *
 * Melakukan: autentikasi → cek plan efektif → konsumsi 1 quota.
 * Balikin 401 kalau tak terotentikasi, 429 kalau limit habis.
 */
export async function enforceApiQuota(request: NextRequest, capability?: Capability): Promise<EnforceResult> {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return {
            error: NextResponse.json(
                { status: false, message: "Unauthorized", error: "Unauthorized" },
                { status: 401 }
            )
        };
    }

    // SUPERADMIN: plan unlimited — lewati kuota & gating kapabilitas sepenuhnya
    if ((user as any).role === "SUPERADMIN") {
        return {
            user,
            usage: {
                plan: "ENTERPRISE",
                dayCount: 0,
                monthCount: 0,
                dailyLimit: -1,
                monthlyLimit: -1,
                dailyRemaining: -1,
                monthlyRemaining: -1
            }
        };
    }

    const plan = effectivePlan(user as any);

    // Gating kapabilitas: tolak kalau fitur dimatikan di plan user.
    if (capability) {
        const cfg = await getMergedPlan(plan);
        if (!planAllows(cfg, capability)) {
            return {
                error: NextResponse.json(
                    {
                        status: false,
                        message: `Fitur ini tidak tersedia di plan ${plan}. Upgrade plan untuk mengaksesnya.`,
                        error: "feature_not_in_plan",
                        data: { plan, capability }
                    },
                    { status: 403 }
                )
            };
        }
    }

    try {
        const result = await consumeQuota(user.id, plan);
        if (!result.allowed) {
            const scopeLabel = result.scope === "day" ? "harian" : "bulanan";
            return {
                error: NextResponse.json(
                    {
                        status: false,
                        message: `Limit ${scopeLabel} plan ${plan} sudah habis. Upgrade plan untuk kuota lebih besar.`,
                        error: "rate_limited",
                        data: {
                            plan,
                            scope: result.scope,
                            usage: result.usage
                        }
                    },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit-Day": String(result.usage.dailyLimit),
                            "X-RateLimit-Limit-Month": String(result.usage.monthlyLimit),
                            "X-RateLimit-Remaining-Day": String(result.usage.dailyRemaining),
                            "X-RateLimit-Remaining-Month": String(result.usage.monthlyRemaining)
                        }
                    }
                )
            };
        }
        return { user, usage: result.usage };
    } catch (e) {
        // Kalau pencatatan usage gagal, jangan blokir request (fail-open),
        // tapi tetap log biar ketahuan.
        logger.error("RateLimit", "Gagal konsumsi quota:", e);
        return { user, usage: await getUsage(user.id, plan).catch(() => ({
            plan,
            dayCount: 0,
            monthCount: 0,
            dailyLimit: getPlanConfig(plan).dailyLimit,
            monthlyLimit: getPlanConfig(plan).monthlyLimit,
            dailyRemaining: -1,
            monthlyRemaining: -1
        } as UsageInfo)) };
    }
}


/**
 * Cek auth + kapabilitas plan TANPA mengonsumsi kuota.
 * Untuk endpoint konfigurasi (buat webhook, scheduler, auto-reply, dll):
 *   const gate = await enforceCapability(request, "webhook");
 *   if (gate.error) return gate.error;
 *   const { user } = gate;
 */
export async function enforceCapability(
    request: NextRequest,
    capability: Capability
): Promise<
    | { user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>; error?: undefined }
    | { error: NextResponse; user?: undefined }
> {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return {
            error: NextResponse.json(
                { status: false, message: "Unauthorized", error: "Unauthorized" },
                { status: 401 }
            )
        };
    }
    if ((user as any).role === "SUPERADMIN") return { user };

    const plan = effectivePlan(user as any);
    const cfg = await getMergedPlan(plan);
    if (!planAllows(cfg, capability)) {
        return {
            error: NextResponse.json(
                {
                    status: false,
                    message: `Fitur ini tidak tersedia di plan ${plan}. Upgrade plan untuk mengaksesnya.`,
                    error: "feature_not_in_plan",
                    data: { plan, capability }
                },
                { status: 403 }
            )
        };
    }
    return { user };
}
