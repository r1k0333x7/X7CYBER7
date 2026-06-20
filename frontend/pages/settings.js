import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function Settings() {
  const qc = useQueryClient();
  const schedules = useQuery({ queryKey: ['schedules'], queryFn: () => apiFetch('/api/schedules'), retry: false });

  const [form, setForm] = useState({ targetUrl: '', mode: 'quick', intervalHours: 24 });
  const save = useMutation({
    mutationFn: () => apiFetch('/api/schedules', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] })
  });

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-xl font-bold neon-text">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Konfigurasi scan terjadwal dan preferensi platform.</p>
      </motion.div>

      <div className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Scheduled Scan</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input value={form.targetUrl} onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))} placeholder="example.com" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50" />
          <select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option value="quick">Quick</option>
            <option value="deep">Deep</option>
          </select>
          <input type="number" min="1" value={form.intervalHours} onChange={(e) => setForm((f) => ({ ...f, intervalHours: Number(e.target.value) }))} className="w-28 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button disabled={!form.targetUrl || save.isPending} onClick={() => save.mutate()} className="bg-neon/20 border border-neon/40 text-neon rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-40">Save</button>
        </div>
        <p className="text-[10px] text-slate-500">Interval dalam jam. Scan otomatis dijalankan scheduler backend.</p>
        <ul className="text-xs text-slate-400 space-y-1">
          {(schedules.data?.schedules || []).map((s) => (
            <li key={s.id} className="border-t border-white/5 pt-1">{s.value.targetUrl} · {s.value.mode} · setiap {s.value.intervalHours}j</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
