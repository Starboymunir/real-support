import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/axios";
import { IBookingType, IContactUs } from "@/types/type";
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

export const useContactUsQuery = (id: string) => {
  return useQuery<IContactUs, Error>({
    queryKey: ["contact-us", id],
    queryFn: async () => {
      const response = await apiClient.get<IContactUs>(`/contact-us/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUserFeedbacksQuery = () => {
  return useQuery<IContactUs[], Error>({
    queryKey: ["user-feedback-list"],
    queryFn: async () => {
      const response = await apiClient.get<IContactUs[]>("/contact-us/user");
      return response.data;
    },
  });
};

// Admin

export const useAdminFeedbacksQuery = () => {
  return useQuery<IContactUs[], Error>({
    queryKey: ["admin-feedback-list"],
    queryFn: async () => {
      const response = await apiClient.get<IContactUs[]>("/contact-us");
      return response.data;
    },
  });
};
