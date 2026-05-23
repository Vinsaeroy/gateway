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

    // Allow known static asset extensions in root path only (e.g. /vercel.svg)
    const staticExtensions = [".svg", ".ico", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2", ".ttf"];
    if (pathname.lastIndexOf("/") === 0 && staticExtensions.some(ext => pathname.endsWith(ext))) {
        return NextResponse.next();
    }

    // API routes: Check for API key or session
    if (pathname.startsWith("/api/")) {
        // Skip auth endpoints
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/test")) {
            return NextResponse.next();
        }

        // Check for API key in header
        const apiKey = request.headers.get("x-api-key");
        if (apiKey) {
            return NextResponse.next();
        }

        // Check for session auth
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.next();
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
