# syntax=docker/dockerfile:1
# ============================================================
# WA-AKG — Production Dockerfile
# ------------------------------------------------------------
# App ini pakai custom server (Next.js + Socket.io + Baileys)
# yang dijalankan via tsx, jadi butuh host always-on (BUKAN Vercel).
# Cocok untuk Railway / Render / Fly.io / VPS.
# ============================================================

FROM node:20-alpine AS base
# libc6-compat + openssl: untuk native module (sharp) & Prisma engine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- deps: install semua dependency ----------
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY patches ./patches
# butuh devDependencies juga (next build + next-swagger-doc dipakai runtime)
RUN npm ci || npm install
RUN npx prisma generate

# ---------- builder: next build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL dummy supaya build tidak gagal saat evaluasi env (build tidak konek DB)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate && npm run build

# ---------- runner: jalankan custom server ----------
FROM base AS runner
ENV NODE_ENV=production
# Jalankan sebagai non-root
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
# Copy seluruh app yang sudah ter-build (server dijalankan via tsx -> butuh source TS)
COPY --from=builder --chown=nextjs:nodejs /app ./
# Folder media (uploads) — sebaiknya di-mount sebagai volume agar persisten
RUN mkdir -p /app/data/media && chown -R nextjs:nodejs /app/data
USER nextjs
EXPOSE 3030
# host menyuntik PORT; server membaca process.env.PORT (default 3030)
CMD ["npm", "run", "start"]
