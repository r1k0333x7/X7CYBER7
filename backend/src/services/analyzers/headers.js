// Security Header Analyzer (defensive: inspects response headers only).
const RECOMMENDED = {
  'strict-transport-security': 'HSTS missing: enforce HTTPS with a long max-age.',
  'content-security-policy': 'CSP missing: define a policy to mitigate XSS and injection.',
  'x-content-type-options': "Set to 'nosniff' to prevent MIME sniffing.",
  'x-frame-options': 'Set to DENY/SAMEORIGIN to mitigate clickjacking.',
  'referrer-policy': 'Define a referrer policy to limit information disclosure.',
  'permissions-policy': 'Restrict powerful browser features.'
};

export async function analyzeHeaders(targetUrl) {
  const findings = [];
  let headers = {};
  try {
    const res = await fetch(targetUrl, { method: 'GET', redirect: 'follow' });
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
  } catch (err) {
    return { findings: [{ category: 'headers', title: 'Connection failed', description: err.message, severity: 'informational' }], headers };
  }

  for (const [name, advice] of Object.entries(RECOMMENDED)) {
    if (!headers[name]) {
      findings.push({
        category: 'security-header',
        title: `Missing header: ${name}`,
        description: advice,
        severity: name === 'content-security-policy' ? 'medium' : 'low',
        mitigation: advice
      });
    }
  }

  if (headers['server']) {
    findings.push({
      category: 'information-disclosure',
      title: 'Server header exposes software',
      description: `Server header: ${headers['server']}`,
      severity: 'low',
      mitigation: 'Suppress or genericize the Server header.'
    });
  }
  return { findings, headers };
}
