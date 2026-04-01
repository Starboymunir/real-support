import { apiClient } from "@/lib/ApiClient";

export const findAllPassengers = async () => {
  try {
    const res = await apiClient.get("/admin/passengers");
    return res.data || [];
  } catch {
    return [];
  }
};

export const createPassenger = async (data, fileName, userId) => {
  const tempData = { ...data };
  delete tempData.firstName;
  delete tempData.lastName;
  delete tempData.email;
  delete tempData.password;
  delete tempData.phone_number;
  delete tempData.profileImage;

  const res = await apiClient.post("/admin/passengers", {
    ...tempData,
    userId,
    profileImage: fileName,
    ratings: tempData.ratings ? Number(tempData.ratings) : 0,
    totalBookings: tempData.totalBookings ? Number(tempData.totalBookings) : 0,
  });
  return res.data;
};

export const updatePassenger = async (id, data, fileName, prevData) => {
  const tempData = { ...data };
  delete tempData?.firstName;
  delete tempData?.lastName;
  delete tempData?.phone_number;
  delete tempData?.email;
  delete tempData?.password;

  const res = await apiClient.patch(`/admin/passengers/${id}`, {
    ...tempData,
    profileImage: fileName ? fileName : prevData.profileImage,
    ratings: tempData.ratings ? Number(tempData.ratings) : prevData.ratings,
    totalBookings: tempData.totalBookings ? Number(tempData.totalBookings) : prevData.totalBookings,
  });
  return res.data;
};

export const deletePassenger = async (id) => {
  const res = await apiClient.patch(`/admin/passengers/${id}`, { isDeleted: true });
  return res.data;
};

export const findPassenger = async (id) => {
  try {
    const res = await apiClient.get(`/admin/passengers/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findPassengerByUserId = async (userId) => {
  try {
    const res = await apiClient.get(`/admin/passengers?userId=${userId}`);
    const passengers = res.data || [];
    return Array.isArray(passengers) ? passengers[0] || null : passengers;
  } catch {
    return null;
  }
};
