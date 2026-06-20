import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const severityCards = [
  { key: 'critical', label: 'Critical', color: 'text-red-400' },
  { key: 'high', label: 'High', color: 'text-orange-400' },
  { key: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { key: 'low', label: 'Low', color: 'text-emerald-400' }
];

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch('/api/dashboard/summary'),
    retry: false
  });

  const findings = data?.findings || {};
  const score = data?.securityScore ?? '--';

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-2xl font-bold neon-text">Security Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Defensive monitoring for authorized assets only.
        </p>
      </motion.div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">Security Score</div>
          <div className="mt-2 text-3xl font-bold neon-text">{score}<span className="text-base text-slate-500">/100</span></div>
        </div>
        {severityCards.map((c) => (
          <div key={c.key} className="glass p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">{c.label}</div>
            <div className={`mt-2 text-3xl font-bold ${c.color}`}>{findings[c.key] ?? 0}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
