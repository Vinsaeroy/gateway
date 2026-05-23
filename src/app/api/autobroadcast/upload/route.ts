import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ status: false, message: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ status: false, message: "Only JPG, PNG, WebP, and MP4 allowed" }, { status: 400 });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ status: false, message: "File too large (max 10MB)" }, { status: 400 });
        }

        // Save file
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
        const filename = `broadcast-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "data", "media");

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);

        const fileUrl = `/api/media/${filename}`;

        return NextResponse.json({
            status: true,
            message: "File uploaded",
            data: { url: fileUrl, filename, type: file.type.startsWith("image") ? "image" : "video" }
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ status: false, message: "Upload failed" }, { status: 500 });
    }
}
