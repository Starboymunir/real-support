"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// import {toast} from "sonner";
import { useAuthContext } from "@/providers/auth-providers";
import { processPayment, rejectPaymentRequest } from "@/server/payment";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/providers/SocketProvider";
import { apiClient } from "@/lib/ApiClient";
import { useSnackbar } from "notistack";
interface YourDataInterface {
  id: string;
}

interface SendRequestRowActionsProps<TData> {
  row: Row<TData>;
}

export function SendRequestRowActions<TData extends YourDataInterface>({
  row,
}: SendRequestRowActionsProps<TData>) {
  const { setLoading, loading, userId } = useAuthContext();
  const { socket } = useSocket();
  const pathname = usePathname();
  const navigation = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const onAcceptRequest = async () => {
    if (!row || !row.original) {
      return;
    }
    setLoading(true);
    try {
      const result = await apiClient.patch(
        `/payment-transaction/request/${row?.original?.id}/confirm`
      );
      if (!result.success) {
        enqueueSnackbar(result.message, { variant: "error" });
        if (result.message === "Insufficient balance") {
          localStorage.setItem("topupRedirect", pathname);
          navigation.push(`/wallet/${userId}/top-up`);
        }
        return;
      }
      enqueueSnackbar(result.message, { variant: "success" });
      navigation.push(`/wallet/${userId}`);
    } catch (error) {
      console.log("action error", error);
      enqueueSnackbar((error as Error).message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onRejectRequest = async () => {
    setLoading(true);
    try {
      const result = await apiClient.patch(
        `/payment-transaction/request/${row?.original?.id}/decline`
      );
      if (!result.success) {
        enqueueSnackbar(result.message, { variant: "error" });
        return;
      }
      enqueueSnackbar(result.message, { variant: "success" });
      navigation.push(`/wallet/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[100px]">
        <DropdownMenuItem
          onClick={onAcceptRequest}
          disabled={loading}
          className="bg-primary text-white font-poppins  cursor-pointer "
        >
          Accept
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={loading}
          onClick={onRejectRequest}
          className="bg-destructive text-white font-poppins text-center cursor-pointer"
        >
          Decline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
