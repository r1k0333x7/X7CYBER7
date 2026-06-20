import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import SeverityBadge from '../components/SeverityBadge';

function LiveScan({ scanId }) {
  const { data } = useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => apiFetch(`/api/scans/${scanId}`),
    refetchInterval: (q) => {
      const status = q.state.data?.scan?.status;
      return status === 'completed' || status === 'failed' ? false : 1500;
    }
  });
  if (!data) return null;
  const { scan, findings } = data;

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300 truncate">{scan.target_url}</span>
        <span className="text-xs text-neon uppercase">{scan.status}</span>
      </div>
      <div className="h-2 bg-black/40 rounded overflow-hidden">
        <motion.div className="h-full bg-neon" animate={{ width: `${scan.progress}%` }} />
      </div>
      {scan.status === 'completed' && (
        <div className="text-sm">Security Score: <span className="neon-text font-bold">{scan.security_score}/100</span></div>
      )}
      <ul className="space-y-2">
        {findings.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm border-t border-white/5 pt-2">
            <SeverityBadge severity={f.severity} />
            <div>
              <div className="text-slate-200">{f.title}</div>
              <div className="text-slate-500 text-xs">{f.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Scanner() {
  const qc = useQueryClient();
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState('quick');
  const [authorized, setAuthorized] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);

  const history = useQuery({ queryKey: ['scans'], queryFn: () => apiFetch('/api/scans') });

  const start = useMutation({
    mutationFn: () =>
      apiFetch('/api/scans', {
        method: 'POST',
        body: JSON.stringify({ targetUrl: target, mode, authorized })
      }),
    onSuccess: (data) => {
      setActiveScanId(data.scan.id);
      qc.invalidateQueries({ queryKey: ['scans'] });
    }
  });

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h1 className="text-xl font-bold neon-text">Website Scanner</h1>
        <p className="text-xs text-slate-400">Defensive audit. Only scan assets you own or are authorized to test.</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="example.com"
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option value="quick">Quick Scan</option>
            <option value="deep">Deep Scan</option>
          </select>
          <button
            disabled={!target || !authorized || start.isPending}
            onClick={() => start.mutate()}
            className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40"
          >
            {start.isPending ? 'Starting...' : 'Start Scan'}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} />
          I confirm I am authorized to scan this target.
        </label>
        {start.isError && <p className="text-xs text-red-400">{start.error.message}</p>}
      </motion.div>

      {activeScanId && <LiveScan scanId={activeScanId} />}

      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Scan History</h2>
        <ul className="space-y-2">
          {(history.data?.scans || []).map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
              <button className="text-slate-200 hover:text-neon truncate" onClick={() => setActiveScanId(s.id)}>{s.target_url}</button>
              <span className="text-xs text-slate-500">{s.mode} · {s.status} · {s.security_score ?? '--'}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
