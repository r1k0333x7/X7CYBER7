import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function DomainIntelligence() {
  const [domain, setDomain] = useState('');
  const lookup = useMutation({ mutationFn: () => apiFetch(`/api/intel/domain/${encodeURIComponent(domain)}`) });
  const data = lookup.data;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h1 className="text-xl font-bold neon-text">Domain Intelligence</h1>
        <p className="text-xs text-slate-400">RDAP registration data and certificate transparency (crt.sh).</p>
        <div className="flex gap-3">
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <button disabled={!domain || lookup.isPending} onClick={() => lookup.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">{lookup.isPending ? 'Looking up...' : 'Lookup'}</button>
        </div>
      </motion.div>

      {data?.rdap && (
        <div className="glass p-5 text-sm space-y-1">
          <h2 className="text-slate-300 font-semibold mb-2">Registration (RDAP)</h2>
          <p className="text-slate-400">Registered: {data.rdap.registration?.slice(0, 10) || '—'}</p>
          <p className="text-slate-400">Expires: {data.rdap.expiration?.slice(0, 10) || '—'}</p>
          <p className="text-slate-400">Nameservers: {(data.rdap.nameservers || []).join(', ') || '—'}</p>
        </div>
      )}
      {data?.subdomains?.length > 0 && (
        <div className="glass p-5">
          <h2 className="text-slate-300 font-semibold mb-2 text-sm">Subdomains ({data.subdomains.length})</h2>
          <div className="flex flex-wrap gap-2">
            {data.subdomains.map((s) => (
              <span key={s} className="text-xs bg-black/30 border border-white/10 rounded px-2 py-1 text-slate-300">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
