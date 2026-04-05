import { apiClient } from "@/lib/ApiClient";

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'https://pssl-backend-nest-b25x.onrender.com/api';
const BASE = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

const findContentByType = async (type) => {
  try {
    const res = await apiClient.get(`/admin/static-content/by-type/${type}`);
    return res.data;
  } catch {
    return null;
  }
};

export const fetchPublicContent = async (type) => {
  try {
    const res = await fetch(`${BASE}/static-content/by-type/${type}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
};

export default findContentByType;
