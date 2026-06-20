import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, type, value, tags, authorized, created_at FROM assets WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ assets: result.rows });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('admin', 'analyst'), async (req, res, next) => {
  try {
    const { name, type = 'domain', value, tags = [], authorized = false } = req.body || {};
    if (!name || !value) return res.status(400).json({ error: 'name and value are required' });
    const result = await query(
      `INSERT INTO assets (owner_id, name, type, value, tags, authorized)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, type, value, tags, authorized, created_at`,
      [req.user.id, name, type, value, tags, authorized]
    );
    res.status(201).json({ asset: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('admin', 'analyst'), async (req, res, next) => {
  try {
    await query('DELETE FROM assets WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
