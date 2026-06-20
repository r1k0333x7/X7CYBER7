// DNS lookups via DNS-over-HTTPS (Cloudflare), no extra deps.
const DOH = 'https://cloudflare-dns.com/dns-query';

export async function resolveRecord(name, type = 'A') {
  const url = `${DOH}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, { headers: { accept: 'application/dns-json' } });
  if (!res.ok) throw new Error(`DoH query failed (${res.status})`);
  const data = await res.json();
  return (data.Answer || []).map((a) => ({ name: a.name, type: a.type, ttl: a.TTL, data: a.data }));
}

export async function lookupAll(name) {
  const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
  const out = {};
  await Promise.all(
    types.map(async (t) => {
      try {
        out[t] = await resolveRecord(name, t);
      } catch {
        out[t] = [];
      }
    })
  );
  return out;
}
