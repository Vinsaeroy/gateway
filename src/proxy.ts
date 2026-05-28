import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Get the canonical public URL from env vars (no trailing slash)
function getPublicBase(request: NextRequest): string {
    const envUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;
    if (envUrl) return envUrl.replace(/\/$/, "");
    
    // Fallback: use forwarded headers if available
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
    
    // Last resort
    return new URL(request.url).origin;
}

// Build a URL using the public base (avoids 0.0.0.0/127.0.0.1 leakage)
function buildPublicUrl(path: string, request: NextRequest): URL {
    return new URL(path, getPublicBase(request));
}

/**
 * CORS headers for `/api/*` routes.
 * Reflects the request's Origin so calls from any external site with a valid
 * API key (X-API-Key header) work seamlessly. Public-key-only data is fine
 * because every protected route already validates the API key server-side.
 */
function corsHeaders(request: NextRequest): Record<string, string> {
    const origin = request.headers.get("origin") || "*";
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-API-Key, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    };
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/auth/login", "/auth/register", "/api/auth", "/api/test", "/terms", "/privacy"];

    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow Next.js internals and favicon only
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // CRITICAL: Always pass through NextAuth API routes - never intercept
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Redirect old /login path to /auth/login (in case of stale links)
    if (pathname === "/login") {
        return NextResponse.redirect(buildPublicUrl("/auth/login", request));
    }
    if (pathname === "/register") {
        return NextResponse.redirect(buildPublicUrl("/auth/register", request));
    }

    // Allow known static asset extensions in root path only (e.g. /vercel.svg)
    const staticExtensions = [".svg", ".ico", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2", ".ttf"];
    if (pathname.lastIndexOf("/") === 0 && staticExtensions.some(ext => pathname.endsWith(ext))) {
        return NextResponse.next();
    }

    // API routes: Let each route handle its own auth via getAuthenticatedUser()
    // (proxy double-check causes false 401 due to middleware timing)
    if (pathname.startsWith("/api/")) {
        // CORS for cross-origin API calls (used by external sites with API key)
        // Handle preflight OPTIONS requests right here so they never hit the route handler.
        if (request.method === "OPTIONS") {
            return new NextResponse(null, {
                status: 204,
                headers: corsHeaders(request),
            });
        }
        const res = NextResponse.next();
        const cors = corsHeaders(request);
        for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
        return res;
    }

    // Dashboard routes: Require login
    if (pathname.startsWith("/dashboard")) {
        const session = await auth();

        if (!session?.user) {
            const loginUrl = buildPublicUrl("/auth/login", request);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    }

    // Root path — redirect to dashboard if logged in
    if (pathname === "/") {
        const session = await auth();
        if (session?.user) {
            return NextResponse.redirect(buildPublicUrl("/dashboard", request));
        }
        return NextResponse.next();
    }

    // Public routes
    if (isPublicRoute) {
        const session = await auth();
        if (session?.user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
            return NextResponse.redirect(buildPublicUrl("/dashboard", request));
        }
        return NextResponse.next();
    }

    // Default: require auth for everything else
    const session = await auth();
    if (!session?.user) {
        const loginUrl = buildPublicUrl("/auth/login", request);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
