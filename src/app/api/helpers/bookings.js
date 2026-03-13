import prisma from "@/database/prisma";
import { addressFieldChecker } from "../utils/addressFieldChecker";

export const findAllBookings = async () => {
  const result = await prisma.booking.findMany({
    include: {
      startFrom: true,
      destination: true,
      stoppages: true,
      packageInfo: true,
      driverInfo: {
        include: {
          userInfo: true,
          document: true,
          car: {
            include: {
              carDocument: true,
            },
          },
        },
      },
      requestInfo: {
        include: {
          startFrom: true,
          destination: true,
          stoppages: true,
          packageInfo: true,
        },
      },
      riderInfo: true,
    },
  });

  return result;
};

export const findAllRideRequest = async () => {
  const result = await prisma.request.findMany({
    include: {
      startFrom: true,
      destination: true,
      stoppages: true,
      packageInfo: true,
      riderInfo: true,
    },
  });

  return result;
};

export const findBooking = async (id) => {
  const result = await prisma.booking.findMany({
    include: {
      driverInfo: {
        include: {
          userInfo: true,
          document: true,
          car: true,
        },
      },
      requestInfo: {
        include: {
          startFrom: true,
          destination: true,
          stoppages: true,
        },
      },
      riderInfo: {
        userInfo: true,
      },
    },
    where: { id },
  });
  return result;
};

export const createBooking = async (data) => {
  const result = await prisma.Booking.create({ data });
  return result;
};

export const findAllRideBidRequest = async (id) => {
  const result = await prisma.request.findMany({
    where: {
      id,
    },
    include: {
      requestInfo: true,
      driverInfo: true,
      riderInfo: true,
    },
  });

  return result;
};

export const createBidPlace = async (data) => {
  const result = await prisma.Bidplace.create({ data });
  return result;
};

export const findCart = async () => {
  const result = await prisma.request.findUnique({
    include: {
      startFrom: true,
      destination: true,
      stoppages: true,
    },
    where: { id },
  });
  return result;
};

export const createCart = async (data, startFromId, destinationId) => {
  const tempData = { ...data, startFromId, destinationId };

  delete tempData.startAddress;
  delete tempData.destinationAddress;
  delete tempData.stoppages;
  const cart = await prisma.request.create({
    data: {
      ...tempData,
      totalBill: Number(tempData.totalBill),
      totalDistance: Number(tempData.totalDistance),
    },
  });
  return cart;
};

export const createAddress = async (data) => {
  const address = await prisma.Address.create({ data });
  return address;
};

export const createStopages = async (stoppages, requestId, userId) => {
  if (stoppages?.length && requestId) {
    const result = [];
    for (let i = 0; i < stoppages?.length - 1; ++i) {
      const stopagesFields = addressFieldChecker(stoppages[i]);
      if (stopagesFields) {
        const newStopages = await createAddress({
          ...stoppages[i],
          requestId,
          userId,
        });
        result.push(newStopages);
      }
    }
    return result;
  }
};
