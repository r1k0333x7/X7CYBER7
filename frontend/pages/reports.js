import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, API_BASE } from '../lib/api';

export default function Reports() {
  const { data } = useQuery({ queryKey: ['scans-reports'], queryFn: () => apiFetch('/api/scans') });
  const scans = (data?.scans || []).filter((s) => s.status === 'completed');

  const download = (scanId, fmt) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('x7_token') : null;
    fetch(`${API_BASE}/api/reports/${scanId}/${fmt}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `x7-report-${scanId}.${fmt}`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-xl font-bold neon-text">Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Export completed scans as CSV or JSON.</p>
      </motion.div>
      <div className="glass p-5">
        <ul className="space-y-2">
          {scans.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
              <span className="text-slate-200 truncate">{s.target_url} <span className="text-slate-500">· {s.security_score}/100</span></span>
              <span className="flex gap-2">
                <button onClick={() => download(s.id, 'csv')} className="text-xs text-neon hover:underline">CSV</button>
                <button onClick={() => download(s.id, 'json')} className="text-xs text-neon hover:underline">JSON</button>
              </span>
            </li>
          ))}
          {scans.length === 0 && <li className="text-xs text-slate-500">No completed scans yet.</li>}
        </ul>
      </div>
    </div>
  );
}
