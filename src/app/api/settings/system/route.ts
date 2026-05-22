import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "default" }
        });

        // Only expose non-sensitive fields publicly (needed for UI branding)
        const safeConfig = config ? {
            appName: config.appName,
            faviconUrl: config.faviconUrl,
            logoUrl: config.logoUrl,
            timezone: config.timezone,
        } : { appName: "WA-AKG", faviconUrl: "/favicon.ico", timezone: "Asia/Jakarta" };

        return NextResponse.json({ status: true, message: "System config fetched", data: safeConfig });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to fetch settings", error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // @ts-ignore
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPERADMIN") {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { appName, logoUrl, faviconUrl, timezone, enableRegistration } = body;

        // @ts-ignore
        const config = await prisma.systemConfig.upsert({
            where: { id: "default" },
            update: { appName, logoUrl, faviconUrl, timezone, enableRegistration: enableRegistration ?? true },
            create: { id: "default", appName, logoUrl: logoUrl || "", faviconUrl: faviconUrl || "/favicon.ico", timezone: timezone || "Asia/Jakarta", enableRegistration: enableRegistration ?? true }
        });

        return NextResponse.json({ status: true, message: "System settings updated", data: config });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to update settings", error: "Failed to update settings" }, { status: 500 });
    }
}
