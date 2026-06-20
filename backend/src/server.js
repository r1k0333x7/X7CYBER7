import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import scanRoutes from './routes/scan.routes.js';
import intelRoutes from './routes/intel.routes.js';
import reportRoutes from './routes/report.routes.js';
import { createServer } from 'node:http';
import { initRealtime } from './realtime.js';
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

// Auth
app.use('/api/auth', authRoutes);

// Scans
app.use('/api/scans', scanRoutes);

// Intelligence (CVE, domain, DNS, tech/WAF)
app.use('/api/intel', intelRoutes);

// Reports
app.use('/api/reports', reportRoutes);

// Dashboard summary (protected; mock data until scan aggregation lands)
app.get('/api/dashboard/summary', authenticate, (_req, res) => {
  res.json({
    securityScore: 0,
    findings: { critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
    assets: 0,
    scans: 0
  });
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

httpServer.listen(config.port, () => {
  console.log(`X7 backend (HTTP + WS) listening on port ${config.port}`);
});
