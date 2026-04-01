import { apiClient } from "@/lib/ApiClient";

export const fetchContentByType = async (type: any) => {
  try {
    const result = await apiClient.get(`/admin/static-content/by-type/${type}`);
    return result.data || null;
  } catch (err) {
    return null;
  }
};
