import { resolveRecord } from './dns.js';

// Email security: SPF, DKIM (default selector), DMARC validation via TXT records.
export async function analyzeEmailSecurity(domain) {
  const findings = [];
  const result = { spf: null, dmarc: null };

  const txt = await resolveRecord(domain, 'TXT').catch(() => []);
  const spf = txt.find((r) => r.data.replace(/"/g, '').startsWith('v=spf1'));
  result.spf = spf ? spf.data.replace(/"/g, '') : null;
  if (!result.spf) {
    findings.push({ category: 'email', title: 'SPF record missing', description: 'No v=spf1 record found.', severity: 'medium', mitigation: 'Publish an SPF record to prevent spoofing.' });
  }

  // DKIM: probe common selectors (no enumeration of the mail server itself).
  const selectors = ['default', 'google', 'selector1', 'selector2', 'k1', 'dkim', 'mail', 's1'];
  const dkimFound = [];
  await Promise.all(
    selectors.map(async (sel) => {
      const rec = await resolveRecord(`${sel}._domainkey.${domain}`, 'TXT').catch(() => []);
      const hit = rec.find((r) => /v=DKIM1|p=/.test(r.data.replace(/"/g, '')));
      if (hit) dkimFound.push(sel);
    })
  );
  result.dkim = dkimFound;
  if (dkimFound.length === 0) {
    findings.push({ category: 'email', title: 'DKIM record not found', description: 'No DKIM TXT record found on common selectors.', severity: 'low', mitigation: 'Publish a DKIM public key and sign outbound mail.' });
  }

  const dmarcTxt = await resolveRecord(`_dmarc.${domain}`, 'TXT').catch(() => []);
  const dmarc = dmarcTxt.find((r) => r.data.replace(/"/g, '').startsWith('v=DMARC1'));
  result.dmarc = dmarc ? dmarc.data.replace(/"/g, '') : null;
  if (!result.dmarc) {
    findings.push({ category: 'email', title: 'DMARC record missing', description: 'No v=DMARC1 record found.', severity: 'medium', mitigation: 'Publish a DMARC policy (start with p=none, monitor, then enforce).' });
  } else if (/p=none/.test(result.dmarc)) {
    findings.push({ category: 'email', title: 'DMARC policy not enforced', description: 'Policy is p=none (monitor only).', severity: 'low', mitigation: 'Move toward p=quarantine or p=reject after monitoring.' });
  }

  return { findings, result };
}
