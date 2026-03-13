/* ═══════════════════════════════════════════
   Wallet & Payment API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type {
  Wallet,
  Transaction,
  WithdrawRequest,
  PaymentRequest,
  CreatePaymentIntentDto,
  CreateTopUpDto,
  WalletTransferDto,
  CreatePaymentRequestDto,
} from '../types';

export const walletApi = {
  getUserWallet: (userId: string) =>
    api.get<Wallet>(`/payment-transaction/wallets/${userId}`),

  createPaymentIntent: (dto: CreatePaymentIntentDto) =>
    api.post<{ paymentIntent: string; paymentIntentId: string }>('/payment-transaction/intent', dto),

  createTopUp: (dto: CreateTopUpDto) =>
    api.post<Transaction>('/payment-transaction/transaction', dto),

  getUserTransactions: (userId: string) =>
    api.get<Transaction[]>(`/payment-transaction/transactions/${userId}`),

  getTopUpTransactions: (userId: string) =>
    api.get<Transaction[]>(`/payment-transaction/transactions/${userId}/top-up`),

  getP2PTransactions: (userId: string) =>
    api.get<Transaction[]>(`/payment-transaction/transactions/${userId}/transfer`),

  createPaymentRequest: (dto: CreatePaymentRequestDto) =>
    api.post<PaymentRequest>('/payment-transaction/request', dto),

  getSentRequests: (userId: string) =>
    api.get<PaymentRequest[]>(`/payment-transaction/requests/${userId}/send`),

  getReceivedRequests: (userId: string) =>
    api.get<PaymentRequest[]>(`/payment-transaction/requests/${userId}/received`),

  confirmRequest: (id: string) =>
    api.patch<PaymentRequest>(`/payment-transaction/request/${id}/confirm`),

  declineRequest: (id: string) =>
    api.patch<PaymentRequest>(`/payment-transaction/request/${id}/decline`),

  createWithdrawRequest: (data: { userId: string; amount: number; bankAccountId?: string; notes?: string }) =>
    api.post<WithdrawRequest>('/payment-transaction/withdraw', data),

  getUserWithdrawals: (userId: string) =>
    api.get<WithdrawRequest[]>(`/payment-transaction/withdraws/${userId}`),

  getPendingWithdrawals: (userId: string) =>
    api.get<WithdrawRequest[]>(`/payment-transaction/withdraws/${userId}/pending`),

  getCompletedWithdrawals: (userId: string) =>
    api.get<WithdrawRequest[]>(`/payment-transaction/withdraws/${userId}/completed`),

  walletTransfer: (dto: WalletTransferDto) =>
    api.post<Transaction>('/payment-transaction/wallet-transfer', dto),
};
