import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/swagger";

// next-swagger-doc memindai file sumber pakai `fs`, jadi WAJIB Node.js runtime
// (bukan Edge) dan jangan di-cache statis saat build (force-dynamic).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    // Jangan biarkan halaman /swagger blank kalau pemindaian spec gagal di prod.
    // Kembalikan spec minimal yang valid + info error supaya UI tetap render.
    console.error("[api/docs] Failed to build OpenAPI spec:", err);
    const fallback = {
      openapi: "3.0.0",
      info: {
        title: "WA-AKG API Documentation",
        version: "1.2.0",
        description:
          "⚠️ Gagal memuat spesifikasi lengkap di server. Cek log server. " +
          "Endpoint tetap berfungsi; ini hanya tampilan dokumentasinya.",
      },
      paths: {},
    };
    return NextResponse.json(fallback, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
