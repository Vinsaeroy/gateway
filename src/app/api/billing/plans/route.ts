import { NextResponse } from "next/server";
import { PLANS, PLAN_ORDER } from "@/lib/plans";

// Publik: daftar plan + harga + limit. Dipakai landing & halaman pricing.
export async function GET() {
    const plans = PLAN_ORDER.map((id) => PLANS[id]);
    return NextResponse.json({ status: true, data: plans });
}
