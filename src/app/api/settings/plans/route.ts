import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getMergedPlans, savePlanOverrides } from "@/lib/plans-store";
import { PLAN_ORDER } from "@/lib/plans";

export const dynamic = "force-dynamic";

// GET: plan efektif saat ini (default + override) — SUPERADMIN only.
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "SUPERADMIN") {
        return NextResponse.json({ status: false, message: "Forbidden — SUPERADMIN only" }, { status: 403 });
    }
    const all = await getMergedPlans();
    return NextResponse.json({ status: true, data: PLAN_ORDER.map((id) => all[id]) });
}

// POST: simpan override plan — SUPERADMIN only.
// Body: { FREE: {...}, STANDARD: {...}, PRO: {...}, ENTERPRISE: {...} }
export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "SUPERADMIN") {
        return NextResponse.json({ status: false, message: "Forbidden — SUPERADMIN only" }, { status: 403 });
    }

    let body: Record<string, any> = {};
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ status: false, message: "Invalid JSON" }, { status: 400 });
    }

    // Normalisasi tipe angka & array fitur agar tidak menyimpan string mentah.
    const normalized: Record<string, any> = {};
    for (const id of PLAN_ORDER) {
        const o = body?.[id];
        if (!o || typeof o !== "object") continue;
        const entry: Record<string, any> = {};
        if (o.name !== undefined) entry.name = String(o.name);
        if (o.price !== undefined) entry.price = o.price === null || o.price === "" ? null : Number(o.price);
        if (o.durationDays !== undefined) entry.durationDays = Number(o.durationDays);
        if (o.dailyLimit !== undefined) entry.dailyLimit = Number(o.dailyLimit);
        if (o.monthlyLimit !== undefined) entry.monthlyLimit = Number(o.monthlyLimit);
        if (o.maxSessions !== undefined) entry.maxSessions = Number(o.maxSessions);
        if (o.highlight !== undefined) entry.highlight = Boolean(o.highlight);
        if (o.features !== undefined) {
            entry.features = Array.isArray(o.features)
                ? o.features.map((f: unknown) => String(f)).filter((f: string) => f.trim() !== "")
                : String(o.features)
                      .split("\n")
                      .map((f) => f.trim())
                      .filter(Boolean);
        }
        normalized[id] = entry;
    }

    const saved = await savePlanOverrides(normalized);
    const all = await getMergedPlans();
    return NextResponse.json({
        status: true,
        message: "Konfigurasi plan disimpan",
        data: PLAN_ORDER.map((id) => all[id]),
        saved,
    });
}
