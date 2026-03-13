"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./TableColumnHeader";
import { DataTableRowActions } from "./TableRowActions";
import { IRequestType } from "@/types/type";
import { formatToLocalDate, formattedPrice } from "@/lib/utils";
import { statuses } from "./Status";

export const columns: ColumnDef<IRequestType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking ID" />,
    cell: ({ row }) => <div className="flex">{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'bookingDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formatToLocalDate(row.getValue('bookingDate'))}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'bookingTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">{row.getValue('bookingTime')}</span>
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue('status'))

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'packageInfo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Package" />,
    cell: ({ row }) => {
      const pkg = row.getValue('packageInfo') as any
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {pkg && typeof pkg === 'object' ? pkg.name : pkg}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'startFrom',
    header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
    cell: ({ row }) => {
      const startFrom = row.getValue('startFrom') as any
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {startFrom && typeof startFrom === 'object'
              ? startFrom.postCode + ', ' + startFrom.city
              : startFrom}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'destination',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
    cell: ({ row }) => {
      const destination = row.getValue('destination') as any
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {destination && typeof destination === 'object'
              ? destination.postCode + ', ' + destination.city
              : destination}
          </span> 
        </div>
      )
    },
  },

  {
    accessorKey: 'totalBill',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Bill" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="flex truncate font-medium">
            {formattedPrice(row.getValue('totalBill'))}
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div>Action</div>,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
