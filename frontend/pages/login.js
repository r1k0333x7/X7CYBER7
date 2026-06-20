import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { auth, setToken } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', token: '' });
  const [needs2fa, setNeeds2fa] = useState(false);

  const login = useMutation({
    mutationFn: () => auth.login(form),
    onSuccess: (data) => {
      setToken(data.token);
      router.push('/');
    },
    onError: (err) => {
      if (err.data?.twofaRequired) setNeeds2fa(true);
    }
  });

  const register = useMutation({
    mutationFn: () => auth.register({ email: form.email, password: form.password, fullName: form.fullName }),
    onSuccess: () => {
      // Auto sign-in right after successful registration.
      login.mutate();
    }
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isRegister = mode === 'register';
  const busy = login.isPending || register.isPending;
  const activeError = isRegister ? register.error || login.error : login.error;
  const showError = isRegister ? register.isError || login.isError : login.isError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
          isRegister ? register.mutate() : login.mutate();
        }}
        className="glass p-8 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold neon-text">X7//SEC</h1>
          <p className="text-xs text-slate-400 mt-1">Defensive Security Platform</p>
        </div>

        {isRegister && (
          <input
            placeholder="Full name"
            value={form.fullName}
            onChange={update('fullName')}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
          />
        )}
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
        {needs2fa && !isRegister && (
          <input
            placeholder="2FA code"
            value={form.token}
            onChange={update('token')}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon/50"
          />
        )}
        {showError && activeError && (
          <p className="text-xs text-red-400">{activeError.message}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-neon/20 border border-neon/40 text-neon rounded-lg py-2 text-sm font-semibold hover:bg-neon/30 transition disabled:opacity-50"
        >
          {busy ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? 'login' : 'register');
            setNeeds2fa(false);
          }}
          className="w-full text-xs text-slate-400 hover:text-neon transition"
        >
          {isRegister ? 'Sudah punya akun? Sign in' : 'Belum punya akun? Register'}
        </button>
        {!isRegister && (
          <p className="text-[10px] text-slate-600 text-center">User pertama otomatis menjadi admin.</p>
        )}
      </motion.form>
    </div>
  );
}
