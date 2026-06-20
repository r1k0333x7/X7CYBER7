import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'x7-backend', time: new Date().toISOString() });
});

// Dashboard summary (mock data; replace with real scan aggregation)
app.get('/api/dashboard/summary', (_req, res) => {
  res.json({
    securityScore: 0,
    findings: { critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
    assets: 0,
    scans: 0
  });
});

app.listen(PORT, () => {
  console.log(`X7 backend listening on port ${PORT}`);
});
