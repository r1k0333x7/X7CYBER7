import { useState } from 'react';
import { useRouter } from 'next/router';
import { NAV_ITEMS } from '../lib/nav';
import { useTheme } from '../lib/theme';
import { clearToken } from '../lib/api';

export default function Topbar() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = q
    ? NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
    : [];

  const go = (href) => {
    setQ('');
    setOpen(false);
    router.push(href);
  };

  return (
    <header className="glass mx-3 mt-3 px-4 py-3 flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder="Quick search..."
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neon/50"
        />
        {open && results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full glass p-1">
            {results.map((r) => (
              <li key={r.href}>
                <button
                  onClick={() => go(r.href)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm"
                >
                  {r.icon} {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={toggle} className="text-sm text-slate-300 hover:text-neon transition">
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
      <button
        onClick={() => {
          clearToken();
          router.push('/login');
        }}
        className="text-sm text-slate-400 hover:text-red-400 transition"
      >
        Logout
      </button>
    </header>
  );
}
