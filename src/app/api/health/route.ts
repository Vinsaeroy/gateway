import { NextResponse } from "next/server";

// Health check ringan untuk Railway/Render: TIDAK menyentuh DB/filesystem,
// jadi cepat & selalu 200 selama proses hidup. Mencegah restart loop akibat
// health check ke "/" yang lambat (baca docs + query DB).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    return NextResponse.json({ status: true, ok: true, uptime: process.uptime(), ts: Date.now() });
}
