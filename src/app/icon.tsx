import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

// Use nodejs runtime to allow Prisma access
export const runtime = "nodejs";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default async function Icon() {
    // Default config
    let letter = "W";
    let color = "#16a34a"; // green-600

    try {
        // Fetch system config
        // @ts-ignore
        const config = await prisma.systemConfig.findUnique({
            where: { id: "default" }
        });

        if (config?.appName) {
            letter = config.appName.charAt(0).toUpperCase();
        }
    } catch (e) {
        console.error("Failed to fetch favicon config", e);
    }

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    background: color,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "20%", // Rounded square looks more app-like
                    fontFamily: 'sans-serif'
                }}
            >
                {letter}
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
