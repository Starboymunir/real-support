"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./TableColumnHeader";
import { formatToLocalDate, formattedPrice } from "@/lib/utils";
import { statuses } from "./Status";
import { Transaction } from "@/lib/types";
import { TransactionRowActions } from "./TransactionRowActions";
import { ITransaction } from "@/types/type";

export const columns: ColumnDef<ITransaction>[] = [
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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activity" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("type")
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
  // {
  //   accessorKey: "senderName",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Sender Name" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="flex truncate font-medium">
  //           {row.getValue("senderName")}
  //         </span>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "senderEmail",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Sender Email" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="flex truncate font-medium">
  //           {row.getValue("senderEmail")}
  //         </span>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "receiverName",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Receiver Name" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="flex truncate font-medium">
  //           {row.getValue("receiverName")}
  //         </span>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "receiverEmail",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Receiver Email" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="flex truncate font-medium">
  //           {row.getValue("receiverEmail")}
  //         </span>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "balanceBefore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Previous Balance" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formattedPrice(row.getValue("balanceBefore"))}
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
    accessorKey: "balanceAfter",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="New Balance" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formattedPrice(row.getValue("balanceAfter"))}
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
    cell: ({ row }) => <TransactionRowActions row={row} />,
  },
];
