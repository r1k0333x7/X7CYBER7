// Computes a 0-100 security score from findings by severity weight.
const WEIGHTS = { critical: 25, high: 12, medium: 6, low: 2, informational: 0 };

export function computeScore(findings = []) {
  let penalty = 0;
  for (const f of findings) {
    penalty += WEIGHTS[f.severity] ?? 0;
  }
  return Math.max(0, 100 - penalty);
}

export function summarize(findings = []) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  for (const f of findings) {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1;
  }
  return counts;
}
