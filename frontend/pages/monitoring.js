import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import SeverityBadge from '../components/SeverityBadge';

// Monitoring overview: surfaces recent scans and any time-sensitive findings
// (SSL/domain expiry) that the scheduler keeps fresh.
export default function Monitoring() {
  const scans = useQuery({ queryKey: ['scans-monitor'], queryFn: () => apiFetch('/api/scans'), retry: false });
  const completed = (scans.data?.scans || []).filter((s) => s.status === 'completed');

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-xl font-bold neon-text">Monitoring</h1>
        <p className="text-xs text-slate-400 mt-1">SSL & domain expiry, DNS changes, and new CVE alerts. Atur scan terjadwal di Settings.</p>
      </motion.div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5"><div className="text-xs uppercase text-slate-400">Monitored Scans</div><div className="mt-2 text-2xl font-bold neon-text">{completed.length}</div></div>
        <div className="glass p-5"><div className="text-xs uppercase text-slate-400">Avg Score</div><div className="mt-2 text-2xl font-bold neon-text">{completed.length ? Math.round(completed.reduce((a, s) => a + (s.security_score || 0), 0) / completed.length) : '--'}</div></div>
        <div className="glass p-5"><div className="text-xs uppercase text-slate-400">Lowest Score</div><div className="mt-2 text-2xl font-bold text-orange-400">{completed.length ? Math.min(...completed.map((s) => s.security_score || 0)) : '--'}</div></div>
        <div className="glass p-5"><div className="text-xs uppercase text-slate-400">Channels</div><div className="mt-2 text-sm text-slate-300">in-app, webhook, discord</div></div>
      </section>

      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Monitored Assets</h2>
        <ul className="space-y-2">
          {completed.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
              <span className="text-slate-200 truncate">{s.target_url}</span>
              <span className="flex items-center gap-2">
                <SeverityBadge severity={s.security_score >= 80 ? 'low' : s.security_score >= 50 ? 'medium' : 'high'} />
                <span className="text-xs text-slate-500">{s.security_score}/100</span>
              </span>
            </li>
          ))}
          {completed.length === 0 && <li className="text-xs text-slate-500">Belum ada aset yang dipantau.</li>}
        </ul>
      </div>
    </div>
  );
}
