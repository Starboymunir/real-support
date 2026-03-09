"use client";

import React from "react";
import { Card, CardDescription } from "@/components/ui/card";
import { monthNames } from "@/lib/data";
import { formatDistance, formattedPrice } from "@/lib/utils";
import AwsImageRender from "./AwsImageRender";
import { useBookingQuery } from "@/hooks/Bookings";

const BookingItem = ({ id }: { id: string }) => {
  const { data: bookingData, isLoading, isError } = useBookingQuery(id);

  const dateFormat = bookingData?.bookingDate
    ? new Date(bookingData?.bookingDate)
    : null;
  const month =
    dateFormat?.getMonth() !== undefined
      ? monthNames[dateFormat?.getMonth()]
      : null;
  const formattedDate = dateFormat?.getDate() + " " + month;
  const hour = Number(bookingData?.bookingTime?.split(":")[0]);
  const min = Number(bookingData?.bookingTime?.split(":")[1]);
  const isAm = hour < 12;
  const formattedHour = !isAm ? hour - 12 : hour;
  const formattedTimeZone = isAm ? "AM" : "PM";
  const formattedTime = formattedHour + ":" + min + " " + formattedTimeZone;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Some thing went wrong</div>;
  }

  return (
    <Card className="w-full shadow-none border-none px-4">
      <div className="flex flex-row justify-start items-center">
        <CardDescription className="md:mr-4 mr-1 md:text-sm text-sm font-semibold ">
          {formattedDate}
        </CardDescription>
        <CardDescription className="md:text-sm text-sm font-semibold">
          {formattedTime}
        </CardDescription>
      </div>
      <div className="w-full flex justify-between xl:items-center lg:items-center  md:items-start items-start my-4">
        <div className="flex md:flex-row flex-col  items-center ">
          <AwsImageRender
            className="shadow-md rounded-full"
            imageKey={bookingData?.riderInfo?.coverImage}
            placeHolderImage={"/images/profileImagePlaceholder.jpg"}
            alt={bookingData?.riderName}
            height={60}
            width={60}
          />
          <CardDescription className=" font-bold  ml-4">
            {bookingData?.riderName}
          </CardDescription>
        </div>
        <div className="flex justify-center xl:items-end lg:items-end md:items-end items-start flex-col md:my-2 my-2">
          {bookingData?.status === "COMPLETED" ? (
            <span className="bg-green-100 text-green-800 md:text-sm text-sm font-semibold px-2.5 py-0.5 rounded dark:bg-new-green-50 dark:text-new-green-600">
              {bookingData?.status}
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 md:text-sm text-sm font-semibold px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              {bookingData?.status}
            </span>
          )}
          <CardDescription className="md:text-sm text-sm font-semibold mt-3">
            {bookingData?.requestType}
          </CardDescription>
        </div>
      </div>
      <div className="w-full flex  justify-between xl:items-center lg:items-center  md:items-start items-start my-2">
        <div className="flex xl:flex-row lg:flex-row  md:flex-row flex-col w-3/4 gap-2 xl:items-center lg:items-center  md:items-start items-start">
          <div className="md:my-2 my-2 w-3/4">
            <p className="text-gray-500 md:text-sm text-sm font-semibold">
              Pickup
            </p>
            <p className=" md:text-sm text-sm">
              {bookingData?.startFrom?.name}
            </p>
          </div>
          <div className="md:my-2 my-2 w-3/4">
            <p className="text-gray-500 md:text-sm text-sm font-semibold">
              Drop Off
            </p>
            <p className=" md:text-sm text-sm">
              {bookingData?.destination?.name}
            </p>
          </div>
        </div>
        <div className="w-1/4 flex justify-center xl:items-end lg:items-end md:items-end items-start md:my-2 sm:my-2 flex-col">
          <div>
            <p className="md:text-lg text-md font-semibold">
              {formattedPrice(bookingData?.totalBill as number)}
            </p>
          </div>
          <div>
            <p className="md:text-sm text-sm  font-semibold">
              {formatDistance(bookingData?.totalDistance as number)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingItem;
