"use server";

import prisma from "@/database/prisma";
import { CarStatus, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const checkDriverDocuments = async (driverId: string) => {
  const documents = await prisma.document.findUnique({ where: { driverId } });
  const drivingLicense = documents?.drivingLicense?.details?.isVerified;
  const bankDocuments = documents?.bankDocuments?.details?.isVerified;
  const pcoDocuments = documents?.pcoDocuments?.details?.isVerified;
  const passport = documents?.passport?.details?.isVerified;
  const addressProfDocs = documents?.addressProfDocs?.details?.isVerified;

  return (
    drivingLicense &&
    bankDocuments &&
    pcoDocuments &&
    passport &&
    addressProfDocs
  );
};
const checkCarDocuments = async (carId: string) => {
  const documents = await prisma.carDocument.findUnique({ where: { carId } });
  const motDocument = documents?.motDocument?.details?.isVerified;
  const insuranceDocument = documents?.insuranceDocument?.details?.isVerified;
  const pCOVehicleLicense = documents?.pCOVehicleLicense?.details?.isVerified;
  const vehicleLogBook = documents?.vehicleLogBook?.details?.isVerified;

  return (
    motDocument && insuranceDocument && pCOVehicleLicense && vehicleLogBook
  );
};

const changeStatusDriver = async (id: string, status: UserStatus) => {
  try {
    const result = await prisma.driver.findUnique({
      where: { id },
    });
    if (!result) {
      return { message: "driver not found", statusCode: 400 };
    }

    if (status == "ACTIVE") {
      const driverDocument = await checkDriverDocuments(id);

      const driverCar = await prisma.car.findFirst({
        where: { driverId: id, status: "ACTIVE" },
      });

      if (!driverDocument) {
        return { message: "driver document is un verified.", statusCode: 400 };
      }

      if (!driverCar) {
        return { message: "driver don't have active car.", statusCode: 400 };
      }

      const updatedDriver = await prisma.driver.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      revalidatePath("/admin/dashboard/drivers/list/");
      return { data: updatedDriver, statusCode: 200 };
    } else {
      const updatedDriver = await prisma.driver.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      revalidatePath("/admin/dashboard/drivers/list/");
      return { data: updatedDriver, statusCode: 200 };
    }
  } catch (error: any) {
    return { message: error.message, statusCode: 400 };
  }
};

const getAllOnlineDrivers = async (packageId: string) => {
  const whereCondition: { isOnline: boolean; status: UserStatus } = {
    isOnline: true,
    status: "ACTIVE",
  };
  if (packageId) {
    // todo fix this
    // whereCondition.packageId = packageId;
  }
  console.log(" where condition", whereCondition);
  const result = await prisma.driver.findMany({
    where: whereCondition,
    include: { userInfo: true },
  });
  return result;
};

const changeCarStatus = async (id: string, status: CarStatus) => {
  try {
    const result = await prisma.car.findUnique({
      where: { id },
    });
    if (!result) {
      return { message: "car not found", statusCode: 400 };
    }
    if (status == "ACTIVE") {
      const carDocument = await checkCarDocuments(id);
      if (!carDocument) {
        return { message: "car document is un verified.", statusCode: 400 };
      }
      const updatedCar = await prisma.car.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      return { data: updatedCar, statusCode: 200 };
    } else {
      const updatedCar = await prisma.car.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return { data: updatedCar, statusCode: 200 };
    }
  } catch (error: any) {
    return { message: error.message, statusCode: 400 };
  }
};

const assignPackageDriver = async (id: string, packageId: string) => {
  const updatedDriver = await prisma.driver.update({
    where: {
      id,
    },
    data: {
      packageIDs: [packageId],
    },
  });
  return updatedDriver;
};

const assignPackages = async (id: string, data: { packages: string[] }) => {
  try {
    const { packages } = data;

    // Ensure packages is always an array
    const packageIdsToAdd = Array.isArray(packages) ? packages : [packages];

    // Fetch current packages assigned to the driver
    const currentDriver = await prisma.driver.findUnique({
      where: {
        id: id,
      },
      select: {
        packageIDs: true, // Only fetch assigned package IDs
      },
    });

    if (!currentDriver) {
      throw new Error(`Driver with ID ${id} not found.`);
    }

    // Extract existing package IDs from the current driver object
    const currentPackageIds = currentDriver.packageIDs.map((pkg: string) => pkg);

    // Combine new packages with existing ones, ensuring no duplicates
    const updatedPackageIds = Array.from(
      new Set([...currentPackageIds, ...packageIdsToAdd])
    );

    // Update the driver with the merged list of package IDs
    const updatedDriver = await prisma.driver.update({
      where: {
        id: id,
      },
      data: {
        packageIDs: {
          set: updatedPackageIds,
        },
      },
    });

    return updatedDriver;
  } catch (error) {
    console.error("Error assigning packages to driver:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const removePackages = async (driverId: any, packagesToRemove: Iterable<any> | null | undefined) => {
  try {
    // Ensure packagesToRemove is always an array
    const packageIdsToRemove = Array.isArray(packagesToRemove)
      ? new Set(packagesToRemove)
      : new Set([packagesToRemove]);

    // Fetch current package IDs assigned to the driver
    const currentDriver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
      select: {
        packageIDs: true,
      },
    });

    if (!currentDriver) {
      throw new Error(`Driver with ID ${driverId} not found.`);
    }

    // Extract existing package IDs from the current driver object
    const currentPackageIds = currentDriver.packageIDs.map((pkgId: string) => pkgId);

    // Calculate updated package IDs by filtering out the packages to remove
    const updatedPackageIds = currentPackageIds.filter(
      (pkgId: any) => !packageIdsToRemove.has(pkgId)
    );

    // Update the driver with the updated list of package IDs
    const updatedDriver = await prisma.driver.update({
      where: {
        id: driverId,
      },
      data: {
        packageIDs: {
          set: updatedPackageIds,
        },
      },
    });

    return updatedDriver;
  } catch (error) {
    console.error("Error removing packages from driver:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

async function getDriverStats(startDate: null, endDate: null, hardFilter: string) {
  // Retrieve all drivers
  const drivers = await prisma.driver.findMany({
    include: {
      userInfo: true,
    },
  });
  let dateRangeFilter: { createdAt?: { gte?: Date; lt?: Date } } = {};

  // Prepare filtering conditions for the date range
  if (startDate !== null && endDate !== null) {
    dateRangeFilter.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  } else if (startDate !== null) {
    dateRangeFilter.createdAt = {
      gte: startDate,
    };
  } else if (endDate !== null) {
    dateRangeFilter.createdAt = {
      lt: endDate,
    };
  }

  // Prepare filtering conditions based on the hardFilter
  let hardFilterConditions: {createdAt?: { gte?: Date; lt?: Date }} = {};
  if (hardFilter === "today") {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    hardFilterConditions.createdAt = {
      gte: startOfToday,
      lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    };
  } else if (hardFilter === "monthly") {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    hardFilterConditions.createdAt = {
      gte: startOfThisMonth,
      lt: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    };
  } else if (hardFilter === "yearly") {
    const today = new Date();
    let startOfThisYear;
    if (
      today.getMonth() < 3 ||
      (today.getMonth() === 3 && today.getDate() < 6)
    ) {
      startOfThisYear = new Date(today.getFullYear() - 1, 3, 6);
    } else {
      startOfThisYear = new Date(today.getFullYear(), 3, 6);
    }
    hardFilterConditions.createdAt = {
      gte: startOfThisYear,
      lt: new Date(startOfThisYear.getFullYear() + 1, 3, 6),
    };
  }

  // Apply strict filtering based on the hardFilter
  if (hardFilterConditions.createdAt) {
    dateRangeFilter = hardFilterConditions;
  }

  console.log(hardFilterConditions);

  // Iterate over each driver
  const driverStats = await Promise.all(
    drivers.map(async (driver) => {
      // Retrieve bookings for the driver within the specified date range
      const bookings = await prisma.booking.findMany({
        where: {
          driverId: driver.id,
          status: "COMPLETED",
          ...dateRangeFilter,
        },
      });
      console.log("Booking :", bookings);

      // Calculate statistics for the driver
      const totalJobs = bookings.length;
      const totalValue = bookings.reduce(
        (total, booking) => total + booking.totalBill,
        0
      );
      const cardPay = bookings.reduce(
        (total, booking) =>
          total +
          (booking.paymentType === "CASH" ? booking.totalBill : 0) +
          (booking.paymentType === "WALLET" ? booking.totalBill : 0),
        0
      );
      const cashPay = bookings.reduce(
        (total, booking) =>
          total + (booking.paymentType === "CASH" ? booking.totalBill : 0),
        0
      );
      // const tip = bookings.reduce(
      //   (total, booking) => total + (booking.tip || 0),
      //   0
      // );
      const tip = 0;

      const commission = bookings.reduce(
        (total, booking) => total + (booking.commission || 0),
        0
      );
      const totalAfterCommission = totalValue - commission;

      return {
        driverId: driver.id,
        driverName: driver,
        totalJobs,
        totalValue,
        cardPay,
        cashPay,
        tip,
        commission,
        totalAfterCommission,
      };
    })
  );

  return { data: driverStats };
}

export {
  changeStatusDriver,
  changeCarStatus,
  getAllOnlineDrivers,
  assignPackageDriver,
  assignPackages,
  removePackages,
  getDriverStats,
};
