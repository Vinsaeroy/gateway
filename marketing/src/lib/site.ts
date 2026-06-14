// URL dashboard utama (engine WA-AKG yang always-on).
// Semua CTA marketing mengarah ke sini. Trailing slash dibuang biar
// tidak menghasilkan URL dobel-slash (mis. "http://host//auth/login").
//
// Prioritas: NEXT_PUBLIC_DASHBOARD_URL (kalau di-set) > fallback.
// Fallback otomatis: di `next dev` -> localhost, di production -> domain.
const FALLBACK_DASHBOARD_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://rifalos.shop";

export const DASHBOARD_URL = (
  process.env.NEXT_PUBLIC_DASHBOARD_URL || FALLBACK_DASHBOARD_URL
).replace(/\/+$/, "");

export const links = {
  dashboard: `${DASHBOARD_URL}/dashboard`,
  login: `${DASHBOARD_URL}/auth/login`,
  register: `${DASHBOARD_URL}/auth/register`,
  billing: `${DASHBOARD_URL}/dashboard/billing`,
  docs: `${DASHBOARD_URL}/docs`,
  github: "https://github.com/vinsaeroy/WA-AKG"
};

export const SITE_NAME = "RifalosID";
