# Deployment Guide — WA-AKG

Satu aplikasi saja. Engine WhatsApp + dashboard + landing/pricing semuanya jadi
satu di repo ini. Tidak ada app marketing terpisah.

## Ringkas: pakai host yang mana?

| Platform | Bisa jalan? | Untuk apa |
|---|---|---|
| **Render** | ✅ Penuh | **Pilihan utama.** Engine WA + dashboard + API + cron jalan semua |
| **Vercel** | ⚠️ Terbatas | Hanya UI/landing yang muncul. **Engine WhatsApp TIDAK jalan** (lihat di bawah) |

---

## ⚠️ Kenapa engine TIDAK jalan di Vercel

Inti aplikasi butuh proses **always-on**:

- Custom HTTP server + **Socket.io** (`src/server/bootstrap.ts`)
- Koneksi **WhatsApp (Baileys) persisten di memori** (`waManager`)
- **node-cron** (scheduler + auto-broadcast)
- State di memori (antrian anti-spam, lock JPM)

Vercel menjalankan Next.js sebagai **serverless function** — mati setelah tiap
request, tidak ada WebSocket server yang nyala terus, tidak ada cron always-on.
Kalau WA-AKG dipaksa ke Vercel: halaman kebuka, tapi **scan QR / kirim pesan /
realtime / scheduler MATI**. Ini batasan arsitektur Vercel, bukan bug yang bisa
ditambal.

➡️ **Untuk dipakai beneran, deploy ke Render.** Vercel hanya cocok kalau kamu cuma
ingin memajang halaman publik (landing/pricing) tanpa fitur WhatsApp.

---

## Opsi A — Render (REKOMENDASI, full app)

1. Push repo ke GitHub (sudah).
2. Render → **New → Blueprint**, pilih repo (otomatis pakai `render.yaml`).
3. Buat **PostgreSQL** di Render, salin *Internal Database URL* ke `DATABASE_URL`.
4. Isi env var rahasia (yang `sync: false`) di dashboard Render — lihat tabel di bawah.
5. Disk `/app/data` sudah didefinisikan di `render.yaml` untuk media upload.
6. Deploy, lalu jalankan langkah "Setelah Deploy".

> Jangan pakai plan **Free** yang auto-sleep — sesi WhatsApp akan putus saat tidur.
> Pakai minimal **Starter** (sudah di-set di `render.yaml`).

## Opsi B — Vercel (hanya UI, tanpa engine WhatsApp)

Hanya kalau kamu sadar engine WA tidak akan jalan di sini.

1. Vercel → **New Project** → import repo.
2. Framework: Next.js (auto). Deploy.
3. Set env `NEXT_PUBLIC_*` sesuai domain Vercel-mu.

Halaman landing/pricing/dashboard UI akan muncul, tapi scan QR & kirim pesan tidak
berfungsi karena tidak ada proses always-on. Untuk fitur WhatsApp tetap arahkan ke
deployment Render.

---

## Environment Variables

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | String acak panjang (mis. `openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `BASE_URL` | ✅ | URL publik, mis. `https://wa-akg.onrender.com` |
| `NEXTAUTH_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_API_URL` | ✅ | `BASE_URL` + `/api` |
| `PORT` | ⬜ | Default 3030 (host biasanya inject sendiri) |
| `TZ` | ⬜ | `Asia/Jakarta` |
| `NEXT_PUBLIC_SWAGGER_USERNAME/PASSWORD` | ⬜ | Login halaman `/swagger` |
| `KLIKQRIS_*` | ⬜ | Fallback; lebih baik atur via dashboard (SUPERADMIN) |

---

## Setelah Deploy (WAJIB)

1. **Siapkan database** (sekali, dari mesin yang punya akses `DATABASE_URL`):
   ```bash
   npm run db:push
   ```

2. **Buat admin / SUPERADMIN**:
   - User pertama yang registrasi otomatis jadi SUPERADMIN, **atau**
   - jalankan `npm run make-admin` (lihat `scripts/setup-admin.js`).

3. **Atur Payment Gateway** (login SUPERADMIN → Settings → Payment Gateway),
   lalu daftarkan webhook di KlikQRIS:
   `https://<domain-kamu>/api/billing/callback`

4. **Persistensi**:
   - Sesi WhatsApp tersimpan di **database** (tabel `AuthState`) → aman saat redeploy.
   - Media upload di `/app/data/media` → pakai **disk/volume** agar tidak hilang.

---

## Checklist sebelum go-live
- [ ] Deploy di **Render** (bukan Vercel) untuk fitur WhatsApp
- [ ] `DATABASE_URL` valid & `npm run db:push` sukses
- [ ] `AUTH_SECRET` di-set (jangan pakai default)
- [ ] Domain + HTTPS aktif
- [ ] Disk `/app/data` ter-mount
- [ ] Plan host TIDAK auto-sleep
