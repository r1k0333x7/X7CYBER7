import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import { authenticate, authorize } from './middleware/auth.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'x7-backend', time: new Date().toISOString() });
});

// Auth
app.use('/api/auth', authRoutes);

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

app.listen(config.port, () => {
  console.log(`X7 backend listening on port ${config.port}`);
});
