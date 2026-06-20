# X7 Cyber Security Platform

Platform keamanan siber **defensif** untuk audit, pemantauan, analisis kerentanan, dan pengelolaan keamanan aset digital milik sendiri atau yang telah mendapat izin resmi.

## ⚠️ Disclaimer Wajib

> Platform ini hanya digunakan untuk audit keamanan terhadap aset yang dimiliki sendiri atau yang telah mendapatkan izin resmi. Semua fitur dirancang untuk tujuan defensif, visibilitas aset, pemantauan, dan peningkatan keamanan. Platform tidak menyediakan kemampuan eksploitasi atau penyerangan terhadap target.

## Arsitektur

```
X7-CYBER/
├── frontend/   # Next.js (JavaScript) + TailwindCSS + Framer Motion + Recharts + TanStack Query
└── backend/    # Node.js + Express + WebSocket + Redis + PostgreSQL
```

## Stack

| Layer     | Teknologi |
|-----------|-----------|
| Frontend  | Next.js, TailwindCSS, Framer Motion, Recharts, TanStack Query |
| Backend   | Node.js, Express, WebSocket, Redis, Queue, Scheduler |
| Database  | PostgreSQL |
| Auth      | JWT, OAuth, 2FA, RBAC |

## Tema Desain

Futuristik, dark mode, glassmorphism, neon blue accent, responsif desktop & mobile, dashboard real-time ala terminal profesional.

## API Gratis Terintegrasi (planned)

NVD, MITRE CVE, CISA KEV, OSV.dev, EPSS, VirusTotal (public), SecurityHeaders, Google Safe Browsing, AbuseIPDB, IPinfo, crt.sh, RDAP, DNS over HTTPS, Shodan InternetDB.

## Fitur yang Sudah Berfungsi

- **Akses terbuka**: tanpa login/register; semua route memakai satu system user (auth dihapus)
- **Scanner**: Quick/Deep scan, queue + worker, live progress (WebSocket + polling)
- **Analyzer defensif**: Security Headers, SSL/TLS, DNS (DoH), Email (SPF/DMARC), Technology & WAF detection
- **Domain Intelligence**: RDAP, certificate transparency (crt.sh), subdomain enumeration
- **Vulnerability Intelligence**: pencarian CVE (NVD), enrichment EPSS + CISA KEV, query OSV.dev
- **Risk Engine**: prioritas berbasis severity + CVSS + EPSS + KEV
- **Reports**: ekspor CSV & JSON
- **Dashboard**: security score, severity pie chart, risk trend graph
- **Real-time**: WebSocket untuk progress scan & threat feed

## Menjalankan

```bash
# Backend (butuh PostgreSQL + akses outbound)
cd backend && npm install && npm run migrate && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Salin `.env.example` ke `.env` di tiap folder dan sesuaikan.

## Modul Tambahan

- **Scheduler**: scan terjadwal otomatis (interval per aset)
- **Notifications**: in-app + webhook/Discord
- **Attack Surface**: visualisasi graf (Cytoscape) dari domain/subdomain/tech/WAF/DNS
- **AI Security Assistant**: penjelasan & prioritas mitigasi (LLM opsional, fallback rule-based)
- **Asset Inventory**: kelola domain/subdomain/server/IP dengan flag otorisasi
- **Monitoring**: ringkasan skor & aset terpantau
- **Deploy**: lihat `DEPLOY.md` (Vercel untuk frontend, Railway/Render untuk backend)

## Status

Seluruh fase inti (1-4) selesai dan fungsional end-to-end. Sisa opsional: PDF/ZIP export dan validasi DKIM. Lihat `ROADMAP.md`.
