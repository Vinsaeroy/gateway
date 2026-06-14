# Deployment Guide — WA-AKG

Satu aplikasi saja. Engine WhatsApp + dashboard + landing/pricing semuanya jadi
satu di repo ini. Tidak ada app marketing terpisah.

## Ringkas: pakai host yang mana?

| Platform | Biaya | Bisa jalan? | Catatan |
|---|---|---|---|
| **Koyeb** | 🆓 Gratis | ✅ Penuh | **Pilihan gratis terbaik.** 1 free instance 512MB always-on, deploy dari Dockerfile, tanpa VPS |
| **Render** | 💲 Starter | ✅ Penuh | Mantap & stabil. Free tier-nya auto-sleep → JANGAN dipakai untuk WA |
| **Vercel** | 🆓 | ⚠️ UI saja | Halaman muncul, tapi **engine WhatsApp TIDAK jalan** (lihat di bawah) |

> Kombinasi 100% gratis tanpa VPS: **Koyeb (app) + Neon (database)**.

---

## ⚠️ Kenapa engine TIDAK jalan di Vercel

Inti aplikasi butuh proses **always-on**:

- Custom HTTP server + **Socket.io** (`src/server/index.ts`, dijalankan via `bootstrap.ts`)
- Koneksi **WhatsApp (Baileys) persisten di memori** (`waManager`)
- **node-cron** (scheduler + auto-broadcast)
- State di memori (antrian anti-spam, lock JPM)

Vercel menjalankan Next.js sebagai **serverless function** — mati setelah tiap
request, tidak ada WebSocket server yang nyala terus, tidak ada cron always-on.
Kalau dipaksa: halaman kebuka, tapi **scan QR / kirim pesan / realtime / scheduler
MATI**. Ini batasan arsitektur Vercel, bukan bug yang bisa ditambal.

➡️ **Untuk dipakai beneran, deploy ke Koyeb (gratis) atau Render.**

---

## Opsi A — Koyeb (GRATIS, full app, REKOMENDASI tanpa VPS)

