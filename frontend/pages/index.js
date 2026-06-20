import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import { apiFetch } from '../lib/api';

const severityCards = [
  { key: 'critical', label: 'Critical', color: '#f87171' },
  { key: 'high', label: 'High', color: '#fb923c' },
  { key: 'medium', label: 'Medium', color: '#facc15' },
  { key: 'low', label: 'Low', color: '#34d399' }
];

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch('/api/dashboard/summary'),
    retry: false
  });
  const scans = useQuery({ queryKey: ['scans-dash'], queryFn: () => apiFetch('/api/scans'), retry: false });

  const findings = data?.findings || {};
  const score = data?.securityScore ?? '--';

  const pieData = severityCards
    .map((c) => ({ name: c.label, value: findings[c.key] ?? 0, color: c.color }))
    .filter((d) => d.value > 0);

  const trend = (scans.data?.scans || [])
    .filter((s) => s.security_score != null)
    .slice(0, 12)
    .reverse()
    .map((s, i) => ({ name: `#${i + 1}`, score: s.security_score }));

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-2xl font-bold neon-text">Security Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Defensive monitoring for authorized assets only.</p>
      </motion.div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">Security Score</div>
          <div className="mt-2 text-3xl font-bold neon-text">{score}<span className="text-base text-slate-500">/100</span></div>
        </div>
        {severityCards.map((c) => (
          <div key={c.key} className="glass p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">{c.label}</div>
            <div className="mt-2 text-3xl font-bold" style={{ color: c.color }}>{findings[c.key] ?? 0}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="glass p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Severity Distribution</h2>
          <div className="h-56">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-500">No findings yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="glass p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Risk Trend (Security Score)</h2>
          <div className="h-56">
            {trend.length === 0 ? (
              <p className="text-xs text-slate-500">Run scans to see trends.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#00e5ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
