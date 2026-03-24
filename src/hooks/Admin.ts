"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/admin-axios";
import { IAdmin } from "@/types/type";

export const useAdminUsersQuery = () => {
  return useQuery<IAdmin[], Error>({
    queryKey: ["adminUsers"],
    queryFn: async () => getAllAdminUsers(),
  });
};

const getAllAdminUsers = async (): Promise<IAdmin[]> => {
  const { data } = await axiosInstance.get("/admin/adminUsers");
  return data.data ?? [];
};

export const useAdminUserQuery = (id: string) => {
  return useQuery<IAdmin, Error>({
    queryKey: ["adminUser", id],
    queryFn: async () => getAdminUserById(id),
    enabled: !!id,
  });
};

const getAdminUserById = async (id: string) => {
  const { data } = await axiosInstance.get(`/admin/adminUsers/${id}`);
  return data.data;
};