import { query } from '../db/pool.js';
import { broadcast } from '../realtime.js';

// Defensive notification dispatch. Persists in-app and optionally pushes to
// webhook/Discord. Email/Telegram are left as integration points.
export async function notify({ userId, type, title, body, channel = 'in_app' }) {
  await query(
    'INSERT INTO notifications (user_id, type, channel, title, body) VALUES ($1, $2, $3, $4, $5)',
    [userId || null, type, channel, title, body || null]
  );
  broadcast({ type: 'notification', notification: { type, title, body, channel } });

  if (channel === 'webhook' || channel === 'discord') {
    const url = process.env.NOTIFY_WEBHOOK_URL;
    if (url) {
      const payload = channel === 'discord' ? { content: `**${title}**\n${body || ''}` } : { type, title, body };
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
  }
}
