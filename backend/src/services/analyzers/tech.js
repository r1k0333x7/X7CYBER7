// Technology + WAF detection from response headers and body fingerprints (passive).
const WAF_SIGNATURES = [
  { name: 'Cloudflare', test: (h) => h['server']?.includes('cloudflare') || h['cf-ray'] },
  { name: 'Akamai', test: (h) => h['server']?.toLowerCase().includes('akamai') || h['x-akamai-transformed'] },
  { name: 'Imperva', test: (h) => h['x-iinfo'] || h['x-cdn']?.includes('Incapsula') },
  { name: 'AWS WAF', test: (h) => h['x-amzn-requestid'] || h['x-amz-cf-id'] },
  { name: 'Fastly', test: (h) => h['x-served-by']?.includes('cache') && h['x-fastly-request-id'] },
  { name: 'F5 BIG-IP', test: (h) => h['set-cookie']?.includes('BIGipServer') },
  { name: 'ModSecurity', test: (h) => h['server']?.toLowerCase().includes('mod_security') }
];

const TECH_SIGNATURES = [
  { name: 'Nginx', test: (h) => h['server']?.toLowerCase().includes('nginx') },
  { name: 'Apache', test: (h) => h['server']?.toLowerCase().includes('apache') },
  { name: 'PHP', test: (h) => h['x-powered-by']?.toLowerCase().includes('php') },
  { name: 'Express', test: (h) => h['x-powered-by']?.toLowerCase().includes('express') },
  { name: 'Next.js', test: (h, b) => h['x-powered-by']?.includes('Next.js') || /\/_next\//.test(b) },
  { name: 'WordPress', test: (h, b) => /wp-content|wp-includes/.test(b) }
];

export async function detectTechnology(targetUrl) {
  const headers = {};
  let body = '';
  try {
    const res = await fetch(targetUrl, { redirect: 'follow' });
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    body = (await res.text()).slice(0, 50000);
  } catch (err) {
    return { technologies: [], waf: [], error: err.message };
  }

  const technologies = TECH_SIGNATURES.filter((s) => {
    try { return s.test(headers, body); } catch { return false; }
  }).map((s) => s.name);

  const waf = WAF_SIGNATURES.filter((s) => {
    try { return s.test(headers); } catch { return false; }
  }).map((s) => s.name);

  return { technologies, waf };
}
