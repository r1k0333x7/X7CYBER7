import { query } from '../db/pool.js';
import { analyzeHeaders } from './analyzers/headers.js';
import { analyzeTls } from './analyzers/ssl.js';
import { lookupAll } from './analyzers/dns.js';
import { analyzeEmailSecurity } from './analyzers/email.js';
import { computeScore, summarize } from './scoring.js';

// In-memory queue with simple worker. Replace with Redis/BullMQ in production.
const queue = [];
let active = 0;
const MAX_CONCURRENT = 2;

function hostnameOf(target) {
  try {
    return new URL(target.includes('://') ? target : `https://${target}`).hostname;
  } catch {
    return target;
  }
}

async function setProgress(scanId, progress, status) {
  await query('UPDATE scans SET progress = $1, status = COALESCE($2, status) WHERE id = $3', [progress, status || null, scanId]);
}

async function runScan(scanId, targetUrl, mode) {
  const host = hostnameOf(targetUrl);
  const normalized = targetUrl.includes('://') ? targetUrl : `https://${targetUrl}`;
  let findings = [];
  try {
    await query('UPDATE scans SET status = $1, started_at = now() WHERE id = $2', ['running', scanId]);

    const headers = await analyzeHeaders(normalized);
    findings = findings.concat(headers.findings);
    await setProgress(scanId, 30);

    const ssl = await analyzeTls(host);
    findings = findings.concat(ssl.findings);
    await setProgress(scanId, 55);

    const dns = await lookupAll(host);
    await setProgress(scanId, 75);

    if (mode === 'deep') {
      const email = await analyzeEmailSecurity(host);
      findings = findings.concat(email.findings);
    }
    await setProgress(scanId, 90);

    for (const f of findings) {
      await query(
        `INSERT INTO vulnerabilities (scan_id, category, title, description, severity, mitigation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [scanId, f.category, f.title, f.description, f.severity, f.mitigation || null]
      );
    }

    const score = computeScore(findings);
    const summary = { ...summarize(findings), dns };
    await query(
      'UPDATE scans SET status = $1, progress = 100, security_score = $2, summary = $3, finished_at = now() WHERE id = $4',
      ['completed', score, summary, scanId]
    );
  } catch (err) {
    await query('UPDATE scans SET status = $1, finished_at = now() WHERE id = $2', ['failed', scanId]);
    console.error(`Scan ${scanId} failed:`, err.message);
  }
}

function processQueue() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift();
    active += 1;
    runScan(job.scanId, job.targetUrl, job.mode).finally(() => {
      active -= 1;
      processQueue();
    });
  }
}

export function enqueueScan(scanId, targetUrl, mode) {
  queue.push({ scanId, targetUrl, mode });
  processQueue();
  return { position: queue.length, active };
}
