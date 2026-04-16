"use client";

import axiosInstance from "@/lib/admin-axios";
import { SocialLink, User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

// -----------------------
// Query Param Interface
// -----------------------
interface PassengerQueryParams {
  page?: number;
  count?: number;
  status?: string;
  sort?: "asc" | "desc";
  search?: string;
}

// -----------------------
// Pessanger Interface
// -----------------------
interface Pessanger extends User {
  bookings: any[];
}

// -----------------------
// Response Types
// -----------------------
type PassengersResponse = {
  list: Pessanger[];
  total: number;
};

type UseUsersQueryOptions = {
  changeFlag?: boolean;
};
// -----------------------
// Fetch Functions
// -----------------------
const getAllPassengers = async (
  params: PassengerQueryParams = {}
): Promise<PassengersResponse> => {
  const { data } = await axiosInstance.get("/admin/passengers", { params });
  return {
    list: data.data,
    total: data.totalCount,
  };
};

const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// -----------------------
// React Query Hooks
// -----------------------
export const useUsersQuery = (
  params: PassengerQueryParams = {},
  options: UseUsersQueryOptions = {}
) => {
  const { changeFlag = false } = options;
  return useQuery<PassengersResponse, Error>({
    queryKey: ["all-users", params, changeFlag],
    queryFn: () => getAllPassengers(params),
    placeholderData: (prev) => prev,
  });
};

export const useUserByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["user-by-id", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useBankAccountQuery = (id: string) => {
  return useQuery({
    queryKey: ["bank-account", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/accounts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useSocialLinks = (userId: string) => {
  return useQuery<SocialLink[]>({
    queryKey: ["social-links", userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/social-links/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};

export const usePassengersQuery = () => {
  return useQuery<User[], Error>({
    queryKey: ["passengers"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/passengers/all");
      return data.data;
    },
  });
};
