import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

// Upload media auto-broadcast → dikembalikan sebagai DATA URI (base64), bukan file.
// Disimpan di DB (kolom mediaUrl) supaya TIDAK hilang saat container restart
// (filesystem ephemeral, mis. Railway tanpa volume). Saat broadcast dikirim,
// data URI di-decode kembali jadi buffer.
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

        // Validate file size. Data URI disimpan di DB, jadi batasi lebih kecil (4MB)
        // agar tidak membebani DB/loading. Video besar sebaiknya pakai URL eksternal.
        const MAX = 4 * 1024 * 1024;
        if (file.size > MAX) {
            return NextResponse.json(
                { status: false, message: "File terlalu besar (maks 4MB untuk media tersimpan). Untuk file besar, pakai URL media eksternal." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
        const type = file.type.startsWith("image") ? "image" : "video";

        return NextResponse.json({
            status: true,
            message: "File uploaded",
            // url = data URI (disimpan di DB). filename hanya untuk tampilan.
            data: { url: dataUri, filename: file.name, type }
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ status: false, message: "Upload failed" }, { status: 500 });
    }
}
