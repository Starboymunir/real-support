import prisma from "@/database/prisma";
import { remove } from "aws-amplify/storage";

export const createPackage = async (data) => {
  const packages = await prisma.package.create({
    data: {
      ...data,
      sortIndex: Number(data.sortIndex),
      serviceFee: Number(data.serviceFee),
      pricePerMilage: Number(data.pricePerMilage),
      drivingProMin: Number(data.drivingProMin),
      waitingProMin: Number(data.waitingProMin),
      minBill: Number(data.minBill),
      vat: Number(data.vat),
    },
  });

  console.log('packages', packages);
  return packages;
};

export const findAllPackages = async () => {
  const result = await prisma.package.findMany();
  return result;
};

export const findPackage = async (id) => {
  const result = await prisma.package.findUnique({
    where: { id },
  });

  return result;
};

export const findPackageByName = async (name) => {
  const result = await prisma.package.findUnique({
    where: { name },
  });

  return result;
};

export const updatePackage = async (id, data, prevData) => {
  const packages = await prisma.package.update({
    where: { id },
    data: {
      ...data,
      coverImage: data.coverImage ? data.coverImage : prevData.coverImage,
      sortIndex: data?.sortIndex ? Number(data.sortIndex) : prevData.sortIndex,
      serviceFee: data?.serviceFee
        ? Number(data.serviceFee)
        : prevData.serviceFee,
      pricePerMilage: data?.pricePerMilage
        ? Number(data.pricePerMilage)
        : prevData.pricePerMilage,
      drivingProMin: data?.drivingProMin
        ? Number(data.drivingProMin)
        : prevData.drivingProMin,
      waitingProMin: data?.waitingProMin
        ? Number(data.waitingProMin)
        : prevData.waitingProMin,
      minBill: data?.minBill ? Number(data.minBill) : prevData.minBill,
      vat: data?.vat ? Number(data.vat) : prevData.vat,
    },
  });

  // if (data.coverImage && prevData.coverImage) {
  //   await remove({ key: prevData.coverImage });
  // }
  return packages;
};

export const deletePackage = async (id) => {
  const packages = await prisma.package.update({
    where: { id },
    data: {
      status: false,
    },
  });

  return packages;
};