1. Daftar di [koyeb.com](https://www.koyeb.com), login pakai **GitHub**.
2. **Create Service → GitHub** → pilih repo `Vinsaeroy/WA-AKG`.
3. **Builder:** Dockerfile (otomatis terdeteksi dari `Dockerfile` di root).
4. **Instance:** pilih **Free** (512MB RAM, US/EU).
5. **Port:** isi `3030` (server membaca `process.env.PORT`).
6. **Health check path:** `/`.
7. **Environment variables:** isi (lihat tabel "Environment Variables" di bawah).
   `BASE_URL` = URL Koyeb-mu, mis. `https://wa-akg-xxxx.koyeb.app`.
8. **Deploy.** Build pertama agak lama (Docker build + `next build`).

### Batasan free tier Koyeb (penting, jujur)
- **RAM 512MB pas-pasan** untuk Next.js + Baileys + sharp. Cukup untuk 1 session
  beban ringan. Banyak session / broadcast besar bisa OOM. Lihat "Tips hemat memori".
- **Filesystem ephemeral** → media upload (`/app/data/media`) bisa hilang saat
  restart/redeploy. **Sesi WhatsApp AMAN** karena tersimpan di DB (tabel `AuthState`),
  jadi tidak perlu scan ulang.

## Opsi B — Render (Starter, full app, paling stabil)

1. Render → **New → Blueprint**, pilih repo (otomatis pakai `render.yaml`).
2. Isi env var rahasia (yang `sync: false`) di dashboard Render.
3. Disk `/app/data` sudah didefinisikan di `render.yaml` untuk media (persisten).

> Jangan pakai plan **Free** Render — auto-sleep setelah 15 menit nganggur, dan
> saat tidur sesi WhatsApp putus. Pakai minimal **Starter**.

## Opsi C — Vercel (hanya UI, tanpa engine WhatsApp)

Hanya kalau kamu sadar engine WA tidak akan jalan di sini.

1. Vercel → **New Project** → import repo. Framework: Next.js (auto). Deploy.
2. Set env `NEXT_PUBLIC_*` sesuai domain Vercel.

Landing/pricing/UI muncul, tapi scan QR & kirim pesan tidak berfungsi. Untuk fitur
WhatsApp arahkan ke deployment Koyeb/Render.

---

## Environment Variables

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (mis. dari Neon) |
| `AUTH_SECRET` | ✅ | String acak panjang — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `BASE_URL` | ✅ | URL publik, mis. `https://wa-akg-xxxx.koyeb.app` |
| `NEXTAUTH_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_API_URL` | ✅ | `BASE_URL` + `/api` |
| `PORT` | ⬜ | Default 3030 (host biasanya inject sendiri) |
| `TZ` | ⬜ | `Asia/Jakarta` |
| `NODE_OPTIONS` | ⬜ | Untuk 512MB: `--max-old-space-size=400` (lihat "Tips hemat memori") |
| `NEXT_PUBLIC_SWAGGER_USERNAME/PASSWORD` | ⬜ | Login halaman `/swagger` |
| `KLIKQRIS_*` | ⬜ | Fallback; lebih baik atur via dashboard (SUPERADMIN) |

> ⚠️ URL host (Koyeb/Render) baru muncul setelah deploy pertama. Alur: deploy
> sekali → lihat URL → isi `BASE_URL`/`NEXTAUTH_URL`/`NEXT_PUBLIC_*` dengan URL itu
> → redeploy. Salah isi = redirect login kacau.

---

## Tips hemat memori (untuk Koyeb free 512MB)

1. **Batasi heap Node** — set env `NODE_OPTIONS=--max-old-space-size=400`.
   Bikin GC jalan lebih awal sebelum container OOM-kill.
2. **Jaga jumlah session WhatsApp tetap sedikit** (idealnya 1) di free tier.
3. **Hindari broadcast/JPM ke ratusan grup sekaligus** — proses gambar (sharp/jimp)
   makan memori. Pecah jadi batch kecil.
4. Kalau sering OOM, naik ke instance berbayar (Koyeb/Render) atau Render Starter.

---

## Setelah Deploy (WAJIB)

1. **Siapkan database** (kalau DB masih kosong) — dari mesin yang punya akses `DATABASE_URL`:
   ```bash
   npm run db:push
   ```
   > Kalau pakai DB Neon yang sama dengan lokal, tabel sudah ada → lewati langkah ini.

2. **Buat admin / SUPERADMIN**:
   - User pertama yang registrasi di `/auth/register` otomatis jadi SUPERADMIN, **atau**
   - jalankan `npm run make-admin` (lihat `scripts/setup-admin.js`).

3. **Atur Payment Gateway** (login SUPERADMIN → Settings → Payment Gateway),
   lalu daftarkan webhook di KlikQRIS:
   `https://<domain-kamu>/api/billing/callback`

4. **Persistensi**:
   - Sesi WhatsApp tersimpan di **database** (tabel `AuthState`) → aman saat redeploy.
   - Media upload di `/app/data/media` → pakai **disk/volume** kalau host mendukung
     (Render Starter punya; Koyeb free ephemeral → media bisa hilang saat restart).

---

## Checklist sebelum go-live
- [ ] Deploy di **Koyeb** atau **Render** (bukan Vercel) untuk fitur WhatsApp
- [ ] `DATABASE_URL` valid & `npm run db:push` sukses (kalau DB baru)
- [ ] `AUTH_SECRET` di-set (jangan pakai default)
- [ ] `BASE_URL`/`NEXTAUTH_URL`/`NEXT_PUBLIC_*` = URL host yang benar
- [ ] (Koyeb 512MB) `NODE_OPTIONS=--max-old-space-size=400` di-set
- [ ] Plan host TIDAK auto-sleep (Render free dilarang untuk WA)
