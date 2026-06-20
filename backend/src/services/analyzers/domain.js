// Domain intelligence using free public APIs: RDAP and crt.sh (certificate transparency).
export async function rdapLookup(domain) {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { accept: 'application/rdap+json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const events = {};
    (data.events || []).forEach((e) => { events[e.eventAction] = e.eventDate; });
    return {
      handle: data.handle,
      status: data.status || [],
      registration: events.registration,
      expiration: events.expiration,
      lastChanged: events['last changed'],
      nameservers: (data.nameservers || []).map((n) => n.ldhName)
    };
  } catch {
    return null;
  }
}

export async function crtShCertificates(domain) {
  try {
    const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`);
    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set();
    const subdomains = [];
    for (const row of data) {
      (row.name_value || '').split(/\n/).forEach((name) => {
        const n = name.trim().toLowerCase();
        if (n && !n.startsWith('*') && !seen.has(n)) {
          seen.add(n);
          subdomains.push(n);
        }
      });
    }
    return subdomains.slice(0, 200);
  } catch {
    return [];
  }
}

export async function analyzeDomain(domain) {
  const findings = [];
  const [rdap, subdomains] = await Promise.all([rdapLookup(domain), crtShCertificates(domain)]);

  if (rdap?.expiration) {
    const daysLeft = Math.round((new Date(rdap.expiration) - Date.now()) / 86400000);
    if (daysLeft < 30 && daysLeft >= 0) {
      findings.push({ category: 'domain', title: 'Domain expiring soon', description: `${daysLeft} days until expiration`, severity: 'medium', mitigation: 'Renew the domain registration.' });
    }
  }
  return { findings, rdap, subdomains };
}
