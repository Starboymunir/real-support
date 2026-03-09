"use server";

import prisma from "@/database/prisma";
import { Booking, Package, Request } from "@prisma/client";

type QueryType = {
  passengerId: string;
  OR?: {
    status:
      | "COMPLETED"
      | "REJECTED"
      | "CANCELLED"
      | "WAY_TO_PICKUP"
      | "ACCEPTED"
      | "ARRIVED"
      | "PICKED_UP"
      | "WAY_TO_DESTINATION";
  }[];
  status?: "COMPLETED" | "ACCEPTED";
};

type QueryTypeDriver = {
  driverId: string;
  OR?: {
    status:
      | "COMPLETED"
      | "REJECTED"
      | "CANCELLED"
      | "WAY_TO_PICKUP"
      | "ACCEPTED"
      | "ARRIVED"
      | "PICKED_UP"
      | "WAY_TO_DESTINATION";
  }[];
  status?: "COMPLETED" | "ACCEPTED";
};

export const fetchRequests = async (userId: string) => {
  const requests: Request[] = await prisma.request.findMany({
    where: { passengerId: userId, status: "PENDING" },
    include: {
      packageInfo: true,
      riderInfo: true,
      startFrom: true,
      destination: true,
      stoppages: true,
    },
  });
  return requests;
};

export const fetchBookings = async (userId: string, type: string) => {
  const query: QueryType = { passengerId: userId };

  if (type == "previous") {
    query["OR"] = [
      { status: "COMPLETED" },
      { status: "REJECTED" },
      { status: "CANCELLED" },
    ];
  } else if (type == "upcoming") {
    query["OR"] = [
      { status: "ACCEPTED" },
      { status: "WAY_TO_PICKUP" },
      { status: "ARRIVED" },
      { status: "PICKED_UP" },
      { status: "WAY_TO_DESTINATION" },
    ];
  } else if (type == "completed") {
    query.status = "COMPLETED";
  } else {
  }

  const bookings: Booking[] = await prisma.booking.findMany({
    where: query,
    include: {
      packageInfo: true,
      startFrom: true,
      destination: true,
      riderInfo: true,
      driverInfo: {
        include: {
          userInfo: true,
        },
      },
      requestInfo: true,
    },
  });
  return bookings;
};

export const fetchDriverBookings = async (
  driverId: string,
  type: "upcoming" | "previous" | "completed" | "all"
) => {
  const query: QueryTypeDriver = { driverId };

  if (type === "previous") {
    query["OR"] = [
      { status: "COMPLETED" },
      { status: "REJECTED" },
      { status: "CANCELLED" },
      { status: "ACCEPTED" },
    ];
  } else if (type === "upcoming") {
    query["OR"] = [
      { status: "ACCEPTED" },
      { status: "WAY_TO_PICKUP" },
      { status: "ARRIVED" },
      { status: "PICKED_UP" },
      { status: "WAY_TO_DESTINATION" },
    ];
  } else if (type === "completed") {
    query.status = "COMPLETED";
  }

  const bookings: Booking[] = await prisma.booking.findMany({
    where: query,
    include: {
      packageInfo: true,
      startFrom: true,
      destination: true,
      riderInfo: true,
      driverInfo: true,
      requestInfo: true,
    },
  });

  return bookings;
};

export const fetchPackages = async () => {
  const result: Package[] = await prisma.package.findMany({
    where: {
      status: true,
    },
  });
  return result;
};
