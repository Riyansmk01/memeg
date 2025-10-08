# eSawitKu SaaS

## Pengembangan (Dev)

1. Persiapan
- Node.js 20+, Bun 1.2.23
- PostgreSQL 15+

2. Setup
```bash
bun install
bunx prisma generate
bun run dev
```

3. Type-check, Lint, Test
```bash
bun run type-check
bun run lint
bun run test:unit
bun run test:integration
```

4. Variabel Lingkungan
- Lihat `env.example`, salin menjadi `.env.local` dan isi nilai yang sesuai.

## Observabilitas
- Health: `GET /api/health`
- Metrics Prometheus: `GET /api/metrics`

## Keamanan
- Security headers di `middleware.ts` (CSP adaptif, HSTS prod, COOP/CORP/COEP, Permissions-Policy)
- Validasi environment di `lib/env.ts`

## GraphQL
- Endpoint GraphQL di `app/api/graphql/route.ts`
- Pastikan database siap dan Prisma Client tergenerate

## Deploy (Docker Compose)
```bash
docker compose up --build
```
- Healthcheck otomatis memanggil `/api/health`

## Catatan
- Untuk produksi, set `NEXTAUTH_SECRET`, `JWT_SECRET`, dan `DATABASE_URL` dengan aman.