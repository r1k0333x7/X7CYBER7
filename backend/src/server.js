import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { query } from './db/pool.js';
import scanRoutes from './routes/scan.routes.js';
import intelRoutes from './routes/intel.routes.js';
import reportRoutes from './routes/report.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import graphRoutes from './routes/graph.routes.js';
import aiRoutes from './routes/ai.routes.js';
import assetRoutes from './routes/asset.routes.js';
import { createServer } from 'node:http';
import { initRealtime } from './realtime.js';
import { startScheduler } from './services/scheduler.js';
import { authenticate, authorize } from './middleware/auth.js';

const app = express();

// CORS: comma-separated allowlist via CORS_ORIGINS; falls back to '*' in development.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        // Allow same-origin / server-to-server requests with no Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }
  : {};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'x7-backend', time: new Date().toISOString() });
});

// Scans
app.use('/api/scans', scanRoutes);

// Intelligence (CVE, domain, DNS, tech/WAF)
app.use('/api/intel', intelRoutes);

// Reports
app.use('/api/reports', reportRoutes);

// Notifications, schedules, attack surface graph
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assets', assetRoutes);

// Dashboard summary (protected; aggregates real data)
app.get('/api/dashboard/summary', authenticate, async (req, res, next) => {
  try {
    const [findingsRes, assetsRes, scansRes, scoreRes] = await Promise.all([
      query(
        `SELECT v.severity, COUNT(*)::int AS count
         FROM vulnerabilities v
         JOIN scans s ON s.id = v.scan_id
         WHERE v.status = 'open'
         GROUP BY v.severity`
      ),
      query('SELECT COUNT(*)::int AS count FROM assets WHERE owner_id = $1', [req.user.id]),
      query('SELECT COUNT(*)::int AS count FROM scans'),
      query("SELECT ROUND(AVG(security_score))::int AS avg FROM scans WHERE status = 'completed' AND security_score IS NOT NULL")
    ]);

    const findings = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
    for (const row of findingsRes.rows) {
      if (findings[row.severity] !== undefined) findings[row.severity] = row.count;
    }

    res.json({
      securityScore: scoreRes.rows[0]?.avg ?? null,
      findings,
      assets: assetsRes.rows[0]?.count ?? 0,
      scans: scansRes.rows[0]?.count ?? 0
    });
  } catch (err) {
    next(err);
  }
});

// Example admin-only route
app.get('/api/admin/ping', authenticate, authorize('admin'), (_req, res) => {
  res.json({ pong: true });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const httpServer = createServer(app);
initRealtime(httpServer);
startScheduler();

httpServer.listen(config.port, () => {
  console.log(`X7 backend (HTTP + WS) listening on port ${config.port}`);
});
