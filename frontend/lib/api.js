// Lightweight API client for the X7 backend.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('x7_token');
}

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const auth = {
  login: (body) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch('/api/auth/me')
};

export function setToken(token) {
  if (typeof window !== 'undefined') window.localStorage.setItem('x7_token', token);
}

export function clearToken() {
  if (typeof window !== 'undefined') window.localStorage.removeItem('x7_token');
}
