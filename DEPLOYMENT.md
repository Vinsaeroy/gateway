# Deployment Guide — WA-AKG

Satu aplikasi saja. Engine WhatsApp + dashboard + landing/pricing semuanya jadi
satu di repo ini. Tidak ada app marketing terpisah.

## Realita hosting (jujur, per 2026)

App ini butuh proses **always-on** (WhatsApp/Baileys WebSocket 24 jam + socket.io
+ node-cron). Platform serverless (Vercel/Netlify/Cloudflare) **tidak bisa**.
Dan PaaS "gratis + always-on + tanpa kartu" sudah hampir punah:

| Platform | Biaya | 24/7? | Catatan |
|---|---|---|---|
| **Oracle Cloud Always Free** | 🆓 Gratis selamanya | ✅ | VM ARM (≤24GB RAM). **Ini VPS** (perlu setup), daftar butuh kartu verifikasi |
| **Perangkat sendiri** (PC/RasPi/Termux) | 🆓 | ✅ | Tanpa cloud, tanpa kartu. Cocok pemakaian pribadi |
| **Render Starter** | 💲 ~$7/bln | ✅ | Paling anti-ribet, stabil |
| **VPS murah** (Contabo/Hetzner/dll) | 💲 ~$3–5/bln | ✅ | Kontrol penuh |
| **Render Free** | 🆓 | ❌ | Auto-sleep 15 menit → WA putus. Cuma buat tes |
| **Koyeb / Fly.io / Railway** | trial→💲 | — | Tidak gratis lagi (butuh kartu / habis trial) |
| **Vercel / Netlify** | 🆓 | ❌ | Serverless → engine WA mati. UI saja |

> Kesimpulan: **gratis + tanpa VPS + WA 24 jam = tidak ada lagi.** Pilihan gratis
> sungguhan = Oracle Always Free (VPS) atau hosting di perangkat sendiri.

---

## ⚠️ Kenapa engine TIDAK jalan di Vercel/Netlify/Cloudflare

- Custom HTTP server + **Socket.io** (`src/server/index.ts` via `bootstrap.ts`)
- Koneksi **WhatsApp (Baileys) persisten di memori** (`waManager`)
- **node-cron** (scheduler + auto-broadcast), plus state di memori (anti-spam, lock JPM)

Serverless mematikan fungsi setelah tiap request → koneksi WA putus terus. Bukan bug.

---

## Opsi A — Oracle Cloud Always Free (gratis selamanya, butuh setup VPS)

1. Daftar di [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) (butuh kartu
   untuk verifikasi; Always Free tidak ditagih).
2. Buat **VM Instance** → pilih shape **Ampere A1 (ARM)**, OS Ubuntu. Always Free
   memberi hingga 4 vCPU / 24GB RAM gratis.
3. Buka port firewall (Security List + `iptables`/`ufw`) untuk port HTTP-mu.
4. SSH ke VM, install Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
5. Clone repo + build & run (lihat "Opsi D — Docker" di bawah).
6. Pasang Nginx/Caddy untuk HTTPS + domain (opsional).

> ARM kadang kehabisan stok; coba region lain atau ulangi beberapa saat kemudian.

## Opsi B — Perangkat sendiri (100% gratis)

PC/laptop nganggur, Raspberry Pi, atau Android (Termux). Asal koneksi internet stabil
dan perangkat nyala terus. Jalankan via Docker atau Node langsung (lihat Opsi D / E).

## Opsi C — Render Starter (berbayar, paling gampang)

1. Render → **New → Blueprint**, pilih repo (otomatis pakai `render.yaml`).
2. Isi env var rahasia (`sync: false`) di dashboard.
3. Disk `/app/data` sudah didefinisikan untuk media (persisten).
4. Pakai plan **Starter** — JANGAN Free (auto-sleep → WA putus).

## Opsi D — Docker (untuk Oracle / VPS / perangkat sendiri)

```bash
git clone https://github.com/Vinsaeroy/WA-AKG.git
cd WA-AKG
# siapkan .env dari .env.example
docker build -t wa-akg .
docker run -d --name wa-akg \
  --env-file .env \
  -p 3030:3030 \
  -v $PWD/data:/app/data \
  --restart unless-stopped \
  wa-akg
```

## Opsi E — Node langsung (tanpa Docker)

```bash
npm ci
npm run db:push          # sekali, kalau DB masih kosong
npm run build
npm run start            # custom server di PORT (default 3030)
```

---

## Environment Variables

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (mis. dari Neon — gratis) |
| `AUTH_SECRET` | ✅ | String acak — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `BASE_URL` | ✅ | URL publik, mis. `https://wa.domainmu.com` atau `http://IP:3030` |
| `NEXTAUTH_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Sama dengan BASE_URL |
| `NEXT_PUBLIC_API_URL` | ✅ | `BASE_URL` + `/api` |
| `PORT` | ⬜ | Default 3030 |
| `TZ` | ⬜ | `Asia/Jakarta` |
| `NODE_OPTIONS` | ⬜ | RAM kecil: `--max-old-space-size=400` |
| `NEXT_PUBLIC_SWAGGER_USERNAME/PASSWORD` | ⬜ | Login halaman `/swagger` |
| `KLIKQRIS_*` | ⬜ | Fallback; lebih baik atur via dashboard (SUPERADMIN) |

> ⚠️ Isi `BASE_URL`/`NEXTAUTH_URL`/`NEXT_PUBLIC_*` dengan URL/IP host yang benar.
> Salah isi = redirect login kacau (seperti masalah lokal kemarin).

---

## Setelah Deploy (WAJIB)

1. **Siapkan database** (kalau DB masih kosong): `npm run db:push`.
   Kalau pakai DB Neon yang sama dengan lokal, tabel sudah ada → lewati.
2. **Buat admin:** user pertama yang registrasi di `/auth/register` otomatis SUPERADMIN,
   atau jalankan `npm run make-admin`.
3. **Payment gateway:** login SUPERADMIN → Settings → Payment Gateway. Webhook KlikQRIS:
   `https://<domain-kamu>/api/billing/callback`.
4. **Persistensi:** sesi WhatsApp di DB (`AuthState`) aman saat redeploy; media di
   `/app/data/media` → mount volume biar tidak hilang.

---

## Checklist
- [ ] Host always-on (Oracle/VPS/perangkat sendiri/Render Starter) — bukan Vercel/Render Free
- [ ] `DATABASE_URL` valid & `npm run db:push` sukses (kalau DB baru)
- [ ] `AUTH_SECRET` di-set
- [ ] `BASE_URL`/`NEXTAUTH_URL`/`NEXT_PUBLIC_*` = URL/IP host yang benar
- [ ] Volume `/app/data` ter-mount
