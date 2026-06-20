import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import SeverityBadge from '../components/SeverityBadge';

// Reuses the scanner (quick mode) to perform a TLS-focused check.
export default function SslChecker() {
  const [target, setTarget] = useState('');
  const [scanId, setScanId] = useState(null);

  const start = useMutation({
    mutationFn: () => apiFetch('/api/scans', { method: 'POST', body: JSON.stringify({ targetUrl: target, mode: 'quick', authorized: true }) }),
    onSuccess: (d) => setScanId(d.scan.id)
  });

  const detail = useMutation({ mutationFn: () => apiFetch(`/api/scans/${scanId}`) });

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h1 className="text-xl font-bold neon-text">SSL/TLS Checker</h1>
        <p className="text-xs text-slate-400">Certificate validity, TLS protocol, and expiry analysis. Authorized assets only.</p>
        <div className="flex gap-3">
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="example.com" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <button disabled={!target || start.isPending} onClick={() => start.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">{start.isPending ? 'Checking...' : 'Check'}</button>
        </div>
        {scanId && (
          <button onClick={() => detail.mutate()} className="text-xs text-neon underline">Load results</button>
        )}
      </motion.div>

      {detail.data && (
        <div className="glass p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">TLS Findings</h2>
          <ul className="space-y-2">
            {detail.data.findings.filter((f) => f.category === 'ssl-tls').map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm border-t border-white/5 pt-2">
                <SeverityBadge severity={f.severity} />
                <div><div className="text-slate-200">{f.title}</div><div className="text-slate-500 text-xs">{f.description}</div></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
