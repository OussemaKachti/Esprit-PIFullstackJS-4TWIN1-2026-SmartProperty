const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function getApiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export async function apiRequest(path, options = {}) {
  const url = getApiUrl(path);

  const token =
    typeof window !== 'undefined' &&
    window.localStorage?.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
}