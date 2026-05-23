import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "./src/auth.config";

const authMiddleware = NextAuth(authConfig).auth;

// Get the canonical public URL (without trailing slash)
function getPublicUrl(): string {
    const url = process.env.NEXTAUTH_URL || process.env.BASE_URL || "https://rifalos.shop";
    return url.replace(/\/$/, "");
}

export default async function middleware(request: NextRequest) {
    const response = await (authMiddleware as any)(request, {});

    if (response?.headers) {
        const location = response.headers.get("location");
        if (location) {
            const publicUrl = getPublicUrl();

            try {
                let publicHost: URL;
                try {
                    publicHost = new URL(publicUrl);
                } catch {
                    return response;
                }

                // Try to parse the location URL — it may be absolute or relative
                let targetUrl: URL;
                if (location.startsWith("http://") || location.startsWith("https://")) {
                    targetUrl = new URL(location);
                } else {
                    targetUrl = new URL(location, publicUrl);
                }

                // Force the host to be the public host (no matter what)
                targetUrl.protocol = publicHost.protocol;
                targetUrl.hostname = publicHost.hostname;
                targetUrl.port = publicHost.port;

                // Also fix nested callbackUrl
                const cb = targetUrl.searchParams.get("callbackUrl");
                if (cb) {
                    try {
                        const cbUrl = cb.startsWith("http") ? new URL(cb) : new URL(cb, publicUrl);
                        cbUrl.protocol = publicHost.protocol;
                        cbUrl.hostname = publicHost.hostname;
                        cbUrl.port = publicHost.port;
                        targetUrl.searchParams.set("callbackUrl", cbUrl.toString());
                    } catch {
                        // ignore
                    }
                }

                response.headers.set("location", targetUrl.toString());
            } catch {
                // ignore parse errors
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
