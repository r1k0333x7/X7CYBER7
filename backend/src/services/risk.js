// Risk engine: assigns priority from severity, CVSS, EPSS, and CISA KEV status.
const SEVERITY_RANK = { critical: 5, high: 4, medium: 3, low: 2, informational: 1 };

export function computePriority(finding) {
  let score = (SEVERITY_RANK[finding.severity] || 1) * 10;
  if (finding.cvss_score) score += Number(finding.cvss_score) * 2;
  if (finding.epss_score) score += Number(finding.epss_score) * 30;
  if (finding.cisa_kev) score += 40; // known exploited -> top priority
  return Math.round(score);
}

export function rankFindings(findings = []) {
  return findings
    .map((f) => ({ ...f, priority: computePriority(f) }))
    .sort((a, b) => b.priority - a.priority);
}
