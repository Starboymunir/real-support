import { apiClient } from "@/lib/ApiClient";

export const getDrivers = async () => {
  const result = await apiClient.get("/admin/drivers?count=1000");
  return result.data || [];
};

export const getDriverById = async (id: string) => {
  const result = await apiClient.get(`/admin/drivers/${id}`);
  return result.data;
};
