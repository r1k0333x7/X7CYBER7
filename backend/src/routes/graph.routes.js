import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { buildAttackSurface } from '../services/graph.js';

const router = Router();

router.get('/:scanId', authenticate, async (req, res, next) => {
  try {
    const result = await query('SELECT id, target_url, summary FROM scans WHERE id = $1', [req.params.scanId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Scan not found' });
    res.json(buildAttackSurface(result.rows[0]));
  } catch (err) { next(err); }
});

export default router;
