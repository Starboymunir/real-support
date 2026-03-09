import prisma from "@/database/prisma";
import { fieldsExtracter } from "../utils/filterFields";
import { uploadFile as ImageUploadHelper } from "./imageUpload";
import { v4 as uuid } from "uuid";
import { remove } from "aws-amplify/storage";

// Drivers
export const findAllDrivers = async () => {
  const result = await prisma.driver.findMany({
    include: {
      userInfo: true,
      car: { include: { carDocument: true } },
      document: true,
      totalJobs: true,
      packages: true,
    },
  });

  return result;
};

export const findDriver = async (id) => {
  const result = await prisma.driver.findUnique({
    where: { id },
    include: {
      userInfo: {
        include: {
          wallet: true,
        },
      },
      car: { include: { carDocument: true } },
      packages: true,
      document: true,
      totalJobs: true,
    },
  });

  return result;
};
export const findDriverByUserId = async (userId) => {
  const result = await prisma.driver.findUnique({
    where: { userId },
    include: {
      userInfo: true,
      car: { include: { carDocument: true } },
      packages: true,

      document: true,
      totalJobs: true,
    },
  });

  return result;
};

export const createDriver = async (data, userId, fileName) => {
  const tempData = { ...data };
  delete tempData.firstName;
  delete tempData.lastName;
  delete tempData.email;
  delete tempData.password;
  delete tempData.phone_number;
  delete tempData.profileImage;

  const result = await prisma.driver.create({
    data: {
      ...tempData,
      userId,
      profileImage: fileName,
      depositePaid: Boolean(tempData?.depositePaid),
      ratings: tempData.ratings ? Number(tempData.ratings) : 0,
      totalJobComplete: tempData.totalJobComplete
        ? Number(tempData.totalJobComplete)
        : 0,
      depositeAmount: tempData.depositeAmount
        ? Number(tempData.depositeAmount)
        : 0,
      commision: tempData.commision ? Number(tempData.commision) : 0,
      currentBalance: tempData.currentBalance
        ? Number(tempData.currentBalance)
        : 0,
      driverRecognitionNumber: `${uuid()}`,
    },
  });

  return result;
};

export const updateDriver = async (id, data, prevData, fileName) => {
  const tempData = { ...data };
  delete tempData?.firstName;
  delete tempData?.lastName;
  delete tempData?.phone_number;
  delete tempData?.emailAddress;
  delete tempData?.password;

  const result = await prisma.driver.update({
    where: { id },
    data: {
      ...tempData,
      profileImage: fileName ? fileName : prevData.profileImage,
      depositePaid: tempData.depositePaid
        ? Boolean(tempData?.depositePaid)
        : prevData.depositePaid,
      ratings: tempData.ratings ? Number(tempData.ratings) : prevData.ratings,
      totalJobComplete: tempData.totalJobComplete
        ? Number(tempData.totalJobComplete)
        : prevData.totalJobComplete,
      depositeAmount: tempData.depositeAmount
        ? Number(tempData.depositeAmount)
        : prevData.depositeAmount,
      commisionPercentage: tempData.commisionPercentage
        ? Number(tempData.commisionPercentage)
        : prevData.commisionPercentage,
    },
  });

  if (fileName && prevData.profileImage) {
    await remove({ key: prevData.profileImage });
  }

  return result;
};

export const deleteDriver = async (id) => {
  const result = await prisma.driver.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
  return result;
};

// update legal information

export const updateDocumentLegalInfo = async (id, data) => {
  const result = await prisma.Document.update({
    where: { id },
    data: { ...data },
  });
  return result;
};
export const updateCarDocumentLegalInfo = async (carId, data) => {
  const result = await prisma.CarDocument.update({
    where: { carId },
    data,
  });
  return result;
};

// Driver Document
export const createDocument = async (data, fieldsToExtract, driverId) => {
  const tempData = { ...data };
  const extractedFields = fieldsExtracter(data, fieldsToExtract);

  for (const field in extractedFields) {
    const fileName = await ImageUploadHelper(tempData[field]);
    tempData[field] = fileName;
  }
  const result = await prisma.Document.create({
    data: { ...tempData, driverId },
  });

  return result;
};

export const updateDocument = async (data, driverId) => {
  for (const field in data) {
    const fileName = await ImageUploadHelper(data[field]);
    data[field] = fileName;
  }

  const result = await prisma.Document.update({
    where: { driverId },
    data,
  });
  return result;
};

export const findDriverDocument = async (driverId) => {
  const result = await prisma.Document.findUnique({
    where: { driverId },
  });
  return result;
};

// Cars
export const findDriverCar = async (driverId) => {
  const result = await prisma.car.findUnique({
    include: { carDocument: true },
    where: { driverId },
  });

  return result;
};

export const findCar = async (id) => {
  const result = await prisma.car.findUnique({
    include: { carDocument: true },
    where: { id },
  });

  return result;
};

export const createCar = async (data, fileName, driverId) => {
  const result = await prisma.car.create({
    data: {
      ...data,
      driverId,
      carImage: fileName,
    },
  });

  return result;
};

export const updateCar = async (id, data, prevData, fileName) => {
  const tempData = { ...data };

  const result = await prisma.car.update({
    where: { id },
    data: {
      ...tempData,
      carImage: fileName ? fileName : prevData.carImage,
    },
  });

  if (fileName && prevData.carImage) {
    await remove({ key: prevData.carImage });
  }

  return result;
};

export const findCarDocument = async (carId) => {
  const result = await prisma.CarDocument.findUnique({ where: { carId } });

  return result;
};

export const createCarDocument = async (data, fieldsToExtract, carId) => {
  const tempData = { ...data };
  const extractedFields = fieldsExtracter(data, fieldsToExtract);

  for (const field in extractedFields) {
    const fileName = await ImageUploadHelper(tempData[field]);
    tempData[field] = fileName;
  }

  const result = await prisma.CarDocument.create({
    data: { ...tempData, carId },
  });

  return result;
};

export const updateCarDocument = async (data, carId) => {
  const tempData = { ...data };

  for (const field in tempData) {
    const fileName = await ImageUploadHelper(tempData[field]);
    tempData[field] = fileName;
  }

  const result = await prisma.CarDocument.update({
    where: { carId },
    data: tempData,
  });

  return result;
};
