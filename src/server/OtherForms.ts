"use server";

import prisma from "@/database/prisma";
import { ContactUs, ContactUsStatus } from "@prisma/client";

type CreateContactUsInput = {
  formValues: {
    name: string;
    email: string;
    phone_number: string;
    reason: string;
    remarks
    
    : string;
  };
  userId: string;
};

export const createContactUs = async ({
  formValues,
  userId,
}: CreateContactUsInput): Promise<ContactUs> => {
  try {
    const contactUs = await prisma.contactUs.create({
      data: {
        ...formValues,
        status: ContactUsStatus.PENDING, // Default status
        userId,
      },
    });

    return contactUs;
  } catch (error) {
    console.error("Error creating contact us:", error);
    throw new Error("Unable to create contact us");
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllContactUs = async (): Promise<ContactUs[]> => {
  try {
    const contactUs = await prisma.contactUs.findMany();
    console.log("Get all contact us", contactUs);
    return contactUs;
  } catch (error) {
    console.error("Error getting contact us:", error);
    throw new Error("Unable to get contact us");
  } finally {
    await prisma.$disconnect();
  }
};

export const getContactUsById = async (
  id: string
): Promise<ContactUs | null> => {
  try {
    const contactUs = await prisma.contactUs.findUnique({
      where: {
        id,
      },
    });

    return contactUs;
  } catch (error) {
    console.error("Error getting contact us:", error);
    throw new Error("Unable to get contact us");
  } finally {
    await prisma.$disconnect();
  }
};

export const updateContactUsById = async (
  id: string,
  name: string,
  email: string,
  phone_number: string,
  reason: string,
  remarks: string,
  status: ContactUsStatus
): Promise<ContactUs> => {
  try {
    const contactUs = await prisma.contactUs.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone_number,
        reason,
        status,
      },
    });
    return contactUs;
  } catch (error) {
    console.error("Error updating contact us:", error);
    throw new Error("Unable to update contact us");
  } finally {
    await prisma.$disconnect();
  }
};
