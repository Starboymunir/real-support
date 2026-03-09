"use server";

import prisma from "@/database/prisma";
import { Driver } from "@prisma/client";

export const getDrivers = async (): Promise<Driver[]> => {
  const drivers = await prisma.driver.findMany({
    include: {
      userInfo: true,
    },
  });
  return drivers;
};

export const getDriverById = async (id: string): Promise<Driver | null> => {
  const driver = await prisma.driver.findUnique({
    where: {
      id,
    },
    include: {
      userInfo: true,
      car: true,
      document: true,
    },
  });
  return driver;
};