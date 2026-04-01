import { apiClient } from "@/lib/ApiClient";

export const getStaticContentByType = async (type) => {
  try {
    const result = await apiClient.get(`/admin/static-content/by-type/${type}`);
    if (!result.data) {
      return { message: "static content not found", statusCode: 400 };
    }
    return { data: result.data, statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};

export const updateStaticContent = async (id, data) => {
  try {
    const result = await apiClient.patch(`/admin/static-content/${id}`, data);
    return { data: result.data, statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};
