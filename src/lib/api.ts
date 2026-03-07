/* ═══════════════════════════════════════════════════════════
   RS CAB — API Client
   Central HTTP helper that attaches the Cognito ID token.
   ═══════════════════════════════════════════════════════════ */

// ApiResponse type used internally for backend envelope detection

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'https://backend.real-support.com/api';
const BASE = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

// ── Token management ──

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('rs_token', token);
    else localStorage.removeItem('rs_token');
  }
}

export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== 'undefined') {
    _token = localStorage.getItem('rs_token');
  }
  return _token;
}

// ── HTTP helpers ──

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    return null as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message || json.error || res.statusText,
      json,
    );
  }

  // Unwrap: if backend returns { success, data, message }, return data directly
  if (json.success !== undefined && json.data !== undefined) return json.data as T;
  return json as T;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ── Convenience methods ──

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Upload with multipart/form-data (no Content-Type header — browser sets boundary) */
  upload: <T>(path: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (res) => {
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!res.ok) throw new ApiError(res.status, res.statusText);
        return null as T;
      }
      const json = await res.json();
      if (!res.ok) throw new ApiError(res.status, json.message || res.statusText, json);
      if (json.success !== undefined && json.data !== undefined) return json.data as T;
      return json as T;
    });
  },
};
