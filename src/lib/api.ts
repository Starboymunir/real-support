/* ═══════════════════════════════════════════════════════════
   RS CAB — API Client
   Central HTTP helper that attaches the JWT access token.
   ═══════════════════════════════════════════════════════════ */

// ApiResponse type used internally for backend envelope detection

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'https://backend.real-support.com/api';
const BASE = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

// Backend origin without /api — used to resolve relative upload paths
const BACKEND_ORIGIN = BASE.replace(/\/api\/?$/, '');

/**
 * Parse an S3 URL and extract bucket + key.
 * Matches patterns like:
 *   https://bucket.s3.region.amazonaws.com/key
 *   https://bucket.s3.amazonaws.com/key
 *   https://s3.region.amazonaws.com/bucket/key
 */
function parseS3Url(url: string): { bucket: string; key: string } | null {
  // bucket.s3.region.amazonaws.com/key  OR  bucket.s3.amazonaws.com/key
  const vhost = url.match(/https?:\/\/([^.]+)\.s3[.-][^/]*\.amazonaws\.com\/(.+)/);
  if (vhost) return { bucket: vhost[1], key: decodeURIComponent(vhost[2]) };
  // s3.region.amazonaws.com/bucket/key
  const path = url.match(/https?:\/\/s3[.-][^/]*\.amazonaws\.com\/([^/]+)\/(.+)/);
  if (path) return { bucket: path[1], key: decodeURIComponent(path[2]) };
  return null;
}

/**
 * Resolve an image URL from the backend.
 * - S3 URLs are routed through the presigned URL proxy.
 * - Relative paths like `/uploads/file.png` are prefixed with the backend origin.
 * - Other absolute URLs (Google, etc.) are returned as-is.
 */
export function resolveImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  // Delegate S3 URLs through the presigned proxy
  if (url.includes('.amazonaws.com')) return resolveS3Url(url);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_ORIGIN}${url}`;
}

/**
 * Resolve an S3 image key (e.g. "uuid.ext") or full S3 URL to a backend presigned URL redirect.
 * Returns null if key is falsy.
 */
export function resolveS3Url(key: string | null | undefined): string | null {
  if (!key) return null;

  // Full S3 URL — extract bucket + key and route through presigned endpoint
  if (key.includes('.amazonaws.com')) {
    const parsed = parseS3Url(key);
    if (parsed) {
      return `${BASE}/documents/s3-image?key=${encodeURIComponent(parsed.key)}&bucket=${encodeURIComponent(parsed.bucket)}`;
    }
  }

  // Other full URL (Google, data:, etc.) — return as-is
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) return key;
  // Relative path (e.g. /api/uploads/...) — resolve via backend origin
  if (key.startsWith('/')) return `${BACKEND_ORIGIN}${key}`;
  // Bare S3 key — route through backend presigned URL endpoint
  return `${BASE}/documents/s3-image?key=${encodeURIComponent(key)}`;
}

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
