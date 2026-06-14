"use client";

// ============================================================
// AUTO UPDATE CHECK DIMATIKAN (manual update only)
// ------------------------------------------------------------
// Komponen ini dulu otomatis polling /api/system/check-updates
// yang mengambil rilis dari repo lain (vinsaeroy/WA-AKG).
// Supaya perubahan di repo lain tidak ikut masuk ke sini,
// pengecekan otomatis dimatikan. Update dilakukan manual.
// ============================================================

export function UpdateChecker() {
    // Sengaja tidak melakukan apa-apa: tidak ada polling ke upstream.
    return null;
}
