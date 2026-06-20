import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { explainFindings } from '../services/ai.js';

const router = Router();

// Explain/prioritize findings for a scan (defensive recommendations only).
router.get('/explain/:scanId', authenticate, async (req, res, next) => {
  try {
    const findings = await query(
      'SELECT category, title, description, severity, mitigation FROM vulnerabilities WHERE scan_id = $1',
      [req.params.scanId]
    );
    const result = await explainFindings(findings.rows);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
