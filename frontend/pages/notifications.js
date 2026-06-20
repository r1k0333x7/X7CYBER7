import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function Notifications() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => apiFetch('/api/notifications') });
  const markRead = useMutation({
    mutationFn: (id) => apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  });
  const list = data?.notifications || [];

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-xl font-bold neon-text">Notifications</h1>
        <p className="text-xs text-slate-400 mt-1">Alerts for SSL expiry, DNS changes, new CVEs, and scans.</p>
      </motion.div>
      <div className="glass p-5">
        {list.length === 0 ? (
          <p className="text-xs text-slate-500">No notifications.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 text-sm border-t border-white/5 pt-2">
                <div>
                  <div className={n.read ? 'text-slate-500' : 'text-slate-200'}>{n.title}</div>
                  {n.body && <div className="text-slate-500 text-xs">{n.body}</div>}
                  <div className="text-[10px] text-slate-600 mt-0.5">{n.channel} · {n.created_at?.slice(0, 16).replace('T', ' ')}</div>
                </div>
                {!n.read && (
                  <button onClick={() => markRead.mutate(n.id)} className="text-xs text-neon hover:underline shrink-0">Mark read</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
