import axiosInstance from "@/lib/admin-axios";
import { IBookingType } from "@/types/type";
import { useQuery } from "@tanstack/react-query";

export const useBookingQuery = (id: string) => {
  return useQuery<IBookingType, Error>({
    queryKey: ["booking", id],
    queryFn: async () => await findBookingDetails(id),
    enabled: !!id,
  });
};

export const useUserBookings = (
  id: string,
  page?: number,
  count?: number,
  sort?: string
) => {
  return useQuery<IBookingType[], Error>({
    queryKey: ["user-booking-list", id],
    queryFn: async () => await getAllUserBookings(id, page, count, sort),
    enabled: !!id,
  });
};

const getAllUserBookings = async (
  id: string,
  page?: number,
  count?: number,
  sort?: string
) => {
  const { data } = await axiosInstance.get(
    `/bookings/user/${id}?page=${page}&count=${count}${
      sort ? `&sort=${sort}` : ""
    }`
  );
  return data.data;
};

const findBookingDetails = async (id: string) => {
  const { data } = await axiosInstance.get(`/bookings/${id}`);
  return data.data;
};


// Admin

export const useAdminBookingsQuery = () => {
  return useQuery<IBookingType[], Error>({
    queryKey: ["admin-booking-list"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/bookings/admin");
      return data.data;
    }
  });
};

export type BookingStats = {
  total: number;
  ACCEPTED: number;
  REJECTED: number;
  CANCELLED: number;
  WAY_TO_PICKUP: number;
  ARRIVED: number;
  PICKED_UP: number;
  WAY_TO_DESTINATION: number;
  COMPLETED: number;
};

const EMPTY_STATS: BookingStats = {
  total: 0,
  ACCEPTED: 0,
  REJECTED: 0,
  CANCELLED: 0,
  WAY_TO_PICKUP: 0,
  ARRIVED: 0,
  PICKED_UP: 0,
  WAY_TO_DESTINATION: 0,
  COMPLETED: 0,
};

export const useBookingStatsQuery = () => {
  return useQuery<BookingStats, Error>({
    queryKey: ["admin-booking-stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/bookings/stats");
      return { ...EMPTY_STATS, ...(data?.data || {}) };
    },
  });
};
