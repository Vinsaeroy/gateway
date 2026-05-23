import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "./src/auth.config";

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
    const response = await (authMiddleware as any)(request, {});

    // After NextAuth runs, fix any redirect that contains internal hostnames
    if (response?.headers) {
        const location = response.headers.get("location");
        if (location) {
            const publicHost = process.env.NEXTAUTH_URL || process.env.BASE_URL;
            
            if (publicHost) {
                // Detect bad internal hostnames in the location
                const badHostsRegex = /(0\.0\.0\.0|127\.0\.0\.1|localhost)(:\d+)?/;
                
                if (badHostsRegex.test(location)) {
                    try {
                        const fixedUrl = new URL(location);
                        const publicUrl = new URL(publicHost);
                        fixedUrl.protocol = publicUrl.protocol;
                        fixedUrl.host = publicUrl.host;
                        fixedUrl.port = publicUrl.port;
                        
                        // Also fix nested callbackUrl
                        const cb = fixedUrl.searchParams.get("callbackUrl");
                        if (cb && badHostsRegex.test(cb)) {
                            try {
                                const cbUrl = new URL(cb);
                                cbUrl.protocol = publicUrl.protocol;
                                cbUrl.host = publicUrl.host;
                                cbUrl.port = publicUrl.port;
                                fixedUrl.searchParams.set("callbackUrl", cbUrl.toString());
                            } catch {}
                        }
                        
                        response.headers.set("location", fixedUrl.toString());
                    } catch {
                        // ignore
                    }
                }
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
