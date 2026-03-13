"use server";

import prisma from "@/database/prisma";
import { getPassengerById } from "./Passenger";
import { addressFieldChecker, createStopages } from "@/helpers/BookingRequests";
import { getPacketById } from "./Package";

export const createBookingRequest = async (data: any) => {
  console.log("data----booking---", data);

  // try {
  //   const {
  //     totalDistance,
  //     startAddress,
  //     destinationAddress,
  //     packageId,
  //     clientName,
  //     clientEmail,
  //     clientPhone,
  //     passengerId,
  //     bookingDate,
  //     bookingTime,
  //     totalDuration,
  //     totalBill,
  //     totalPersons,
  //     totalLuggage,
  //     notes,
  //     paymentType,
  //     couponId,
  //     couponExpiryDate,
  //     couponDiscountAmount,
  //     couponDiscount,
  //     socketId,
  //     stoppages,
  //     totalCash,
  //     totalWallet,
  //   } = data || {};

  //   // Validate required fields
  //   if (
  //     !startAddress ||
  //     !destinationAddress ||
  //     !totalDistance ||
  //     !packageId ||
  //     !clientName ||
  //     !clientEmail ||
  //     !clientPhone ||
  //     !passengerId
  //   ) {
  //     return { status: 400, message: "Required fields are missing" };
  //   }

  //   // Fetch related entities
  //   const passenger = await getPassengerById(passengerId);
  //   if (!passenger) return { status: 400, message: "Passenger not found" };

  //   const bookedPackage = await getPacketById(packageId);
  //   if (!bookedPackage) return { status: 400, message: "Package not found" };

  //   // Validate address fields
  //   if (
  //     !addressFieldChecker(startAddress) ||
  //     !addressFieldChecker(destinationAddress)
  //   ) {
  //     return {
  //       status: 400,
  //       message: "Start or destination address fields are incomplete",
  //     };
  //   }

  //   // Create address entries
  //   const startFrom = await prisma.address.create({
  //     data: { ...startAddress, userId: passengerId },
  //   });

  //   const destination = await prisma.address.create({
  //     data: { ...destinationAddress, userId: passengerId },
  //   });

  //   const requestData = {
  //     startFromId: startFrom.id,
  //     destinationId: destination.id,
  //     packageId: bookedPackage.id,
  //     passengerId,
  //     bookingDate,
  //     bookingTime,
  //     totalDistance: Number(totalDistance),
  //     totalDuration: Number(totalDuration),
  //     totalBill: Number(totalBill),
  //     totalPersons: Number(totalPersons),
  //     totalLuggage: Number(totalLuggage),
  //     notes,
  //     paymentType,
  //     couponCode: couponId,
  //     couponExpiryDate,
  //     discountAmount: couponDiscountAmount,
  //     couponPercentage: couponDiscount,
  //     clientName,
  //     clientEmail,
  //     clientPhone,
  //     socketId,
  //     cashCollected: Number(totalCash),
  //     walletCollected: Number(totalWallet),
  //   };

  //   const result = await prisma.request.create({ data: requestData });

  //   await createStopages(stoppages, result.id, passengerId);

  //   const rideRequest = await findRequest(result.id);
  //   return {
  //     message: "Booking request created successfully",
  //     data: rideRequest,
  //   };
  // } catch (error: any) {
  //   throw { message: error.message };
  // }
};

export const getAllPendingRequest = async () => {
  try {
    const result = await prisma.request.findMany({
      include: {
        startFrom: true,
        riderInfo: true,
        destination: true,
      },
    });
    return result;
  } catch (error: any) {
    throw { message: error.message };
  }
};

export const getUserPendingRequest = async (userId: string) => {
  try {
    const result = await prisma.request.findMany({
      where: {
        passengerId: userId,
        status: "PENDING",
      },
      include: {
        startFrom: true,
        destination: true,
        riderInfo: true,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Error fetching user pending requests:", error);
    throw { message: error.message };
  }
};

export const findRequest = async (id: string) => {
  const result = await prisma.request.findUnique({
    include: {
      startFrom: true,
      destination: true,
      stoppages: true,
      packageInfo: true,
      riderInfo: true,
    },
    where: { id },
  });
  return result;
};

export const updateRequest = async (id: string, data: any) => {
  try {
    const result = await prisma.request.update({
      where: { id },
      data,
    });
    return result;
  } catch (error: any) {
    throw { message: error.message };
  }
};
