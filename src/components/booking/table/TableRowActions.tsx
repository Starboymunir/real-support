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
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "@/components/booking/BookingInvoicePdf";
import { IBookingType } from "@/types/type";
import Loader from "@/components/loader";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-providers";

interface DataTableRowActionsProps {
  row: Row<IBookingType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const booking = row?.original as IBookingType;
  const router = useRouter();
  const { user } = useAuthContext();
  const isDriver = useMemo(() => !!user?.driver, [user]);

  const chatWithUser = useCallback(() => {
    if (isDriver) {
      router.push(
        `/chat?participantId=${(row.original as IBookingType)?.riderInfo?.id}`
      );
    } else {
      router.push(
        `/chat?participantId=${
          (row.original as IBookingType)?.driverInfo?.driverUserId
        }`
      );
    }
  }, [row, isDriver]);

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
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(booking.id)}
        >
          Copy booking ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={chatWithUser}>
          Chat with {isDriver ? "Rider" : "Driver"}
        </DropdownMenuItem>

        {booking && booking?.isAllowGenerateInvoice && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PDFDownloadLink
                document={<InvoicePDF invoice={booking} />}
                fileName={booking?.id}
                style={{ textDecoration: "none" }}
              >
                {({ blob, url, loading, error }) =>
                  loading ? <Loader /> : "Download now!"
                }
              </PDFDownloadLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
