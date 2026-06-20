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
