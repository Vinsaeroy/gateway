import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getUsage } from "@/lib/rate-limit";
import { effectivePlan, CAPABILITIES, type Capability } from "@/lib/plans";
import { getMergedPlan } from "@/lib/plans-store";

export const dynamic = "force-dynamic";

function allCapsTrue(): Record<Capability, boolean> {
    const o = {} as Record<Capability, boolean>;
    for (const c of CAPABILITIES) o[c.id] = true;
    return o;
}

// GET /api/usage — pemakaian API user saat ini + limit + kapabilitas plannya.
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json(
            { status: false, message: "Unauthorized", error: "Unauthorized" },
            { status: 401 }
        );
    }

    const plan = effectivePlan(user as any);

    // SUPERADMIN: unlimited + semua kapabilitas aktif.
    if ((user as any).role === "SUPERADMIN") {
        return NextResponse.json({
            status: true,
            data: {
                plan: "ENTERPRISE",
                planName: "Enterprise (Superadmin)",
                planExpiresAt: null,
                dayCount: 0,
                monthCount: 0,
                dailyLimit: -1,
                monthlyLimit: -1,
                dailyRemaining: -1,
                monthlyRemaining: -1,
                unlimited: true,
                capabilities: allCapsTrue()
            }
        });
    }

    const usage = await getUsage(user.id, plan);
    const cfg = await getMergedPlan(plan);

    return NextResponse.json({
        status: true,
        data: {
            ...usage,
            planName: cfg.name,
            planExpiresAt: (user as any).planExpiresAt ?? null,
            capabilities: cfg.capabilities
        }
    });
}
