import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

// AI Security Assistant: explains and prioritizes findings for a selected scan.
export default function AiAssistant() {
  const [scanId, setScanId] = useState('');
  const scans = useQuery({ queryKey: ['scans-ai'], queryFn: () => apiFetch('/api/scans'), retry: false });
  const completed = (scans.data?.scans || []).filter((s) => s.status === 'completed');

  const explain = useMutation({ mutationFn: () => apiFetch(`/api/ai/explain/${scanId}`) });

  return (
    <div className="glass p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-300">AI Security Assistant</h2>
      <div className="flex gap-3">
        <select value={scanId} onChange={(e) => setScanId(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Pilih scan untuk dijelaskan...</option>
          {completed.map((s) => <option key={s.id} value={s.id}>{s.target_url}</option>)}
        </select>
        <button disabled={!scanId || explain.isPending} onClick={() => explain.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">{explain.isPending ? 'Analyzing...' : 'Explain'}</button>
      </div>
      {explain.data && (
        <div className="text-sm text-slate-300 whitespace-pre-wrap border-t border-white/5 pt-3">
          <span className="text-[10px] uppercase text-slate-500">source: {explain.data.source}</span>
          <p className="mt-1">{explain.data.summary}</p>
        </div>
      )}
    </div>
  );
}
