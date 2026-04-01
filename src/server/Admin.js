import { apiClient } from "@/lib/ApiClient";

const changeAdminStatus = async (id, status) => {
  try {
    const result = await apiClient.patch(`/admin/adminUsers/${id}`, { status });
    return {
      data: result.data,
      message: "user updated successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.log("error", err);
    return {
      message: err.message,
      statusCode: 400,
    };
  }
};

const getAllAdmins = async () => {
  const result = await apiClient.get("/admin/adminUsers");
  return result.data || [];
};

const deleteAdmin = async (id) => {
  try {
    await apiClient.delete(`/admin/adminUsers/${id}`);
    return {
      statusCode: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export { changeAdminStatus, getAllAdmins, deleteAdmin };
