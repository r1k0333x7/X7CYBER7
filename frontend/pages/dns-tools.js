import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function DnsTools() {
  const [domain, setDomain] = useState('');
  const lookup = useMutation({ mutationFn: () => apiFetch(`/api/intel/dns/${encodeURIComponent(domain)}`) });
  const records = lookup.data?.records || {};

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h1 className="text-xl font-bold neon-text">DNS Tools</h1>
        <p className="text-xs text-slate-400">A, AAAA, MX, TXT, NS, CNAME via DNS-over-HTTPS.</p>
        <div className="flex gap-3">
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <button disabled={!domain || lookup.isPending} onClick={() => lookup.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">{lookup.isPending ? 'Resolving...' : 'Resolve'}</button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(records).map(([type, list]) => (
          <div key={type} className="glass p-4">
            <h2 className="text-neon text-sm font-mono mb-2">{type}</h2>
            {list.length === 0 ? (
              <p className="text-xs text-slate-500">No records</p>
            ) : (
              <ul className="text-xs text-slate-300 space-y-1">
                {list.map((r, i) => <li key={i} className="font-mono break-all">{r.data} <span className="text-slate-600">ttl {r.ttl}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
