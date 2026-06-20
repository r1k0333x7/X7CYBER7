import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// List schedules for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, value, updated_at FROM settings WHERE key = 'schedule' AND user_id = $1",
      [req.user.id]
    );
    res.json({ schedules: result.rows });
  } catch (err) { next(err); }
});

// Create or update a scheduled scan
router.post('/', authenticate, authorize('admin', 'analyst'), async (req, res, next) => {
  try {
    const { targetUrl, mode = 'quick', intervalHours = 24 } = req.body || {};
    if (!targetUrl) return res.status(400).json({ error: 'targetUrl is required' });
    const value = { targetUrl, mode, intervalHours, lastRun: null };
    const result = await query(
      `INSERT INTO settings (user_id, key, value) VALUES ($1, 'schedule', $2)
       ON CONFLICT (user_id, key) DO UPDATE SET value = $2, updated_at = now()
       RETURNING id, value`,
      [req.user.id, value]
    );
    res.status(201).json({ schedule: result.rows[0] });
  } catch (err) { next(err); }
});

export default router;
