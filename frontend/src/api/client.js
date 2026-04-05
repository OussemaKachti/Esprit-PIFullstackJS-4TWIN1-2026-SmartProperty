// Two bases: backend (Express) and FastAPI (matching/credit).
const BACKEND_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const FASTAPI_BASE = 'http://127.0.0.1:8000';

function resolveBase(path, base) {
  if (base === 'backend') return BACKEND_BASE;
  if (base === 'fastapi') return FASTAPI_BASE;
  // Heuristic: backend endpoints start with /api/
  if (path.startsWith('/api/')) return BACKEND_BASE;
  return FASTAPI_BASE;
}

export function getApiUrl(path, base) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const root = resolveBase(normalized, base);
  return `${root}${normalized}`;
}

export async function apiRequest(path, options = {}) {
  const { base, ...rest } = options;
  const url = getApiUrl(path, base);

  const token =
    typeof window !== 'undefined' &&
    window.localStorage?.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...rest.headers,
  };

  const res = await fetch(url, { ...rest, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
}