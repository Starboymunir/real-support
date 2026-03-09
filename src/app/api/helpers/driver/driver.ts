import prisma from '@/database/prisma';
import { fieldsExtracter } from "../../utils/filterFields";
import { uploadFile } from "@/app/api/helpers/imageUpload";
import { convertFormData } from "../../utils/convertFormData";
import {
  Car,
  CarStatus,
  Document,
} from "@prisma/client";
import { remove } from "aws-amplify/storage";

const includeDriverRelations = {
  userInfo: true,
  car: { include: { carDocument: true } },
  document: true,
};

export const findAllDrivers = async () => {
  return await prisma.driver.findMany({ include: includeDriverRelations });
};

export const findDriver = async (id: string) => {
  return await prisma.driver.findUnique({
    where: { id },
    include: includeDriverRelations,
  });
};

export const findDriverByUserId = async (driverUserId: string) => {
  return await prisma.driver.findUnique({
    where: { driverUserId },
    include: includeDriverRelations,
  });
};

// Driver document operations
export const createOrUpdateDocument = async (
  body: FormData,
  documentType: string,
  documentFields: string[],
  fileToExtract: string[]
) => {
  let data: Record<string, string | File | null | undefined> =
    convertFormData(body);

  const { driverId } = data || {};
  const dataPayload: Record<string, string | File | null | undefined> =
    fieldsExtracter(data, documentFields);
  const Files = fieldsExtracter(data, fileToExtract);

  const document: Document | null = await prisma.document.findFirst({
    where: { driverId: driverId as string },
  });

  for (let file in Files) {
    const fileUrl = await uploadFile(data[file] as File);

    dataPayload[file] = fileUrl;

    const documentTypeKey = documentType as keyof typeof document;
    const fileKeyInDocumentType =
    file as keyof (typeof document)[typeof documentTypeKey];

    if (
      document &&
      document[documentTypeKey] &&
      document[documentTypeKey][fileKeyInDocumentType]
    ) {
      await remove({key:document[documentTypeKey][fileKeyInDocumentType]})
    }
  }

  if (!document) {
    return await prisma.document.create({
      data: {
        [documentType]: {
          ...dataPayload,
          details: {
            isSubmitted: true,
            status: "Pending",
          },
        },
        driverId: driverId as string,
      },
    });
  }
  return await prisma.document.update({
    where: { driverId: driverId as string },
    data: {
      [documentType]: {
        ...dataPayload,
        details: {
          isSubmitted: true,
          status: "Pending",
        },
      },
      driverId: driverId as string,
    },
  });
};

// Driver Car document operations
export const createOrUpdateCarDocument = async (
  body: FormData,
  documentType: string,
  documentFields: string[],
  fileToExtract: string[]
) => {
  let data: Partial<Record<string, string | File>> = convertFormData(body);
  const { carId } = data || {};
  const dataPayload: Partial<Record<string, string | File | null>> =
    fieldsExtracter(data, documentFields);
  const Files = fieldsExtracter(data, fileToExtract);
  const carDocument = await prisma.carDocument.findFirst({
    where: { carId: carId as string },
  });


  for (let file in Files) {
    const fileUrl = await uploadFile(data[file] as File);
    dataPayload[file] = fileUrl;
    const documentTypeKey = documentType as keyof typeof carDocument;
    const fileKeyInDocumentType =
    file as keyof (typeof carDocument)[typeof documentTypeKey];

    if (
      carDocument &&
      carDocument[documentTypeKey] &&
      carDocument[documentTypeKey][fileKeyInDocumentType]
    ) {
      await remove({key:carDocument[documentTypeKey][fileKeyInDocumentType]})
    }
  }

  if (!carDocument) {
    return await prisma.carDocument.create({
      data: {
        [documentType]: {
          ...dataPayload,
          details: {
            isSubmitted: true,
            status: "Pending",
          },
        },
        carId: carId as string,
      },
    });
  }
  return await prisma.carDocument.update({
    where: { carId: carId as string },
    data: {
      [documentType]: {
        ...dataPayload,
        details: {
          isSubmitted: true,
          status: "Pending",
        },
      },
      carId: carId as string,
    },
  });
};

export const findDriverDocument = async (driverId: string) => {
  return await prisma.document.findUnique({ where: { driverId } });
};

// Car-related functions
const includeCarRelations = { include: { carDocument: true } };

export const findDriverCar = async (driverId: string) => {
  return await prisma.car.findUnique({
    where: { driverId },
  });
};

export const findCarByNumberPlate = async (numberPlate: string) => {
  return await prisma.car.findUnique({
    where: { numberPlate },
  });
};

export const findCar = async (id: string) => {
  return await prisma.car.findUnique({
    ...includeCarRelations,
    where: { id },
  });
};

export const createCar = async (
  data: {
    color: string;
    carImage: string | null;
    engine: string;
    make: string;
    model: string;
    year: string;
    numberPlate: string;
    driverId: string;
  },
  fileName: string | null | undefined
) => {
  return await prisma.car.create({
    data: {
      ...data,
      carImage: fileName,
    },
  });
};

export const updateCar = async (
  id: string,
  data: {
    color: string | undefined;
    carImage: string | null | undefined;
    engine: string | undefined;
    make: string | undefined;
    model: string | undefined;
    year: string | undefined;
    numberPlate: string | undefined;
    status: CarStatus | undefined;
  }
) => {
  return await prisma.car.update({
    where: { id },
    data,
  });
};

export const findCarDocument = async (carId: string) => {
  return await prisma.carDocument.findUnique({ where: { carId } });
};
