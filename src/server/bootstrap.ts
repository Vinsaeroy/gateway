// ============================================================
// BOOTSTRAP — muat .env SEBELUM modul lain di-import
// ------------------------------------------------------------
// Prisma client dibuat saat import (src/lib/prisma.ts). Kalau .env
// belum dimuat saat itu, DATABASE_URL kosong → Prisma default ke
// localhost:5432 → SEMUA query gagal (register/login/scheduler).
//
// tsx TIDAK otomatis memuat .env, jadi kita muat manual di sini,
// lalu baru dynamic-import server utamanya. Tidak menimpa env yang
// sudah ada (di Docker/host, env di-inject lewat container).
// ============================================================
import fs from "fs";
import path from "path";

function loadEnvFile(file: string) {
    try {
        const p = path.resolve(process.cwd(), file);
        if (!fs.existsSync(p)) return;
        const content = fs.readFileSync(p, "utf8");
        for (const rawLine of content.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;
            const eq = line.indexOf("=");
            if (eq === -1) continue;
            const key = line.slice(0, eq).trim();
            if (!key || process.env[key] !== undefined) continue; // jangan timpa env yg sudah ada
            let val = line.slice(eq + 1).trim();
            if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
            ) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    } catch {
        /* ignore */
    }
}

// .env.local menimpa .env (urutan: yang lebih spesifik dimuat dulu
// karena loadEnvFile tidak menimpa key yang sudah terisi).
loadEnvFile(".env.local");
loadEnvFile(".env");

// Baru import server utama — sekarang Prisma dll. baca DATABASE_URL yang benar.
// TANPA top-level await (root bukan "type: module" → tsx transpile ke CJS).
import("./index.js").catch((e) => {
    console.error("Gagal start server:", e);
    process.exit(1);
});
