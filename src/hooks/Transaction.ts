import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/admin-axios";
import { ITransaction, IAdminTransaction, IWithdrawals } from "@/types/type";
import { useQuery } from "@tanstack/react-query";

export const useUserTransactionsQuery = (id: string) => {
  return useQuery<ITransaction[], Error>({
    queryKey: ["user-transactions", id],
    queryFn: async () => getUserTransactions(id),
    enabled: !!id,
  });
};

const getUserTransactions = async (id: string) => {
  const { data } = await axiosInstance.get(
    `/payment-transaction/transactions/${id}`
  );
  return data.data;
};

// Admin
export const useAdminTransactionsQuery = () => {
  return useQuery<IAdminTransaction[], Error>({
    queryKey: ["admin-transactions"],
    queryFn: async () => getAdminTransactions(),
  });
};
const getAdminTransactions = async () => {
  const { data } = await axiosInstance.get(`/payment-transaction/admin`);
  return data.data;
};

export const useUsersTransactionsQuery = () => {
  return useQuery<ITransaction[], Error>({
    queryKey: ["users-transactions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/payment-transaction/admin/users`
      );
      return data.data;
    }
  });
};

export const useWithdrawalRequestsQuery = () => {
  return useQuery<IWithdrawals[], Error>({
    queryKey: ["withdrawal-requests"],
    queryFn: async () => {
      const withdrawals = await apiClient.get<IWithdrawals[]>(`/payment-transaction/admin/withdrawals`);
      return withdrawals.data;
    }
  });
};

export const useCommissionsQuery = () => {
  return useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const commissions = await axiosInstance.get(`/finance/commissions`);
      console.log("commissions", commissions);
      return commissions.data;
    }
  });
};