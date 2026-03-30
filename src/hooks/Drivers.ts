import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/admin-axios";
import { fetchDriverBookings } from "@/server/bookingActions";
// import { getDrivers } from "@/server/Drivers";
import { IBookingType, IDriver } from "@/types/type";
import { useQuery } from "@tanstack/react-query";

export const useDriversQuery = () => {
  return useQuery<IDriver[], Error>({
    queryKey: ["All-Drivers"],
    queryFn: () => getDrivers(),
  });
};

export const useDriverQuery = (id: string) => {
  return useQuery({
    queryKey: ["Driver", id],
    queryFn: () => getDriverById(id),
    enabled: !!id,
  });
};

export const useDriverBookingsQuery = (
  id: string,
  type: "upcoming" | "previous" | "completed" | "all"
) => {
  return useQuery<IBookingType[]>({
    queryKey: ["DriverId", id],
    queryFn: () => fetchDriverBookings(id, (type = "all")),
    enabled: !!id,
  });
};

export const useOnlineDriversQuery = (packageId?: string) => {
  return useQuery<IDriver[], Error>({
    queryKey: ["Online-Drivers", packageId], // include packageId in the cache key
    queryFn: async () => {
      const response = await apiClient.get<IDriver[]>(
        `/drivers/online${packageId ? `?packageId=${packageId}` : ""}`
      );
      return response.data;
    },
    enabled: packageId !== undefined || packageId === undefined,
  });
};

const getDriverById = async (id: string) => {
  const { data } = await axiosInstance.get(`/admin/drivers/${id}`);
  return data.data;
};

const getDrivers = async () => {
  const { data } = await axiosInstance.get(`/admin/drivers?count=100`);
  return data.data || [];
};
