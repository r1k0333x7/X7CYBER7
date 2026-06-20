// Lightweight API client for the X7 backend. Authentication has been removed,
// so no token is attached and 401 handling is no longer needed.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    const err = new Error(
      `Tidak dapat terhubung ke backend di ${API_BASE}. ` +
        'Pastikan backend berjalan, NEXT_PUBLIC_API_BASE benar (https), dan CORS mengizinkan domain ini.'
    );
    err.status = 0;
    err.cause = networkErr;
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
