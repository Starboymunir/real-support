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

import { useAuthContext } from "@/providers/auth-providers";
import { useRouter } from "next/navigation";
import { IContactUs } from "@/types/type";

interface RowActionsProps {
  row: Row<IContactUs>;
}

export function RowActions({ row }: RowActionsProps) {
  const { loading } = useAuthContext();
  const router = useRouter();

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
          onClick={() => router.push(`/contact/${row.original.id}/details`)}
          disabled={loading}
          className="bg-primary text-white font-poppins  cursor-pointer "
        >
          View
        </DropdownMenuItem>
        {row.original.status !== "COMPLETED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/contact/${row.original.id}/edit`)}
              disabled={loading}
              className="bg-primary text-white font-poppins  cursor-pointer "
            >
              Respond
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
