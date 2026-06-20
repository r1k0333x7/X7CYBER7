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

## Status

Scaffold awal. Lihat `ROADMAP.md` untuk modul yang akan dibangun bertahap.
