import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { isLocale } from "@/i18n/config";

export async function GET(request: NextRequest) {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "default" },
            select: {
                appName: true,
                faviconUrl: true,
                logoUrl: true,
                timezone: true,
                language: true,
                enableRegistration: true
            }
        });

        // Public fields (needed for UI branding everywhere)
        const safeConfig = config ? {
            appName: config.appName,
            faviconUrl: config.faviconUrl,
            logoUrl: config.logoUrl,
            timezone: config.timezone,
            language: config.language,
        } : { appName: "WA-AKG", faviconUrl: "/favicon.ico", timezone: "Asia/Jakarta", language: "en" };

        // Admin-only sensitive fields — return only when caller is SUPERADMIN
        try {
            const user = await getAuthenticatedUser(request);
            if (user?.role === "SUPERADMIN" && config) {
                return NextResponse.json({
                    status: true,
                    message: "System config fetched",
                    data: {
                        ...safeConfig,
                        enableRegistration: config.enableRegistration,
                    },
                });
            }
        } catch {
            // unauthenticated — fall through to public response
        }

        return NextResponse.json({ status: true, message: "System config fetched", data: safeConfig });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to fetch settings", error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPERADMIN") {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { appName, logoUrl, faviconUrl, timezone, language, enableRegistration } = body;

        // Build patch object only with provided fields, so partial updates don't wipe others
        const patch: Record<string, unknown> = {};
        if (appName !== undefined) patch.appName = appName;
        if (logoUrl !== undefined) patch.logoUrl = logoUrl;
        if (faviconUrl !== undefined) patch.faviconUrl = faviconUrl;
        if (timezone !== undefined) patch.timezone = timezone;
        if (language !== undefined) {
            if (!isLocale(language)) {
                return NextResponse.json({ status: false, message: "Invalid language", error: "Invalid language" }, { status: 400 });
            }
            patch.language = language;
        }
        if (enableRegistration !== undefined) patch.enableRegistration = enableRegistration;

        const config = await prisma.systemConfig.upsert({
            where: { id: "default" },
            update: patch,
            create: {
                id: "default",
                appName: appName ?? "WA-AKG",
                logoUrl: logoUrl ?? "",
                faviconUrl: faviconUrl ?? "/favicon.ico",
                timezone: timezone ?? "Asia/Jakarta",
                language: isLocale(language) ? language : "en",
                enableRegistration: enableRegistration ?? true,
            },
        });

        return NextResponse.json({ status: true, message: "System settings updated", data: config });
    } catch (error) {
        console.error("Update system settings error:", error);
        return NextResponse.json({ status: false, message: "Failed to update settings", error: "Failed to update settings" }, { status: 500 });
    }
}
