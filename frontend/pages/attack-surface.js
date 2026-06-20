import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const TYPE_COLORS = {
  domain: '#00e5ff',
  subdomain: '#818cf8',
  technology: '#34d399',
  waf: '#f87171',
  dns: '#facc15'
};

export default function AttackSurface() {
  const containerRef = useRef(null);
  const [scanId, setScanId] = useState('');
  const scans = useQuery({ queryKey: ['scans-graph'], queryFn: () => apiFetch('/api/scans') });
  const completed = (scans.data?.scans || []).filter((s) => s.status === 'completed');

  const graph = useQuery({
    queryKey: ['graph', scanId],
    queryFn: () => apiFetch(`/api/graph/${scanId}`),
    enabled: !!scanId
  });

  useEffect(() => {
    if (!graph.data || !containerRef.current) return;
    let cy;
    (async () => {
      const cytoscape = (await import('cytoscape')).default;
      const elements = [
        ...graph.data.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type } })),
        ...graph.data.edges.map((e, i) => ({ data: { id: `e${i}`, source: e.source, target: e.target } }))
      ];
      cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          { selector: 'node', style: { 'background-color': (el) => TYPE_COLORS[el.data('type')] || '#94a3b8', label: 'data(label)', color: '#cbd5e1', 'font-size': 8, 'text-valign': 'bottom' } },
          { selector: 'edge', style: { width: 1, 'line-color': 'rgba(255,255,255,0.15)' } }
        ],
        layout: { name: 'concentric', minNodeSpacing: 30 }
      });
    })();
    return () => cy && cy.destroy();
  }, [graph.data]);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-3">
        <h1 className="text-xl font-bold neon-text">Attack Surface</h1>
        <p className="text-xs text-slate-400">Visualisasi domain, subdomain, teknologi, WAF, dan DNS dari hasil scan.</p>
        <select value={scanId} onChange={(e) => setScanId(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Pilih scan...</option>
          {completed.map((s) => <option key={s.id} value={s.id}>{s.target_url}</option>)}
        </select>
      </motion.div>
      <div className="glass p-2">
        <div ref={containerRef} className="w-full h-[480px] rounded-xl" />
      </div>
    </div>
  );
}
