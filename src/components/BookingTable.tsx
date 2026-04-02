import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import AwsImageRender from "./AwsImageRender";
import { formattedPrice } from "@/lib/utils";
import { Booking } from "@/lib/types";
import { IBookingType } from "@/types/type";

type PropsType = {
  tableData: IBookingType[];
};

const TableRowComp = ({ data }: { data: IBookingType }) => {
  return (
    <TableRow className="border-b-0">
      <TableCell className="font-medium font-poppins flex  flex-col justify-center items-center">
        <AwsImageRender
          width={50}
          height={50}
          imageKey={data.riderInfo?.coverImage}
          alt="profileImage"
          placeHolderImage="/images/profileImagePlaceholder.jpg"
        />
        <span className="xl:pl-3text-xs md:text-sm lg:pl-3 md:pl-3 pt-2">
          {data?.riderName}
        </span>
      </TableCell>
      <TableCell className="border-x-2 font-poppins flex-col justify-center items-start">
        <span className="block font-small text-sm md:text-sm text-gray-500">
          Pick Up
        </span>
        <span className="text-sm md:text-sm">{data?.startFrom?.postCode}</span>
      </TableCell>
      <TableCell className="border-x-2 font-poppins flex-col justify-center items-start">
        <span className="block font-small text-sm md:text-sm text-gray-500">
          Drop Off
        </span>
        <span className="text-sm md:text-sm">
          {data?.destination?.postCode}
        </span>
      </TableCell>
      <TableCell className="font-poppins">
        {formattedPrice(data?.totalBill)}
      </TableCell>
    </TableRow>
  );
};

const BookingTable: React.FC<PropsType> = ({ tableData}) => {  
  return (
    <Table className=" h-full bg-card shadow-lg md:p-5 p-1 rounded-2xl">
      <TableHeader className="border-b-2">
        <TableRow>
          <TableHead className="md:w-1/6 text-sm md:text-sm font-poppins font-bold">
            Name
          </TableHead>
          <TableHead className="md:w-2/6 text-sm md:text-sm font-poppins border-x-2 font-bold">
            From
          </TableHead>
          <TableHead className="md:w-2/6  text-sm md:text-sm font-poppins border-x-2 font-bold">
            To
          </TableHead>
          <TableHead className="md:w-1/6 text-sm md:text-sm font-poppins font-bold">
            Price
          </TableHead>
        </TableRow>
      </TableHeader>
      {!tableData?.length && (
        <TableCaption className="text-md relative  md:text-lg font-poppins font-semibold text-center py-2 ">
          Not Found
        </TableCaption>
      )}
      <TableBody className="border-y-0">
        {tableData?.map((data: Booking, index: number) => (
          <TableRowComp data={data} key={index} />
        ))}
      </TableBody>
    </Table>
  );
};

export default BookingTable;
