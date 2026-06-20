import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { enqueueScan } from '../services/scanner.js';

const router = Router();

// Start a scan (analyst or admin). Defensive: requires acknowledging authorization.
router.post('/', authenticate, authorize('admin', 'analyst'), async (req, res, next) => {
  try {
    const { targetUrl, mode = 'quick', assetId, authorized } = req.body || {};
    if (!targetUrl) return res.status(400).json({ error: 'targetUrl is required' });
    if (!authorized) {
      return res.status(403).json({ error: 'You must confirm you are authorized to scan this target' });
    }
    const result = await query(
      `INSERT INTO scans (asset_id, requested_by, target_url, mode, status)
       VALUES ($1, $2, $3, $4, 'queued') RETURNING id, target_url, mode, status, created_at`,
      [assetId || null, req.user.id, targetUrl, mode === 'deep' ? 'deep' : 'quick']
    );
    const scan = result.rows[0];
    enqueueScan(scan.id, targetUrl, scan.mode);
    res.status(202).json({ scan });
  } catch (err) {
    next(err);
  }
});

// List scans
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT id, target_url, mode, status, progress, security_score, created_at, finished_at FROM scans ORDER BY created_at DESC LIMIT 50'
    );
    res.json({ scans: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get scan detail + findings (for live progress polling)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const scan = await query('SELECT * FROM scans WHERE id = $1', [req.params.id]);
    if (scan.rowCount === 0) return res.status(404).json({ error: 'Scan not found' });
    const findings = await query(
      'SELECT category, title, description, severity, mitigation FROM vulnerabilities WHERE scan_id = $1 ORDER BY created_at',
      [req.params.id]
    );
    res.json({ scan: scan.rows[0], findings: findings.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
