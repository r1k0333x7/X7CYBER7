# Deployment Guide

X7-CYBER terdiri dari dua bagian yang dideploy terpisah:

- **frontend/** — Next.js → Vercel
- **backend/** — Express + WebSocket + PostgreSQL → Railway atau Render

> Backend TIDAK boleh dideploy ke Vercel karena memakai WebSocket persisten,
> queue worker, dan koneksi PostgreSQL jangka panjang yang tidak cocok dengan
> arsitektur serverless.

## 1. Deploy Backend (lakukan dulu)

### Opsi A — Railway
1. New Project → Deploy from GitLab repo → pilih `X7-CYBER`.
2. Set **Root Directory** ke `backend`.
3. Tambah plugin **PostgreSQL** (Railway mengisi `DATABASE_URL` otomatis).
4. Tambah variabel: `JWT_SECRET`, `PGSSL=true` (dan API key opsional: `NVD_API_KEY`, dst).
5. `railway.json` sudah menjalankan `npm run migrate && npm start`.
6. Catat URL publiknya, mis. `https://x7-backend.up.railway.app`.

### Opsi B — Render (Blueprint)
1. New → Blueprint → hubungkan repo.
2. Render membaca `backend/render.yaml`: membuat web service + database Postgres,
   menghasilkan `JWT_SECRET`, dan mengisi `DATABASE_URL`.
3. Health check otomatis ke `/api/health`.

## 2. Deploy Frontend (Vercel)

1. Import Project → pilih repo `X7-CYBER`.
2. **Framework Preset**: Next.js (otomatis terdeteksi).
3. **Root Directory**: `frontend`.
4. **Environment Variable**:
   - `NEXT_PUBLIC_API_BASE` = URL backend (mis. `https://x7-backend.up.railway.app`)
5. Deploy. `frontend/vercel.json` mengunci framework & build command.

## 3. Setelah deploy

- WebSocket: `frontend/lib/ws.js` mengonversi `http→ws` otomatis, jadi pastikan
  `NEXT_PUBLIC_API_BASE` memakai `https://` (akan jadi `wss://`).
- CORS: untuk produksi, batasi origin di `backend/src/server.js` (`cors({ origin: '<vercel-url>' })`).
- Register user pertama via `POST /api/auth/register`, lalu naikkan role-nya ke `admin` di DB.
