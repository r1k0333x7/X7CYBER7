# Roadmap X7 Cyber Security Platform

Modul dibangun bertahap. Semua bersifat **defensif**.

## Fase 1 - Fondasi
- [x] Scaffold monorepo (frontend + backend)
- [x] Layout dashboard, sidebar terminal, tema light/dark
- [x] ~~Auth (JWT, 2FA, RBAC)~~ dihapus atas permintaan; platform berjalan terbuka
- [x] Skema database PostgreSQL (users, assets, scans, vulnerabilities, reports, notifications, audit_logs, settings)

## Fase 2 - Scanner & Intelligence
- [x] Website Scanner (Quick/Deep, queue, live progress)
- [x] Security Header Analyzer
- [x] SSL/TLS Security
- [x] DNS lookups (DoH)
- [x] Email Security (SPF/DMARC)
- [x] DNS & Domain Intelligence (RDAP, crt.sh)
- [x] Technology & WAF Detection
- [ ] Scheduler, DKIM

## Fase 3 - Vulnerability & Threat
- [ ] Vulnerability Intelligence (NVD, OSV, EPSS, CISA KEV)
- [ ] Version Matching
- [ ] Threat Intelligence Feed
- [ ] Risk Engine & scoring

## Fase 3 - Vulnerability & Threat
- [x] Vulnerability Intelligence (NVD, OSV, EPSS, CISA KEV)
- [x] Risk Engine & scoring

## Fase 4 - Visualisasi & AI
- [x] Report Generator (CSV/JSON)
- [x] Real-time WebSocket streaming
- [x] Attack Surface Visualization (Cytoscape)
- [x] Scheduler (scan terjadwal)
- [x] Notifications (in-app + webhook/Discord)
- [x] AI Security Assistant & rekomendasi (LLM opsional + fallback rule-based)
- [x] Asset Inventory
- [x] PDF (printable HTML) / ZIP export
- [x] DKIM validation

## Halaman
Dashboard, Scanner, Assets, Monitoring, Domain Intelligence, SSL Checker, DNS Tools, Vulnerability Center, Threat Feed, Reports, Notifications, Settings.
