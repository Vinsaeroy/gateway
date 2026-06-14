import { prisma } from "./prisma";
import { logger } from "./logger";

// ============================================================
// KLIKQRIS PAYMENT CLIENT
// ------------------------------------------------------------
// Sesuai dokumentasi resmi: https://klikqris.com/dokumentasi-api
//
// Kredensial diambil dari DB (SystemConfig) yang HANYA bisa diatur
// SUPERADMIN. Kalau DB kosong, fallback ke ENV (kompatibilitas lama).
//
// Header wajib di tiap request:
//   x-api-key:   <API_KEY>
//   id_merchant: <MERCHANT_ID>
//
// Endpoint:
//   POST {BASE}/qris/create            -> buat tagihan QRIS
//   GET  {BASE}/qris/status/{order_id} -> cek status
// ============================================================

export type NormalizedStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "CANCELLED";

interface KlikQrisConfig {
    baseUrl: string;
    apiKey: string;
    merchantId: string;
    enabled: boolean;
}

/**
 * Ambil konfigurasi KlikQRIS: utamakan DB (diatur admin), fallback ENV.
 */
export async function getKlikQrisConfig(): Promise<KlikQrisConfig> {
    let baseUrl = process.env.KLIKQRIS_BASE_URL || "https://klikqris.com/api";
    let apiKey = process.env.KLIKQRIS_API_KEY || "";
    let merchantId = process.env.KLIKQRIS_MERCHANT_ID || "";
    let enabled = false;

    try {
        const cfg = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        if (cfg) {
            if (cfg.klikqrisBaseUrl) baseUrl = cfg.klikqrisBaseUrl;
            if (cfg.klikqrisApiKey) apiKey = cfg.klikqrisApiKey;
            if (cfg.klikqrisMerchantId) merchantId = cfg.klikqrisMerchantId;
            enabled = Boolean(cfg.klikqrisEnabled);
        }
    } catch (e) {
        logger.warn("KlikQRIS", "Gagal baca config dari DB, pakai ENV:", e);
    }

    // Kalau pakai ENV (tanpa DB), anggap aktif kalau key & merchant terisi
    if (!enabled && apiKey && merchantId && !process.env.KLIKQRIS_FORCE_DB) {
        enabled = true;
    }

    return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey, merchantId, enabled };
}

export async function isKlikQrisConfigured(): Promise<boolean> {
    const c = await getKlikQrisConfig();
    return Boolean(c.enabled && c.apiKey && c.merchantId);
}

export interface CreateQrisInput {
    amount: number; // IDR (nominal dasar / harga plan)
    orderId: string; // id unik kita (Payment.id) -> dikirim sebagai order_id
    description?: string;
}

export interface CreateQrisResult {
    reference: string; // order_id (echo)
    qrImageUrl: string | null; // qris_url atau data-uri qris_image
    totalAmount: number | null; // total_amount = nominal akhir yg ditagih
    signature: string | null; // dipakai validasi webhook
    expiresAt: Date | null;
    raw: any;
}

function toInt(v: any): number | null {
    if (v === undefined || v === null) return null;
    const n = Math.round(Number(v));
    return Number.isNaN(n) ? null : n;
}

