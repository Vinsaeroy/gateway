// Plan config efektif = default (lib/plans.ts) + override dari DB (SystemConfig.planConfig).
// SUPERADMIN bisa mengubah harga/limit/benefit via dashboard; perubahan tersimpan
// di DB dan di-merge di sini. Ada cache in-memory singkat supaya tidak query DB tiap request.
import { prisma } from "./prisma";
import { PLANS, PLAN_ORDER, type PlanConfig, type PlanId } from "./plans";

let cache: { data: Record<PlanId, PlanConfig>; at: number } | null = null;
const TTL_MS = 60_000;

/** Field plan yang boleh di-override SUPERADMIN. */
const OVERRIDABLE: (keyof PlanConfig)[] = [
    "name",
    "price",
    "durationDays",
    "dailyLimit",
    "monthlyLimit",
    "maxSessions",
    "highlight",
    "capabilities",
    "features",
];

function defaults(): Record<PlanId, PlanConfig> {
    return JSON.parse(JSON.stringify(PLANS));
}

/** Ambil semua plan dengan override DB diterapkan (cached). */
export async function getMergedPlans(): Promise<Record<PlanId, PlanConfig>> {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

    const merged = defaults();
    try {
        const cfg = await prisma.systemConfig.findUnique({
            where: { id: "default" },
            select: { planConfig: true },
        });
        const overrides = (cfg?.planConfig as Record<string, Partial<PlanConfig>> | null) || null;
        if (overrides && typeof overrides === "object") {
            for (const id of PLAN_ORDER) {
                const o = overrides[id];
                if (o && typeof o === "object") {
                    for (const key of OVERRIDABLE) {
                        if (o[key] !== undefined && o[key] !== null) {
                            if (key === "capabilities" && typeof o[key] === "object") {
                                // deep-merge supaya toggle yang tidak dikirim tetap pakai default
                                merged[id].capabilities = { ...merged[id].capabilities, ...(o[key] as object) } as Record<string, boolean> as any;
                            } else {
                                // @ts-expect-error index assign
                                merged[id][key] = o[key];
                            }
                        }
                    }
                    merged[id].id = id; // id tidak boleh di-override
                }
            }
        }
    } catch {
        // DB belum siap / kolom belum di-push → pakai default.
    }

    cache = { data: merged, at: Date.now() };
    return merged;
}

/** Plan tunggal (merged). */
export async function getMergedPlan(plan: string | null | undefined): Promise<PlanConfig> {
    const all = await getMergedPlans();
    const id = (plan || "FREE").toUpperCase() as PlanId;
    return all[id] || all.FREE;
}

/** Simpan override dari editor SUPERADMIN. Hanya field yang diizinkan yang disimpan. */
export async function savePlanOverrides(input: Record<string, Partial<PlanConfig>>) {
    const clean: Record<string, Partial<PlanConfig>> = {};
    for (const id of PLAN_ORDER) {
        const o = input?.[id];
        if (!o || typeof o !== "object") continue;
        const entry: Partial<PlanConfig> = {};
        for (const key of OVERRIDABLE) {
            if (o[key] !== undefined) {
                // @ts-expect-error index assign
                entry[key] = o[key];
            }
        }
        if (Object.keys(entry).length > 0) clean[id] = entry;
    }

    await prisma.systemConfig.upsert({
        where: { id: "default" },
        update: { planConfig: clean },
        create: { id: "default", planConfig: clean },
    });
    invalidatePlansCache();
    return clean;
}

export function invalidatePlansCache() {
    cache = null;
}
