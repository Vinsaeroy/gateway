import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getUsage } from "@/lib/rate-limit";
import { effectivePlan, getPlanConfig } from "@/lib/plans";

// GET /api/usage — pemakaian API user saat ini + limit plannya.
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json(
            { status: false, message: "Unauthorized", error: "Unauthorized" },
            { status: 401 }
        );
    }

    const plan = effectivePlan(user as any);

    // SUPERADMIN: tampilkan unlimited (tidak terikat plan/kuota)
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
                unlimited: true
            }
        });
    }

    const usage = await getUsage(user.id, plan);
    const cfg = getPlanConfig(plan);

    return NextResponse.json({
        status: true,
        data: {
            ...usage,
            planName: cfg.name,
            planExpiresAt: (user as any).planExpiresAt ?? null
        }
    });
}
