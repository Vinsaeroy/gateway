# WA-AKG — Marketing Site (Vercel)

Sub-app **landing / pricing** yang ringan dan **aman untuk Vercel**.
Tidak ada engine WhatsApp, Prisma, auth, atau Socket.io di sini — semua tombol
(Sign In, Dashboard, Upgrade) mengarah ke dashboard utama yang berjalan di host
always-on (mis. `https://rifalos.shop`).

## Struktur
- `/` landing (hero, features, pricing)
- `/pricing` halaman harga
- `/privacy`, `/terms`

## Jalankan lokal
```bash
cd marketing
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_DASHBOARD_URL
npm run dev
```

## Deploy ke Vercel
1. Push repo ke GitHub.
2. Vercel → **New Project** → pilih repo.
3. **Root Directory**: set ke `marketing` (penting! ini sub-folder).
4. Framework: **Next.js** (otomatis terdeteksi).
5. Environment Variable:
   - `NEXT_PUBLIC_DASHBOARD_URL` = `https://rifalos.shop` (URL dashboard utamamu)
6. Deploy.

> Karena ini murni frontend statis + komponen client, Vercel cocok 100%.
> Pasang domain (mis. `www.rifalos.shop`) di Vercel, dan biarkan
> `app.rifalos.shop` / `rifalos.shop` menunjuk ke server dashboard utama.

## Sinkronisasi harga
Data plan ada di `src/lib/plans.ts` (salinan tampilan). Kalau ubah harga/limit di
app utama (`src/lib/plans.ts`), samakan juga di sini.
