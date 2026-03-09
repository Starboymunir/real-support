"use server";

import { uploadFile as ImageUploadHelper } from "@/app/api/helpers/imageUpload";
import { convertFormData } from "@/app/api/utils/convertFormData";
import prisma from "@/database/prisma";

const driverDocumentApprovalOrRejection = async (
  driverId,
  documentType,
  approve
) => {
  try {
    const findDocument = await prisma.document.findFirst({
      where: { driverId },
    });

    if (!findDocument) {
      throw { message: "Document not found." };
    }
    const result = await prisma.document.update({
      where: { driverId },
      data: {
        [documentType]: {
          ...findDocument[documentType],
          details: {
            isVerified: approve,
            isReturned: !approve ? true : false,
            status: approve ? "Approved" : "Rejected",
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw { message: error.message };
  }
};
const updateLegalInfo = async (id, data) => {
  try {
    const findDocument = await prisma.document.findFirst({
      where: { id },
    });

    if (!findDocument) {
      return { message: "Document not found.", statusCode: 400 };
    }

    delete findDocument?.id;
    const result = await prisma.document.update({
      where: { id },
      data: {
        ...findDocument,
        drivingLicense: {
          ...findDocument?.drivingLicense,
          LicenseNumber: data?.LicenseNumber,
          LicenseExpiryDate: data?.LicenseExpiryDate,
        },
        bankDocuments: {
          ...findDocument?.bankDocuments,
          sortCode: data?.sortCode,
          accountNumber: data?.accountNumber,
          bankName: data?.bankName,
        },
        pcoDocuments: {
          ...findDocument?.pcoDocuments,
          pcoBadgeNumber: data?.pcoBadgeNumber,
          pcoBadgeExpiryDate: data?.pcoBadgeExpiryDate,
        },
        passport: {
          ...findDocument?.passport,
          passportNumber: data?.passportNumber,
          passportExpiryDate: data?.passportExpiryDate,
        },
        addressProfDocs: {
          ...findDocument?.addressProfDocs,
          houseNumber: data?.houseNumber,
          state: data?.state,
          addressCode: data?.addressCode,
          streetAddress: data?.streetAddress,
          city: data?.city,
        },
        workPermitCode: data?.workPermitCode,
      },
    });
    return {
      statusCode: 200,
      data: result,
      message: "Legal Info Updated Successfully.",
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: error.message };
  }
};
const updateCarLegalInfo = async (id, data) => {
  try {
    const findDocument = await prisma.carDocument.findFirst({
      where: { id },
    });

    if (!findDocument) {
      return { message: "Document not found.", statusCode: 400 };
    }

    delete findDocument?.id;
    const result = await prisma.carDocument.update({
      where: { id },
      data: {
        ...findDocument,
        motDocument: {
          ...findDocument?.motDocument,
          motPassDate: data?.motPassDate,
        },
        insuranceDocument: {
          ...findDocument?.insuranceDocument,
          insuranceExpiryDate: data?.insuranceExpiryDate,
        },
        pCOVehicleLicense: {
          ...findDocument?.pCOVehicleLicense,
          pcoVehicleLicenseExpiryDate: data?.pcoVehicleLicenseExpiryDate,
        },
      },
    });
    return {
      statusCode: 200,
      data: result,
      message: "Car Legal Info Updated Successfully.",
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: error.message };
  }
};
const carDocumentApprovalOrRejection = async (id, documentType, approve) => {
  try {
    const findDocument = await prisma.CarDocument.findFirst({
      where: { id },
    });

    if (!findDocument) {
      throw { message: "Document not found." };
    }
    const result = await prisma.CarDocument.update({
      where: { id },
      data: {
        [documentType]: {
          ...findDocument[documentType],
          details: {
            isVerified: approve,
            isReturned: !approve ? true : false,
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw { message: error.message };
  }
};

const EditCarDocument = async (id, documentType, data) => {
  console.log("data in Edit Car ", data);
  // const tempData = convertFormData(data)
  try {
    const findDocument = await prisma.CarDocument.findFirst({
      where: { id },
    });
    if (!findDocument) {
      throw { message: "Document not found." };
    }
    for (i in tempData) {
      const fileKey = tempData[i] ? await ImageUploadHelper(tempData[i]) : null;
      tempData[i] = fileKey;
    }

    const result = await prisma.CarDocument.update({
      where: { id },
      data: {
        [documentType]: {
          ...tempData,
        },
      },
    });
    return result;
  } catch (error) {
    throw { message: error.message };
  }
};

export {
  driverDocumentApprovalOrRejection,
  carDocumentApprovalOrRejection,
  EditCarDocument,
  updateLegalInfo,
  updateCarLegalInfo,
};
