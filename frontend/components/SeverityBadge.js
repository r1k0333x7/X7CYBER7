const STYLES = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  informational: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
};

export default function SeverityBadge({ severity }) {
  const cls = STYLES[severity] || STYLES.informational;
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}>
      {severity}
    </span>
  );
}
