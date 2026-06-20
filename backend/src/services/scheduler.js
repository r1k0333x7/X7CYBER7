import { query } from '../db/pool.js';
import { enqueueScan } from './scanner.js';

// Lightweight scheduler: polls for scans due to run again based on settings.
// A scheduled scan is stored in `settings` with key 'schedule' per asset.
// value: { targetUrl, mode, intervalHours, lastRun }
const CHECK_INTERVAL_MS = 60 * 1000;
let timer = null;

async function tick() {
  try {
    const result = await query("SELECT id, user_id, value FROM settings WHERE key = 'schedule'");
    const now = Date.now();
    for (const row of result.rows) {
      const s = row.value || {};
      if (!s.targetUrl || !s.intervalHours) continue;
      const last = s.lastRun ? new Date(s.lastRun).getTime() : 0;
      if (now - last < s.intervalHours * 3600 * 1000) continue;

      const scan = await query(
        `INSERT INTO scans (requested_by, target_url, mode, status)
         VALUES ($1, $2, $3, 'queued') RETURNING id`,
        [row.user_id, s.targetUrl, s.mode === 'deep' ? 'deep' : 'quick']
      );
      enqueueScan(scan.rows[0].id, s.targetUrl, s.mode || 'quick');

      await query('UPDATE settings SET value = $1, updated_at = now() WHERE id = $2', [
        { ...s, lastRun: new Date().toISOString() },
        row.id
      ]);
    }
  } catch (err) {
    console.error('Scheduler tick failed:', err.message);
  }
}

export function startScheduler() {
  if (timer) return;
  timer = setInterval(tick, CHECK_INTERVAL_MS);
  console.log('X7 scheduler started.');
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
