import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Batasi root ke folder marketing supaya tidak ketukar dengan lockfile app utama
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
