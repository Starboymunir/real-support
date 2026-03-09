import React from "react";
import { DataTable } from "./table/DataTable";
import { columns } from "./table/Columns";
import { IBookingType } from "@/types/type";

export type FormattedBookingType = IBookingType & {
  start?: string;
  destination?: string;
};


const UserBookingsTable = ({
  bookings = [],
}: {
  bookings: any[];
}) => {
  return <DataTable data={bookings} columns={columns} />;
};

export default UserBookingsTable;
