import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  serverExternalPackages: ["sharp", "bcryptjs"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingExcludes: {
    "*": ["./data/media/**"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  /**
   * CORS headers for `/api/*` so external sites can call the gateway with an
   * API key (e.g. `X-API-Key`) without browser preflight rejections.
   * Auth is still enforced inside each route via getAuthenticatedUser().
   */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-API-Key, X-Requested-With, Accept",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
