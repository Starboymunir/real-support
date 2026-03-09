import { ArchiveRestore, ArrowUpFromDot, Coins } from "lucide-react";

export const statuses = [
  {
    value: "TOPUP",
    label: "Topup",
    icon: Coins,
  },
  {
    value: "EXPENSE",
    label: "Booking Expense",
    icon: ArrowUpFromDot,
  },
  {
    value: "WITHDRAW",
    label: "With Draw",
    icon: ArchiveRestore,
  },
  {
    value: "P2P_WALLET",
    label: "P2P",
    icon: ArrowUpFromDot,
  },
  {
    value: "COMMISSION",
    label: "Commission",
    icon: ArrowUpFromDot,
  },
  {
    value: "REQUEST",
    label: "Payment Request",
    icon: ArrowUpFromDot,
  },
  {
    value: "DEPOSIT",
    label: "Deposit",
    icon: ArchiveRestore,
  },
  {
    value: "REFUND",
    label: "Booking Refund",
    icon: Coins,
  },
  {
    value: "BOOKING_INCOME",
    label: "Booking Income",
    icon: Coins,
  },
  {
    value: "ADMIN_COMMISSION",
    label: "Admin Commission",
    icon: ArrowUpFromDot,
  },
  {
    value: "ADMIN_CHARGE",
    label: "Admin Charge",
    icon: ArrowUpFromDot,
  },
  {
    value: "ADMIN_FUND",
    label: "Admin Fund",
    icon: ArrowUpFromDot,
  },
];
