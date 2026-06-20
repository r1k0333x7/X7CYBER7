import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  verifyCredentials,
  issueToken,
  setupTwoFactor,
  enableTwoFactor,
  verifyTwoFactor
} from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Diagnostics: confirms the auth service and database are reachable.
router.get('/health', async (_req, res) => {
  try {
    const r = await query('SELECT COUNT(*)::int AS users FROM users');
    res.json({ status: 'ok', db: 'connected', users: r.rows[0].users });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'unreachable', detail: err.message });
  }
});

function logAudit(userId, action, req) {
  query(
    'INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)',
    [userId, action, req.ip]
  ).catch(() => {});
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await registerUser({ email, password, fullName, role });
    logAudit(user.id, 'user.register', req);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password, token: otp } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.twofa_enabled) {
      if (!otp) return res.status(401).json({ error: '2FA token required', twofaRequired: true });
      const valid = await verifyTwoFactor(user.id, otp);
      if (!valid) return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    const accessToken = issueToken(user);
    logAudit(user.id, 'user.login', req);
    res.json({ token: accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, twofa_enabled, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] || null });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/setup', authenticate, async (req, res, next) => {
  try {
    const data = await setupTwoFactor(req.user.id, req.user.email);
    res.json({ qrDataUrl: data.qrDataUrl, otpauth: data.otpauth });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/enable', authenticate, async (req, res, next) => {
  try {
    const { token } = req.body || {};
    await enableTwoFactor(req.user.id, token);
    logAudit(req.user.id, 'user.2fa_enabled', req);
    res.json({ enabled: true });
  } catch (err) {
    next(err);
  }
});

export default router;
