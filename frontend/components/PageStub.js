import { motion } from 'framer-motion';

export default function PageStub({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6"
    >
      <h1 className="text-xl font-bold neon-text mb-2">{title}</h1>
      <p className="text-slate-400 text-sm max-w-2xl">{description}</p>
      <p className="mt-4 text-xs text-slate-500">Module under construction — defensive features only.</p>
    </motion.div>
  );
}
