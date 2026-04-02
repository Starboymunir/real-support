import { apiClient } from "@/lib/ApiClient";
import {
  getAllUserTransactions,
  getAllWithDrawlRequests,
  getUserWallet,
} from "@/server/payment";
import { Wallet } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const useWalletQuery = (id: string) => {
  return useQuery<Wallet, Error>({
    queryKey: ["User-Wallet", id],
    queryFn: async () => {
      const response = await apiClient.get<Wallet>(
        `/payment-transaction/wallets/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useWithdrawalRequestQuery = (id: string) => {
  return useQuery({
    queryKey: ["User-Withdrawal-Requests", id],
    queryFn: () => getAllWithDrawlRequests(id),
    enabled: !!id,
  });
};

export const useUserTransactionQuery = (id: string) => {
  return useQuery({
    queryKey: ["User-Transactions", id],
    queryFn: () => getAllUserTransactions(id),
    enabled: !!id,
  });
};
