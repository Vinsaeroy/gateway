/**
 * URL Security Helpers
 * Centralized validators to prevent SSRF, protocol smuggling, etc.
 */

/**
 * Check if hostname/IP is private/internal (RFC1918, loopback, link-local).
 * Use to block SSRF attempts when user-supplied URLs are fetched server-side.
 */
export function isPrivateHostname(hostname: string): boolean {
    if (!hostname) return true;
    const lower = hostname.toLowerCase();

    // Loopback / wildcard
    if (
        lower === "localhost" ||
        lower === "0.0.0.0" ||
        lower === "127.0.0.1" ||
        lower === "::1" ||
        lower === "[::1]"
    ) return true;

    // RFC1918 IPv4 private ranges
    if (lower.startsWith("10.")) return true;
    if (lower.startsWith("192.168.")) return true;

    // 172.16.0.0 - 172.31.255.255
    if (lower.startsWith("172.")) {
        const parts = lower.split(".");
        const second = parseInt(parts[1] || "0", 10);
        if (second >= 16 && second <= 31) return true;
    }

    // Link-local
    if (lower.startsWith("169.254.")) return true;

    // Cloud metadata
    if (lower === "169.254.169.254") return true;

    // IPv6 private/link-local prefixes
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
    if (lower.startsWith("fe80:")) return true; // link-local

    return false;
}

export interface UrlValidationResult {
    valid: boolean;
    reason?: string;
}

/**
 * Validate a user-supplied URL for SSRF risk.
 * Allows only http/https + non-private hostnames.
 */
export function validateExternalUrl(input: unknown): UrlValidationResult {
    if (typeof input !== "string" || !input.trim()) {
        return { valid: false, reason: "URL must be a non-empty string" };
    }
    let parsed: URL;
    try {
        parsed = new URL(input);
    } catch {
        return { valid: false, reason: "Invalid URL format" };
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
        return { valid: false, reason: "Only http/https URLs are allowed" };
    }
    if (isPrivateHostname(parsed.hostname)) {
        return { valid: false, reason: "Internal/private URLs are not allowed" };
    }
    return { valid: true };
}
