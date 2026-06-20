import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { auth, setToken } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', token: '' });
  const [needs2fa, setNeeds2fa] = useState(false);

  const mutation = useMutation({
    mutationFn: () => auth.login(form),
    onSuccess: (data) => {
      setToken(data.token);
      router.push('/');
    },
    onError: (err) => {
      if (err.data?.twofaRequired) setNeeds2fa(true);
    }
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="glass p-8 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold neon-text">X7//SEC</h1>
          <p className="text-xs text-slate-400 mt-1">Defensive Security Platform</p>
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={update('password')}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
        />
        {needs2fa && (
          <input
            placeholder="2FA code"
            value={form.token}
            onChange={update('token')}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
          />
        )}
        {mutation.isError && (
          <p className="text-xs text-red-400">{mutation.error.message}</p>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-neon/20 border border-neon/40 text-neon rounded-lg py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-50"
        >
          {mutation.isPending ? 'Authenticating...' : 'Sign In'}
        </button>
      </motion.form>
    </div>
  );
}
