"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./TableColumnHeader";
import { SendRequestRowActions } from "./SendRequestRowActions";
import { formatToLocalDate, formattedPrice } from "@/lib/utils";
import { statuses } from "./PaymentRequestsStatus";
import { PaymentRequests } from "@prisma/client";

export const columns: ColumnDef<PaymentRequests>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: "id",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Transaction ID" />
  //   ),
  //   cell: ({ row }) => <div className="flex">{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "senderName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {row.getValue("senderName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "senderEmail",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {row.getValue("senderEmail")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "senderPhone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {row.getValue("senderPhone")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formattedPrice(row.getValue("amount"))}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "onAccountOf",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="On Account Of" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {row.getValue("onAccountOf")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "remarks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    cell: ({ row }) => {
      const remarks: string = row.getValue("remarks");
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {remarks === "" ? "Not Provided" : remarks}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formatToLocalDate(row.getValue("createdAt"))}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div>Action</div>,
    cell: ({ row }) => {
      if (row.getValue("status") !== "PENDING") {
        return <></>;
      }
      return <SendRequestRowActions row={row} />;
    },
  },
];
