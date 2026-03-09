"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./TableColumnHeader";
import { statuses } from "./Status";
import { IContactUs } from "@/types/type";
import { RowActions } from "./RowActions";

export const columns: ColumnDef<IContactUs>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {new Date(row.getValue("createdAt")).toLocaleString()}
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
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Reason" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {row.getValue("reason")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {new Date(row.getValue("updatedAt")).toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div>Action</div>,
    cell: ({ row }) => <RowActions row={row} />,
  },
];
