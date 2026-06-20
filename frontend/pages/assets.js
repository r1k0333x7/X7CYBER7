import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function Assets() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['assets'], queryFn: () => apiFetch('/api/assets'), retry: false });
  const [form, setForm] = useState({ name: '', value: '', type: 'domain', authorized: false });

  const create = useMutation({
    mutationFn: () => apiFetch('/api/assets', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); setForm({ name: '', value: '', type: 'domain', authorized: false }); }
  });
  const remove = useMutation({
    mutationFn: (id) => apiFetch(`/api/assets/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] })
  });

  const assets = data?.assets || [];

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
        <h1 className="text-xl font-bold neon-text">Asset Inventory</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama aset" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="example.com / IP" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option value="domain">domain</option>
            <option value="subdomain">subdomain</option>
            <option value="server">server</option>
            <option value="ip">ip</option>
          </select>
          <button disabled={!form.name || !form.value || create.isPending} onClick={() => create.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">Add</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={form.authorized} onChange={(e) => setForm((f) => ({ ...f, authorized: e.target.checked }))} />
          Aset ini saya miliki atau saya berwenang mengauditnya.
        </label>
      </motion.div>

      <div className="glass p-5">
        <ul className="space-y-2">
          {assets.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
              <span className="text-slate-200">{a.name} <span className="text-slate-500">· {a.value} · {a.type}</span> {a.authorized && <span className="text-emerald-400 text-xs">✓ authorized</span>}</span>
              <button onClick={() => remove.mutate(a.id)} className="text-xs text-red-400 hover:underline">Delete</button>
            </li>
          ))}
          {assets.length === 0 && <li className="text-xs text-slate-500">Belum ada aset.</li>}
        </ul>
      </div>
    </div>
  );
}
