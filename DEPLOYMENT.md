# Deployment Guide — WA-AKG

## ⚠️ Soal Vercel (penting)

**App ini TIDAK bisa berjalan penuh di Vercel.** Inti aplikasinya butuh proses
**always-on**:

- Custom HTTP server + **Socket.io** (`src/server/index.ts`)
- Koneksi **WhatsApp (Baileys) persisten di memori** (`waManager`)
- **node-cron** (scheduler + auto-broadcast)
- State di memori (antrian anti-spam, lock JPM)

Vercel menjalankan Next.js sebagai **serverless function** (ephemeral, mati setelah
tiap request, tidak ada WebSocket server, tidak ada cron always-on). Kalau dipaksa,
dashboard kebuka tapi **scan QR / kirim pesan / realtime / cron mati**.

➡️ **Gunakan host always-on**: Railway, Render, Fly.io, atau VPS (Docker).

> Kalau cuma mau **landing/marketing page** (landing, pricing, docs) di Vercel
> sementara engine tetap di server utama — itu mungkin, tapi butuh app terpisah.
> Bilang saja kalau mau jalur ini.

---

## Opsi A — Railway (paling cepat)

1. Push repo ke GitHub.
2. Railway → **New Project → Deploy from GitHub repo**.
3. Railway otomatis pakai `Dockerfile` (lihat `railway.json`).
4. Tambahkan **PostgreSQL** (Railway → New → Database → PostgreSQL).
5. Set **Variables** (lihat daftar env di bawah). `DATABASE_URL` ambil dari plugin Postgres.
6. (Opsional) Tambah **Volume** dengan mount path `/app/data` agar media upload persisten.
7. Deploy. Setelah live, jalankan migrasi (lihat bagian "Setelah Deploy").

## Opsi B — Render

1. Push repo ke GitHub.
2. Render → **New → Blueprint**, pilih repo (memakai `render.yaml`).
3. Buat **PostgreSQL** di Render, salin Internal Database URL ke `DATABASE_URL`.
4. Isi env var rahasia (yang `sync: false`) di dashboard.
5. Disk `/app/data` sudah didefinisikan di `render.yaml` untuk media.

> Jangan pakai plan **Free** yang auto-sleep — sesi WhatsApp akan putus saat tidur.

## Opsi C — VPS (Docker)

```bash
# build
docker build -t wa-akg .

# run (siapkan .env dari .env.example)
docker run -d --name wa-akg \
  --env-file .env \
  -p 3030:3030 \
  -v /srv/wa-akg-data:/app/data \
  --restart unless-stopped \
  wa-akg
```

Taruh Nginx/Caddy di depan untuk HTTPS + reverse proxy ke port 3030
(pastikan WebSocket di-pass: header `Upgrade`/`Connection`).

---

## Environment Variables

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | String acak panjang (mis. `openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `BASE_URL` | ✅ | URL publik, mis. `https://app.domain.com` |
| `NEXTAUTH_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_API_URL` | ✅ | `BASE_URL` + `/api` |
| `PORT` | ⬜ | Default 3030 (host biasanya inject sendiri) |
| `TZ` | ⬜ | `Asia/Jakarta` |
| `NEXT_PUBLIC_SWAGGER_USERNAME/PASSWORD` | ⬜ | Login halaman `/swagger` |
| `KLIKQRIS_*` | ⬜ | Fallback; lebih baik atur via dashboard (SUPERADMIN) |

---

## Setelah Deploy (WAJIB)

1. **Migrasi database** (sekali, dari mesin yang punya akses `DATABASE_URL`):
   ```bash
   npx prisma migrate deploy
   ```
   atau cepat (tanpa file migrasi):
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
   - Media upload di `/app/data/media` → pakai **volume** agar tidak hilang.

---

## Checklist sebelum go-live
- [ ] `DATABASE_URL` valid & `prisma migrate deploy` sukses
- [ ] `AUTH_SECRET` di-set (jangan pakai default)
- [ ] Domain + HTTPS + WebSocket pass-through
- [ ] Volume `/app/data` ter-mount
- [ ] Plan host TIDAK auto-sleep
