import { motion } from 'framer-motion';
import { useRealtime } from '../lib/ws';

export default function ThreatFeed() {
  const events = useRealtime();

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <h1 className="text-xl font-bold neon-text">Threat Feed</h1>
        <p className="text-xs text-slate-400 mt-1">Live system events streamed over WebSocket.</p>
      </motion.div>
      <div className="glass p-5 font-mono text-xs">
        {events.length === 0 ? (
          <p className="text-slate-500">Waiting for live events...</p>
        ) : (
          <ul className="space-y-1">
            {events.map((e, i) => (
              <li key={i} className="text-slate-300">
                <span className="text-neon">[{e.type}]</span> {JSON.stringify(e)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
