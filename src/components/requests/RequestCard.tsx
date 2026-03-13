"use client";

import React from "react";
import { Card, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { formattedPrice, formatToLocalDate } from "@/lib/utils";

type CardProps = {
  request: any;
  cancelRide: (id: string) => void;
};

const BookingItem: React.FC<CardProps> = ({ request, cancelRide }) => {
  const formattedDate = request.bookingDate ? formatToLocalDate(request.bookingDate as any) : "N/A";
  const formattedTime = request?.bookingTime || "N/A";
  const status = request?.status || "PENDING";
  const requestType = request?.requestType || "N/A";
  const startLocation = request?.startFrom.postCode || "N/A";
  const endLocation = request?.destination.postCode || "N/A";
  const price = request?.totalBill || request?.totalBill || 0;
  const distance = request?.totalDistance 
    ? (request.totalDistance / 1609.34).toFixed(2) // Convert meters to miles if needed
    : request?.totalDistance?.toFixed(2) || "N/A";
  const customerName = request?.clientName || "Customer";

  

  return (
    <Card className="w-full shadow-none border-none p-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <CardDescription className="md:mr-4 mr-2 md:text-sm text-sm font-semibold">
            {formattedDate}
          </CardDescription>
          <CardDescription className="md:text-sm text-sm font-semibold">
            {formattedTime}
          </CardDescription>
        </div>
        <div className="flex justify-center items-end flex-col md:my-2 my-2">
          {status === "ACCEPTED" ? (
            <span className="bg-green-100 text-green-800 md:text-sm text-sm font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              {status}
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 md:text-sm text-sm font-semibold px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              {status}
            </span>
          )}
          <CardDescription className="md:text-sm text-sm font-semibold md:mt-3 mt-1">
            {requestType}
          </CardDescription>
        </div>
      </div>
      <div className="w-full flex flex-row justify-between items-start my-2">
        <div className="flex md:flex-row flex-col w-3/4 gap-2 items-start">
          <div className="md:my-2 my-2 w-3/4">
            <p className="text-gray-500 md:text-sm text-sm font-semibold">
              Customer
            </p>
            <p className="md:text-sm text-sm">{customerName}</p>
          </div>
          <div className="md:my-2 my-2 w-3/4">
            <p className="text-gray-500 md:text-sm text-sm font-semibold">
              Pickup
            </p>
            <p className="md:text-sm text-sm">{startLocation}</p>
          </div>
          <div className="md:my-2 my-2 w-3/4">
            <p className="text-gray-500 md:text-sm text-sm font-semibold">
              Drop Off
            </p>
            <p className="md:text-sm text-sm">{endLocation}</p>
          </div>
        </div>
        <div className="w-1/3 flex justify-center items-end my-2 flex-col">
          <p className="md:text-lg text-md font-semibold">
            {formattedPrice(price)}
          </p>
          <p className="md:text-sm text-sm font-semibold text-right">
            {distance} miles
          </p>
        </div>
      </div>

      <Button
        className={buttonVariants({
          variant: "danger",
          className: "gap-1.5 text-sm w-full text-white",
        })}
        onClick={() => cancelRide(request.id)}
      >
        Cancel Request
      </Button>
    </Card>
  );
};

export default BookingItem;