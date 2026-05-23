import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "./src/auth.config";

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
    // Get the proper host from headers (Railway proxy provides x-forwarded-host)
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    const properHost = forwardedHost || host;
    const properProto = request.headers.get("x-forwarded-proto") || "https";

    // Run the auth middleware - cast to any to avoid type issues with NextAuth's middleware signature
    const response = await (authMiddleware as any)(request, {});

    // If response is a redirect, fix the URL
    if (response instanceof NextResponse || (response && typeof response.headers?.get === "function")) {
        const location = response.headers?.get("location");
        if (location && properHost) {
            try {
                const url = new URL(location, `${properProto}://${properHost}`);
                // Only fix if location had wrong host
                if (url.hostname === "0.0.0.0" || url.hostname === "localhost" || url.hostname === "127.0.0.1") {
                    url.hostname = properHost.split(":")[0];
                    url.protocol = `${properProto}:`;
                    url.port = "";
                    response.headers.set("location", url.toString());
                }
                // Also fix callbackUrl in query params
                const callbackUrl = url.searchParams.get("callbackUrl");
                if (callbackUrl && (callbackUrl.includes("0.0.0.0") || callbackUrl.includes("localhost"))) {
                    try {
                        const cbUrl = new URL(callbackUrl);
                        url.searchParams.set("callbackUrl", `${properProto}://${properHost}${cbUrl.pathname}${cbUrl.search}`);
                        response.headers.set("location", url.toString());
                    } catch {
                        // If callback url is just a path, it's fine
                    }
                }
            } catch {
                // ignore URL parse errors
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
