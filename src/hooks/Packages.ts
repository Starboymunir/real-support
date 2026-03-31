"use client";

import axiosInstance from "@/lib/admin-axios";
import { useQuery } from "@tanstack/react-query";
import { AdminPackage } from "@/types/package";

export const usePackagesQuery = () => {
  return useQuery<AdminPackage[], Error>({
    queryKey: ["all-packages"],
    queryFn: async () => getAllPackages(),
  });
};

export const useAdminPackagesQuery = () => {
  return useQuery<AdminPackage[], Error>({
    queryKey: ["all-packages"],
    queryFn: async () => getAllAdminPackages(),
  });
};

export const usePackageQuery = (id: string) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => await findPackageDetails(id),
    enabled: !!id,
  });
};



const getAllPackages = async () => {
  const { data } = await axiosInstance.get("/packages");
  return data.data;
};

const getAllAdminPackages = async () => {
  const { data } = await axiosInstance.get("/packages/admin");
  return data.data;
};

const findPackageDetails = async (id: string) => {
  const { data } = await axiosInstance.get(`/packages/${id}`);
  return data.data;
};