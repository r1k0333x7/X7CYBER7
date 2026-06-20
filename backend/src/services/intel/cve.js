// Vulnerability intelligence via free public APIs: NVD, OSV.dev, EPSS, CISA KEV.
let kevCache = { ts: 0, ids: new Set() };

export async function searchNvd(keyword, limit = 20) {
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=${limit}`;
  const headers = {};
  if (process.env.NVD_API_KEY) headers.apiKey = process.env.NVD_API_KEY;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`NVD query failed (${res.status})`);
  const data = await res.json();
  return (data.vulnerabilities || []).map((v) => {
    const cve = v.cve;
    const metric = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData;
    return {
      cveId: cve.id,
      description: cve.descriptions?.find((d) => d.lang === 'en')?.value,
      published: cve.published,
      cvssScore: metric?.baseScore ?? null,
      severity: metric?.baseSeverity?.toLowerCase() ?? 'unknown',
      references: (cve.references || []).map((r) => r.url).slice(0, 5)
    };
  });
}

export async function queryOsv(ecosystem, name, version) {
  const res = await fetch('https://api.osv.dev/v1/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ package: { ecosystem, name }, version })
  });
  if (!res.ok) throw new Error(`OSV query failed (${res.status})`);
  const data = await res.json();
  return (data.vulns || []).map((v) => ({ id: v.id, summary: v.summary, aliases: v.aliases }));
}

export async function getEpss(cveId) {
  const res = await fetch(`https://api.first.org/data/v1/epss?cve=${encodeURIComponent(cveId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const row = data.data?.[0];
  return row ? { epss: Number(row.epss), percentile: Number(row.percentile) } : null;
}

export async function getCisaKev() {
  if (Date.now() - kevCache.ts < 6 * 3600 * 1000 && kevCache.ids.size) return kevCache.ids;
  const res = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
  if (!res.ok) return kevCache.ids;
  const data = await res.json();
  kevCache = { ts: Date.now(), ids: new Set((data.vulnerabilities || []).map((v) => v.cveID)) };
  return kevCache.ids;
}

export async function enrichCve(cveId) {
  const [epss, kev] = await Promise.all([getEpss(cveId), getCisaKev()]);
  return { cveId, epss, cisaKev: kev.has(cveId) };
}
