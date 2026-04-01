import { apiClient } from "@/lib/ApiClient";

const findContentByType = async (type) => {
  try {
    const res = await apiClient.get(`/admin/static-content/by-type/${type}`);
    return res.data;
  } catch {
    return null;
  }
};

export default findContentByType;
