import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { validateExternalUrl } from "@/lib/url-security";
import crypto from "crypto";

export const runtime = "nodejs";

// Kirim payload uji ke URL webhook dan kembalikan status HTTP-nya.
// Berguna untuk men-debug webhook yang gagal (mis. 404) tanpa menebak-nebak.
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, id } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session" }, { status: 403 });
    }

    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true },
    });
    if (!session) {
        return NextResponse.json({ status: false, message: "Session not found" }, { status: 404 });
    }

    const webhook = await prisma.webhook.findFirst({
        where: {
            id,
            userId: user.id,
            OR: [{ sessionId: session.id }, { sessionId: null }],
        },
    });
    if (!webhook) {
        return NextResponse.json({ status: false, message: "Webhook not found" }, { status: 404 });
    }

    // Proteksi SSRF — pastikan URL aman (bukan localhost/IP internal).
    const urlCheck = validateExternalUrl(webhook.url);
    if (!urlCheck.valid) {
        return NextResponse.json(
            { status: false, message: urlCheck.reason || "Invalid URL", error: urlCheck.reason },
            { status: 400 }
        );
    }

    const payload = {
        event: "webhook.test",
        sessionId,
        timestamp: new Date().toISOString(),
        data: { message: "Ini payload uji dari WA-AKG. Kalau kamu menerima ini, webhook-mu berfungsi." },
    };
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "WA-AKG-Webhook/1.0",
    };
    if (webhook.secret) {
        const signature = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    try {
        const res = await fetch(webhook.url, {
            method: "POST",
            headers,
            body,
            signal: AbortSignal.timeout(10000),
        });

        let snippet = "";
        try {
            snippet = (await res.text()).slice(0, 300);
        } catch {
            /* ignore body read errors */
        }

        return NextResponse.json({
            status: res.ok,
            httpStatus: res.status,
            statusText: res.statusText,
            ok: res.ok,
            message: res.ok
                ? `Berhasil! Server tujuan membalas ${res.status} ${res.statusText}.`
                : `Server tujuan membalas ${res.status} ${res.statusText}. ${res.status === 404 ? "URL salah / endpoint tidak ada — perbaiki URL-nya." : "Pastikan endpoint menerima POST dan membalas 2xx."}`,
            responsePreview: snippet,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const isTimeout = msg.includes("timeout") || msg.includes("aborted") || msg.includes("timed out");
        return NextResponse.json({
            status: false,
            ok: false,
            message: isTimeout
                ? "Gagal: URL tidak merespons dalam 10 detik (timeout). Cek apakah server tujuan online."
                : `Gagal terhubung ke URL: ${msg}. Cek apakah URL benar dan bisa diakses dari internet.`,
        });
    }
}
