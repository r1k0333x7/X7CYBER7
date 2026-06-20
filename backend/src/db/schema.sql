-- X7 Cyber Security Platform schema (defensive use only)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','analyst','viewer')),
  twofa_secret  TEXT,
  twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default system user (auth removed; platform runs open).
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'system@x7.local', '-', 'System', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ASSETS (domains/subdomains/servers owned or authorized)
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'domain' CHECK (type IN ('domain','subdomain','server','ip','technology','dependency')),
  value         TEXT NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  authorized    BOOLEAN NOT NULL DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id);

-- SCANS
CREATE TABLE IF NOT EXISTS scans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id       UUID REFERENCES assets(id) ON DELETE SET NULL,
  requested_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  target_url     TEXT NOT NULL,
  mode           TEXT NOT NULL DEFAULT 'quick' CHECK (mode IN ('quick','deep')),
  status         TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled')),
  progress       INT NOT NULL DEFAULT 0,
  security_score INT,
  summary        JSONB DEFAULT '{}'::jsonb,
  started_at     TIMESTAMPTZ,
  finished_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scans_asset ON scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);

-- VULNERABILITIES (findings)
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id          UUID REFERENCES scans(id) ON DELETE CASCADE,
  category         TEXT,
  title            TEXT NOT NULL,
  description      TEXT,
  impact           TEXT,
  severity         TEXT NOT NULL DEFAULT 'informational' CHECK (severity IN ('critical','high','medium','low','informational')),
  cve_id           TEXT,
  cvss_score       NUMERIC(3,1),
  epss_score       NUMERIC(5,4),
  cisa_kev         BOOLEAN NOT NULL DEFAULT FALSE,
  attack_complexity TEXT,
  affected_product TEXT,
  detected_version TEXT,
  recommended_version TEXT,
  mitigation       TEXT,
  patch_recommendation TEXT,
  priority         INT,
  references       JSONB DEFAULT '[]'::jsonb,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','accepted','false_positive')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vulns_scan ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id      UUID REFERENCES scans(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  format       TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf','csv','json','zip')),
  title        TEXT,
  file_path    TEXT,
  metadata     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email','telegram','discord','webhook')),
  title       TEXT NOT NULL,
  body        TEXT,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  resource    TEXT,
  ip_address  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- SETTINGS (per-user or global key/value)
CREATE TABLE IF NOT EXISTS settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       JSONB DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