function parseKlikDate(s: any): Date | null {
    if (!s) return null;
    // format "2026-06-14 10:51:50" -> anggap waktu lokal server, treat as ISO-ish
    const iso = String(s).replace(" ", "T");
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Buat transaksi QRIS baru.
 */
export async function createQrisTransaction(input: CreateQrisInput): Promise<CreateQrisResult> {
    const cfg = await getKlikQrisConfig();
    if (!cfg.apiKey || !cfg.merchantId) {
        throw new Error("KlikQRIS belum dikonfigurasi (API key / merchant id kosong)");
    }

    const url = `${cfg.baseUrl}/qris/create`;
    const payload = {
        order_id: input.orderId,
        id_merchant: cfg.merchantId,
        amount: Math.round(input.amount),
        keterangan: input.description || "Upgrade plan"
    };

    let json: any;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": cfg.apiKey,
                id_merchant: cfg.merchantId
            },
            body: JSON.stringify(payload),
            cache: "no-store"
        });
        const text = await res.text();
        try {
            json = JSON.parse(text);
        } catch {
            json = { _raw: text };
        }
        if (!res.ok || json?.status === false) {
            const msg = json?.message || `HTTP ${res.status}`;
            logger.error("KlikQRIS", `Create gagal: ${msg} | ${text.slice(0, 300)}`);
            throw new Error(`KlikQRIS: ${msg}`);
        }
    } catch (e: any) {
        logger.error("KlikQRIS", "Create transaction error:", e);
        throw new Error(e?.message || "Gagal menghubungi KlikQRIS");
    }

    const data = json?.data || {};

    return {
        reference: String(data.order_id || input.orderId),
        // Utamakan gambar base64 (qris_image), fallback ke url file (qris_url)
        qrImageUrl: data.qris_image || data.qris_url || null,
        totalAmount: toInt(data.total_amount),
        signature: data.signature ? String(data.signature) : null,
        expiresAt: parseKlikDate(data.expired_at),
        raw: json
    };
}

/**
 * Normalisasi status KlikQRIS -> status internal.
 * (status endpoint pakai "SUCCESS", webhook pakai "PAID")
 */
export function normalizeStatus(raw: string | undefined | null): NormalizedStatus {
    const s = String(raw || "").toUpperCase();
    if (["PAID", "SUCCESS", "SETTLED", "COMPLETED"].includes(s)) return "PAID";
    if (["EXPIRED", "EXPIRE", "TIMEOUT"].includes(s)) return "EXPIRED";
    if (["CANCELLED", "CANCELED", "VOID"].includes(s)) return "CANCELLED";
    if (["FAILED", "FAILURE", "DECLINED", "REJECTED"].includes(s)) return "FAILED";
    return "PENDING";
}

/**
 * Cek status transaksi (GET /qris/status/{order_id}).
 */
export async function checkQrisStatus(orderId: string): Promise<{ status: NormalizedStatus; raw: any }> {
    const cfg = await getKlikQrisConfig();
    if (!cfg.apiKey || !cfg.merchantId) {
        throw new Error("KlikQRIS belum dikonfigurasi");
    }

    const url = `${cfg.baseUrl}/qris/status/${encodeURIComponent(orderId)}`;
    let json: any;
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": cfg.apiKey,
                id_merchant: cfg.merchantId
            },
            cache: "no-store"
        });
        const text = await res.text();
        try {
            json = JSON.parse(text);
        } catch {
            json = { _raw: text };
        }
    } catch (e: any) {
        logger.error("KlikQRIS", "Status check error:", e);
        throw new Error(e?.message || "Gagal cek status KlikQRIS");
    }

    const statusRaw = json?.data?.status ?? json?.status;
    return { status: normalizeStatus(statusRaw), raw: json };
}

/**
 * Validasi webhook KlikQRIS.
 * Sesuai dok: bandingkan `signature` di payload callback dengan
 * `signature` yang diterima saat create (disimpan di Payment.signature).
 */
export function verifyCallbackSignature(payloadSignature: string | null | undefined, storedSignature: string | null | undefined): boolean {
    if (!storedSignature || !payloadSignature) return false;
    // bandingkan aman (constant-time sederhana)
    const a = String(payloadSignature);
    const b = String(storedSignature);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

/**
 * Ambil { orderId, status, signature } dari payload callback.
 */
export function parseCallback(body: any): {
    orderId: string | null;
    status: NormalizedStatus;
    signature: string | null;
} {
    return {
        orderId: body?.order_id ? String(body.order_id) : null,
        status: normalizeStatus(body?.status),
        signature: body?.signature ? String(body.signature) : null
    };
}
