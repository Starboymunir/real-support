"use client";

import { Card } from "@/components/ui/card";
import RequestCard from "./RequestCard";
import axiosInstance from "@/lib/axios";
import { Request } from "@/types/prisma-types";
import { useSnackbar } from "notistack";
import { useAuthContext } from "@/providers/auth-providers";
import { Separator } from "../ui/separator";

type CardProps = {
  userId: string;
  requests?: Request[];
  refetchRequests: () => void;
  isRequestsLoading: boolean;
} & React.ComponentProps<typeof Card>;

export default function RequestCardList({
  requests = [],
  refetchRequests,
  isRequestsLoading,
}: CardProps) {
  const { loading, setLoading, refetchWallet } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const cancelRide = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/requests/${id}`);
      enqueueSnackbar(`Request cancelled successfully`);
    } catch (error: any) {
      console.error("Error in canceling request:", error);
      enqueueSnackbar(error.message || "Failed to cancel request", {
        variant: "error",
      });
    } finally {
      setLoading(false);
      refetchRequests();
      refetchWallet();
    }
  };

  if (isRequestsLoading) {
    return (
      <div className="w-full h-full py-5 bg-card shadow-lg px-2 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="w-full h-full py-5 bg-card shadow-lg px-2 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">You have no pending requests</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-5 bg-card shadow-lg px-2 rounded-xl border-2">
      {/* Request cards */}
      {requests.map((item, i: number) => (
        <div key={item.id}>
          <RequestCard request={item} cancelRide={cancelRide} />
          {i < requests.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}
