import prisma from "@/database/prisma";

export const findAllPassengers = async () => {
  const result = await prisma.Passenger.findMany({
    include: { userInfo: true },
  });

  return result;
};

export const createPassenger = async (data, fileName, userId) => {
  const tempData = { ...data };
  delete tempData.firstName;
  delete tempData.lastName;
  delete tempData.email;
  2;
  delete tempData.password;
  delete tempData.phone_number;
  delete tempData.profileImage;

  const result = await prisma.Passenger.create({
    data: {
      ...tempData,
      userId,
      profileImage: fileName,
      ratings: tempData.ratings ? Number(tempData.ratings) : 0,
      totalBookings: tempData.totalBookings
        ? Number(tempData.totalBookings)
        : 0,
    },
  });

  return result;
};

export const updatePassenger = async (id, data, fileName, prevData) => {
  const tempData = { ...data };

  delete tempData?.firstName;
  delete tempData?.lastName;
  delete tempData?.phone_number;
  delete tempData?.email;
  delete tempData?.password;

  const result = await prisma.Passenger.update({
    where: { id },
    data: {
      ...tempData,
      profileImage: fileName ? fileName : prevData.profileImage,
      ratings: tempData.ratings ? Number(tempData.ratings) : prevData.ratings,
      totalBookings: tempData.totalBookings
        ? Number(tempData.totalBookings)
        : prevData.totalBookings,
    },
  });

  return result;
};

export const deletePassenger = async (id) => {
  const result = await prisma.Passenger.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const findPassenger = async (id) => {
  const result = await prisma.Passenger.findUnique({
    where: { id },
    include: { userInfo: true },
  });

  return result;
};
export const findPassengerByUserId = async (userId) => {
  const result = await prisma.Passenger.findUnique({
    where: { userId },
    include: { userInfo: true },
  });

  return result;
};
