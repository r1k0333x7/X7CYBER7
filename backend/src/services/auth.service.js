import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { query } from '../db/pool.js';
import { config } from '../config.js';

const SALT_ROUNDS = 12;

export async function registerUser({ email, password, fullName, role = 'viewer' }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  // Bootstrap: the very first registered user becomes admin so the platform
  // is usable out of the box. Subsequent users default to the requested role.
  const countRes = await query('SELECT COUNT(*)::int AS count FROM users');
  const effectiveRole = countRes.rows[0].count === 0 ? 'admin' : role;

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role, twofa_enabled, created_at`,
    [email, passwordHash, fullName || null, effectiveRole]
  );
  return result.rows[0];
}

export async function verifyCredentials(email, password) {
  const result = await query(
    'SELECT id, email, password_hash, role, twofa_enabled FROM users WHERE email = $1 AND is_active = TRUE',
    [email]
  );
  const user = result.rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function setupTwoFactor(userId, email) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, config.appName, secret);
  await query('UPDATE users SET twofa_secret = $1 WHERE id = $2', [secret, userId]);
  const qrDataUrl = await QRCode.toDataURL(otpauth);
  return { secret, otpauth, qrDataUrl };
}

export async function enableTwoFactor(userId, token) {
  const result = await query('SELECT twofa_secret FROM users WHERE id = $1', [userId]);
  const secret = result.rows[0]?.twofa_secret;
  if (!secret) {
    const err = new Error('2FA not initialized');
    err.status = 400;
    throw err;
  }
  const valid = authenticator.verify({ token, secret });
  if (!valid) {
    const err = new Error('Invalid 2FA token');
    err.status = 400;
    throw err;
  }
  await query('UPDATE users SET twofa_enabled = TRUE WHERE id = $1', [userId]);
  return true;
}

export async function verifyTwoFactor(userId, token) {
  const result = await query('SELECT twofa_secret FROM users WHERE id = $1', [userId]);
  const secret = result.rows[0]?.twofa_secret;
  if (!secret) return false;
  return authenticator.verify({ token, secret });
}
