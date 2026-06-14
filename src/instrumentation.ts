// Next.js instrumentation — menangkap SEMUA error sisi server (termasuk error
// render Server Component yang pesannya disembunyikan di production) dan
// mencatatnya lengkap ke log server (Render), beserta `digest` yang sama dengan
// `ref:` di halaman error. Ini bikin akar masalah bisa ditelusuri.
//
// Cara pakai: saat error muncul, lihat `ref: <digest>` di halaman, lalu cari
// baris "[onRequestError] digest=<digest>" di Render Logs → di situ pesan aslinya.

export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; routeType?: string }
) {
  const e = err as (Error & { digest?: string }) | undefined;
  // eslint-disable-next-line no-console
  console.error(
    `[onRequestError] digest=${e?.digest ?? "-"} ` +
      `${request?.method ?? ""} ${request?.path ?? ""} ` +
      `(${context?.routeType ?? "?"}:${context?.routePath ?? "?"})\n` +
      `  message: ${e?.message ?? String(err)}\n` +
      `  stack: ${e?.stack ?? "(no stack)"}`
  );
}
