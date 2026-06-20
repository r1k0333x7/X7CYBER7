import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '../lib/nav';

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      className="glass m-3 p-3 flex flex-col shrink-0 sticky top-3 h-[calc(100vh-1.5rem)]"
    >
      <div className="flex items-center justify-between mb-6 px-1">
        {!collapsed && <span className="neon-text font-bold tracking-widest">X7//SEC</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-slate-400 hover:text-neon transition"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-neon/10 text-neon border border-neon/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
