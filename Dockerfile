FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY patches ./patches/
COPY prisma ./prisma/
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/patches ./patches
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.server.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/middleware.ts ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data

ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME=0.0.0.0
EXPOSE 3030

CMD ["npx", "tsx", "src/server/index.ts"]
