import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/admin-axios";
import { getUserPendingRequest } from "@/server/Requests";
import { IRequestType } from "@/types/type";
import { useQuery } from "@tanstack/react-query";

export const useRequestsQuery = () => {
  return useQuery({
    queryKey: ["All-Requests"],
    queryFn: async () => await getRequests(),
  });
};

export const useUsersPendingRequestQuery = (id: string) => {
  return useQuery({
    queryKey: ["user-pending-requests", id],
    queryFn: async () => await getUserPendingRequest(id),
    enabled: !!id,
  });
};

export const useRequestQuery = (id: string) => {
  return useQuery<IRequestType, Error>({
    queryKey: ["request", id],
    queryFn: async () => await findRequest(id),
    enabled: !!id,
  });
};

export const useUserRequests = (
  id: string,
  page?: number,
  count?: number,
  sort?: string
) => {
  return useQuery({
    queryKey: ["user-request-list", id],
    queryFn: async () => await getAllRequests(id, page, count, sort),
    enabled: !!id,
  });
};

const getAllRequests = async (
  id: string,
  page?: number,
  count?: number,
  sort?: string
) => {
  const { data } = await axiosInstance.get(
    `/requests/users/${id}?page=${page}&count=${count}&sort=${sort}`
  );
  return data.data;
};

const findRequest = async (id: string) => {
  const { data } = await axiosInstance.get(`/requests/${id}`);
  return data.data;
};

const calculatePrice = async (
  distance: number,
  time: number,
  packageId: string
) => {
  const { data } = await axiosInstance.post(`/others/calculate-price`, {
    distance,
    time,
    packageId,
  });
  return data.data;
};

export const useCalculatePrice = (
  distance: number,
  time: number,
  packageId: string
) => {
  return useQuery({
    queryKey: ["calculate-price", distance, time, packageId],
    queryFn: () => calculatePrice(distance, time, packageId),
    enabled: !!distance && !!time && !!packageId,
  });
};

const getRequests = async () => {
  const { data } = await axiosInstance.get(`/requests`);
  return data.data;
};

// Admin

export const useAdminRequestsQuery = () => {
  return useQuery<IRequestType[], Error>({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const result = await apiClient.get<IRequestType[]>(`/requests/admin`);
      return result.data;
    },
  });
};
