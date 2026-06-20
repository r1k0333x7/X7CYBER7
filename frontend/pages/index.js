import { motion } from 'framer-motion';

const metrics = [
  { label: 'Security Score', value: '--/100' },
  { label: 'Critical', value: '0' },
  { label: 'High', value: '0' },
  { label: 'Medium', value: '0' },
  { label: 'Low', value: '0' }
];

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold neon-text mb-2"
      >
        X7 Cyber Security Platform
      </motion.h1>
      <p className="text-slate-400 mb-8 text-sm max-w-2xl">
        Defensive security audit, monitoring, and threat intelligence. Hanya untuk
        aset milik sendiri atau yang telah mendapat izin resmi.
      </p>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="glass p-5"
          >
            <div className="text-xs uppercase tracking-wider text-slate-400">{m.label}</div>
            <div className="mt-2 text-2xl font-semibold neon-text">{m.value}</div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
