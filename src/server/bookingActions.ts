import axiosInstance from "@/lib/axios";

export const fetchRequests = async (userId: string) => {
  const result = await axiosInstance.get(`/requests/users/${userId}`);
  return result.data?.data || result.data || [];
};

export const fetchBookings = async (userId: string, type: string) => {
  let url = `/bookings/user/${userId}`;
  if (type) url += `?type=${type}`;
  const result = await axiosInstance.get(url);
  return result.data?.data || result.data || [];
};

export const fetchDriverBookings = async (
  driverId: string,
  type: "upcoming" | "previous" | "completed" | "all"
) => {
  let url = `/bookings/driver/${driverId}`;
  if (type) url += `?type=${type}`;
  const result = await axiosInstance.get(url);
  return result.data?.data || result.data || [];
};

export const fetchPackages = async () => {
  const result = await axiosInstance.get("/packages?page=1&count=100&status=true");
  return result.data?.data || result.data || [];
};
