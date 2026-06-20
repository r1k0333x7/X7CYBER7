// Report generator: CSV and JSON exports for a completed scan.
const CSV_FIELDS = [
  'scan_id', 'timestamp', 'target_url', 'security_score', 'severity', 'category',
  'title', 'description', 'status', 'recommendation', 'cve_id', 'cvss_score',
  'epss_score', 'cisa_kev', 'affected_product', 'detected_version',
  'recommended_version', 'reference'
];

function esc(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function toCsv(scan, findings) {
  const header = CSV_FIELDS.join(',');
  const rows = findings.map((f) =>
    [
      scan.id, scan.finished_at || scan.created_at, scan.target_url, scan.security_score,
      f.severity, f.category, f.title, f.description, f.status, f.mitigation || f.patch_recommendation,
      f.cve_id, f.cvss_score, f.epss_score, f.cisa_kev, f.affected_product, f.detected_version,
      f.recommended_version, Array.isArray(f.references) ? f.references.join('; ') : ''
    ].map(esc).join(',')
  );
  return [header, ...rows].join('\n');
}

// Printable HTML report (open in browser -> Print to PDF). Self-contained.
export function toHtml(scan, findings) {
  const rows = findings
    .map(
      (f) => `<tr><td>${f.severity}</td><td>${escapeHtml(f.category)}</td><td>${escapeHtml(f.title)}</td><td>${escapeHtml(f.description || '')}</td><td>${escapeHtml(f.mitigation || '')}</td></tr>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>X7 Report ${escapeHtml(scan.target_url)}</title>
<style>body{font-family:system-ui,Arial,sans-serif;color:#0f172a;margin:32px}h1{color:#0369a1}
.summary{display:flex;gap:24px;margin:16px 0}.card{border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px}
table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #e2e8f0;padding:6px;text-align:left}
th{background:#f1f5f9}.disclaimer{margin-top:24px;font-size:11px;color:#64748b}</style></head>
<body><h1>X7 Cyber Security Platform — Report</h1>
<div class="summary">
<div class="card"><strong>Target</strong><br>${escapeHtml(scan.target_url)}</div>
<div class="card"><strong>Security Score</strong><br>${scan.security_score ?? '--'}/100</div>
<div class="card"><strong>Findings</strong><br>${findings.length}</div>
<div class="card"><strong>Generated</strong><br>${new Date().toISOString().slice(0, 16).replace('T', ' ')}</div>
</div>
<table><thead><tr><th>Severity</th><th>Category</th><th>Title</th><th>Description</th><th>Mitigation</th></tr></thead><tbody>${rows}</tbody></table>
<p class="disclaimer">Defensive audit report. For authorized assets only. Use browser "Print → Save as PDF".</p>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function toJson(scan, findings) {
  return JSON.stringify(
    {
      executiveSummary: {
        target: scan.target_url,
        securityScore: scan.security_score,
        generatedAt: new Date().toISOString(),
        totalFindings: findings.length
      },
      scan,
      findings
    },
    null,
    2
  );
}
