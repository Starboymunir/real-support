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
interface YourDataInterface {
  id: string;
}

interface TransactionRowActionsProps<TData> {
  row: Row<TData>;
}

export function TransactionRowActions<TData extends YourDataInterface>({
  row,
}: TransactionRowActionsProps<TData>) {
  const { setLoading, loading, user } = useAuthContext();
  const { socket } = useSocket();
  const pathname = usePathname();
  const navigation = useRouter();

  const onAcceptRequest = async () => {
    if (!row || !row.original) {
      return;
    }
    setLoading(true);
    try {
      const { statusCode, message, data } = await processPayment(
        row?.original?.id
      );
      console.log("statusCode", statusCode);

      if (statusCode === 200) {
        socket?.emit("accept-payment-request", data);
        toast.success("Request Accepted Successfully");
      } else {
        toast.error(message);
        if (message == "Insufficient balance") {
          localStorage.setItem("topupRedirect", pathname);
          navigation.push(`/wallet/${user}/top-up`);
        }
      }
    } catch (error) {
      console.log("action eror", error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onRejectRequest = async () => {
    setLoading(true);
    try {
      const { statusCode, message, data } = await rejectPaymentRequest(
        row?.original?.id
      );
      if (statusCode === 200) {
        socket?.emit("reject-payment-request", {
          data,
          id: socket.id,
        });
        toast.success("Request Rejected Successfully");
      } else {
        toast.error(message);
      }
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
          View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
