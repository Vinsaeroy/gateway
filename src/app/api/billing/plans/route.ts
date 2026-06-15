import { NextResponse } from "next/server";
import { PLAN_ORDER } from "@/lib/plans";
import { getMergedPlans } from "@/lib/plans-store";

export const dynamic = "force-dynamic";

// Publik: daftar plan + harga + limit (sudah termasuk override SUPERADMIN dari DB).
// Dipakai landing & halaman pricing.
export async function GET() {
    const all = await getMergedPlans();
    const plans = PLAN_ORDER.map((id) => all[id]);
    return NextResponse.json({ status: true, data: plans });
}
