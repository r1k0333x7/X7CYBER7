// Builds an attack surface graph (nodes + edges) for visualization (D3/Cytoscape).
// Derived from scan summary data: domain -> subdomains/services/technologies/DNS.
export function buildAttackSurface(scan) {
  const nodes = [];
  const edges = [];
  const summary = scan.summary || {};
  const host = (() => {
    try { return new URL(scan.target_url.includes('://') ? scan.target_url : `https://${scan.target_url}`).hostname; }
    catch { return scan.target_url; }
  })();

  const rootId = `domain:${host}`;
  nodes.push({ id: rootId, label: host, type: 'domain' });

  (summary.domain?.subdomains || []).slice(0, 50).forEach((sub) => {
    const id = `subdomain:${sub}`;
    nodes.push({ id, label: sub, type: 'subdomain' });
    edges.push({ source: rootId, target: id });
  });

  (summary.tech?.technologies || []).forEach((t) => {
    const id = `tech:${t}`;
    nodes.push({ id, label: t, type: 'technology' });
    edges.push({ source: rootId, target: id });
  });

  (summary.tech?.waf || []).forEach((w) => {
    const id = `waf:${w}`;
    nodes.push({ id, label: w, type: 'waf' });
    edges.push({ source: rootId, target: id });
  });

  Object.entries(summary.dns || {}).forEach(([type, records]) => {
    (records || []).forEach((r) => {
      const id = `dns:${type}:${r.data}`;
      nodes.push({ id, label: `${type} ${r.data}`, type: 'dns' });
      edges.push({ source: rootId, target: id });
    });
  });

  return { nodes, edges };
}
