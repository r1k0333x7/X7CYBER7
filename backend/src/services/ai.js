// AI Security Assistant.
// Uses an external LLM if AI_API_KEY is configured (OpenAI-compatible endpoint);
// otherwise falls back to a deterministic rule-based explanation engine so the
// feature works with zero external dependencies. Defensive use only.

const RULES = {
  'security-header': 'Menambahkan header keamanan yang hilang menurunkan risiko XSS, clickjacking, dan kebocoran informasi. Konfigurasikan di reverse proxy atau aplikasi.',
  'ssl-tls': 'Masalah TLS/sertifikat dapat memungkinkan downgrade atau hilangnya kepercayaan. Perbarui sertifikat dan nonaktifkan protokol lama (TLS 1.0/1.1).',
  'email': 'Tanpa SPF/DKIM/DMARC, domain rentan terhadap spoofing email. Terapkan ketiganya dan tingkatkan kebijakan DMARC secara bertahap.',
  'domain': 'Pantau tanggal kedaluwarsa domain untuk mencegah pengambilalihan atau gangguan layanan.',
  'information-disclosure': 'Sembunyikan versi software pada header untuk mengurangi permukaan serangan dan fingerprinting.'
};

function ruleBasedSummary(findings = []) {
  const bySeverity = { critical: [], high: [], medium: [], low: [], informational: [] };
  for (const f of findings) (bySeverity[f.severity] || bySeverity.informational).push(f);

  const lines = [];
  const total = findings.length;
  lines.push(`Ditemukan ${total} temuan. Prioritaskan ${bySeverity.critical.length} critical dan ${bySeverity.high.length} high terlebih dahulu.`);
  const categories = [...new Set(findings.map((f) => f.category))];
  for (const cat of categories) {
    if (RULES[cat]) lines.push(`- ${cat}: ${RULES[cat]}`);
  }
  return lines.join('\n');
}

export async function explainFindings(findings = []) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return { source: 'rule-based', summary: ruleBasedSummary(findings) };
  }
  try {
    const res = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a defensive security assistant. Summarize findings and give prioritized, actionable mitigation steps. Never provide exploitation instructions.' },
          { role: 'user', content: JSON.stringify(findings.slice(0, 50)) }
        ],
        temperature: 0.2
      })
    });
    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || ruleBasedSummary(findings);
    return { source: 'llm', summary };
  } catch {
    return { source: 'rule-based', summary: ruleBasedSummary(findings) };
  }
}
