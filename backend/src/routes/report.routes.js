import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { toCsv, toJson, toHtml } from '../services/report.js';
import { createZip } from '../services/zip.js';
import { rankFindings } from '../services/risk.js';

const router = Router();

async function loadScan(scanId) {
  const scan = await query('SELECT * FROM scans WHERE id = $1', [scanId]);
  if (scan.rowCount === 0) return null;
  const findings = await query('SELECT * FROM vulnerabilities WHERE scan_id = $1', [scanId]);
  return { scan: scan.rows[0], findings: rankFindings(findings.rows) };
}

router.get('/:scanId/csv', authenticate, async (req, res, next) => {
  try {
    const data = await loadScan(req.params.scanId);
    if (!data) return res.status(404).json({ error: 'Scan not found' });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="x7-report-${req.params.scanId}.csv"`);
    res.send(toCsv(data.scan, data.findings));
  } catch (err) { next(err); }
});

router.get('/:scanId/json', authenticate, async (req, res, next) => {
  try {
    const data = await loadScan(req.params.scanId);
    if (!data) return res.status(404).json({ error: 'Scan not found' });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="x7-report-${req.params.scanId}.json"`);
    res.send(toJson(data.scan, data.findings));
  } catch (err) { next(err); }
});

// Printable HTML (Save as PDF from the browser).
router.get('/:scanId/pdf', authenticate, async (req, res, next) => {
  try {
    const data = await loadScan(req.params.scanId);
    if (!data) return res.status(404).json({ error: 'Scan not found' });
    res.setHeader('Content-Type', 'text/html');
    res.send(toHtml(data.scan, data.findings));
  } catch (err) { next(err); }
});

// ZIP bundle: CSV + JSON + HTML in a single archive.
router.get('/:scanId/zip', authenticate, async (req, res, next) => {
  try {
    const data = await loadScan(req.params.scanId);
    if (!data) return res.status(404).json({ error: 'Scan not found' });
    const zip = createZip([
      { name: 'report.csv', content: toCsv(data.scan, data.findings) },
      { name: 'report.json', content: toJson(data.scan, data.findings) },
      { name: 'report.html', content: toHtml(data.scan, data.findings) }
    ]);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="x7-report-${req.params.scanId}.zip"`);
    res.send(zip);
  } catch (err) { next(err); }
});

export default router;
