import type { NextConfig } from "next";
import path from "path";

// URL dashboard utama (engine WA-AKG yang always-on).
// Diambil dari env NEXT_PUBLIC_DASHBOARD_URL supaya TIDAK hardcode.
// Fallback: di dev -> localhost, di production -> kosong (redirect dimatikan
// kalau env tidak di-set, biar tidak diam-diam mengarah ke domain orang lain).
const DASHBOARD_URL = (
  process.env.NEXT_PUBLIC_DASHBOARD_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Batasi root ke folder marketing supaya tidak ketukar dengan lockfile app utama
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    // Tanpa DASHBOARD_URL, jangan buat redirect (hindari hardcode domain).
    if (!DASHBOARD_URL) return [];
    return [
      { source: "/dashboard", destination: `${DASHBOARD_URL}/dashboard`, permanent: false },
      { source: "/dashboard/:path*", destination: `${DASHBOARD_URL}/dashboard/:path*`, permanent: false },
      { source: "/auth/:path*", destination: `${DASHBOARD_URL}/auth/:path*`, permanent: false },
      { source: "/swagger", destination: `${DASHBOARD_URL}/swagger`, permanent: false },
      { source: "/api/:path*", destination: `${DASHBOARD_URL}/api/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
