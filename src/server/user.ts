"use server";

import { IUser } from './../types/type';
import prisma from "@/database/prisma";
import { getWallet } from "@/helpers/wallet";
import { BankAccount, SocialProvider, UserAddress } from "@prisma/client";

export const findUserByCognitoId = async (cognitoId: string): Promise<IUser | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      include: {
        driver: true,
        Admin: true,
        addressInfo: true,
        SocialLink: true,
      },
    });

    return user as IUser;
  } catch (error) {
    console.error("Database Error:", error);
    return null
  }
};



export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        bookings: true,
        driver: true,
        SocialLink: true,
        bankAccounts: true,
        addressInfo: true,
      },
    });
    return user;
  } catch (error: any) {
    throw { message: error.message };
  }
};

export const getUser = async (input: string) => {
  try {
    const userByEmail = await prisma.user.findUnique({
      where: {
        emailAddress: input,
      },
    });

    if (userByEmail) {
      return userByEmail;
    }

    const userByPhone = await prisma.user.findFirst({
      where: {
        phone_number: input,
      },
    });

    return userByPhone;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
};

export const checkPhoneUnique = async (phone: string) => {
  const userByPhone = await prisma.user.findFirst({
    where: {
      phone_number: phone,
    },
  });

  return userByPhone;
};

export const getUserWallet = async (userId: string) => {
  try {
    const wallet = getWallet(userId);
    return wallet;
  } catch (err) {
    console.log(err);
    return null;
  }
};
export const getDriverWallet = async (userId: string) => {
  try {
    const wallet = getWallet(userId);
    return wallet;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function createAddress(
  data: Pick<
    UserAddress,
    | "houseNumber"
    | "city"
    | "country"
    | "postalCode"
    | "state"
    | "isDefault"
    | "streetName"
  >,
  userId: string
) {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Throw an error if no user data is found
    if (!user) throw new Error("Missing user data.");
    // Perform the transaction
    const newAddress = await prisma.$transaction([
      // If isDefault is true, update all other addresses to non-default
      ...(!data.isDefault
        ? []
        : [
          prisma.userAddress.updateMany({
            where: { user: { id: user.id } },
            data: { isDefault: false },
          }),
        ]),

      // Create the new address
      prisma.userAddress.create({
        data: {
          user: { connect: { id: user.id } },
          streetName: data.streetName,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
          state: data.state,
          isDefault: data.isDefault ?? false, // Ensure default is false if not set
          houseNumber: data.houseNumber,
        },
      }),
    ]);

    // Optional: Log the activity (if required)
    // setImmediate(() => {
    //   saveActivity({
    //     userId: user.userId,
    //     prisma: client,
    //     activity: "Address",
    //     by: "user",
    //     subSection: "Create",
    //     details: "User created a new address.",
    //   });
    // });
    return newAddress;
  } catch (error) {
    console.error("Error creating address: ", error);
    throw new Error("Failed to create the address. Please try again.");
  }
}

export async function updateAddress(
  data: Pick<
    UserAddress,
    | "houseNumber"
    | "streetName"
    | "city"
    | "postalCode"
    | "country"
    | "state"
    | "isDefault"
    | "id"
    | "userId"
  >
) {
  // Fetch user data from the database
  const user = await prisma.user.findFirst({
    where: { id: data.userId },
  });

  if (!user) throw new Error("User not found.");

  // Start transaction
  const result = await prisma.$transaction([
    // If isDefault is true, mark all other addresses of the user as non-default
    ...(!data.isDefault
      ? []
      : [
        prisma.userAddress.updateMany({
          where: {
            userId: data.userId,
            isDefault: true, // Ensure we only update the addresses marked as default
          },
          data: { isDefault: false },
        }),
      ]),

    // Update the specific address
    prisma.userAddress.update({
      where: {
        id: data.id,
        userId: data.userId, // Use userId directly here
      },
      data: {
        streetName: data.streetName,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        state: data.state,
        isDefault: data.isDefault,
        houseNumber: data.houseNumber,
      },
    }),
  ]);

  return result;
}

export async function getAddress(
  userId: string,
  id: string
): Promise<UserAddress> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found.");

  const address = await prisma.userAddress.findUnique({
    where: { id, userId: user!.id },
  });

  if (!address) throw new Error("Address not found.");

  prisma.$disconnect();

  return address;
}

export async function getAccount(
  userId: string,
  id: string
): Promise<BankAccount | null> {

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found.");

  const account = await prisma.bankAccount.findUnique({
    where: { id, userId },
  });

  if (!account) throw new Error("Account not found.");

  prisma.$disconnect();

  return account ;
}

export async function deleteAddress(id: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found.");
    await prisma.userAddress.delete({
      where: { id },
    });
    // setImmediate(() => {
    //   saveActivity({
    //     userId: user.userId,
    //     prisma: client,
    //     activity: "Address",
    //     by: "user",
    //     subSection: "Delete",
    //     details: "User deleted an address.",
    //   });
    // });
  } catch (error) {
    console.log(error);
  }
}

export async function createSocialMediaLink(
  provider: SocialProvider,
  url: string,
  userId: string
) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found.");

    await prisma.socialLink.create({
      data: {
        user: { connect: { id: user.id } },
        type: provider,
        link: url,
      },
    });
  } catch (error) {
    console.error("Error creating social link: ", error);
    throw new Error("Failed to create the social link. Please try again.");
  }
}

export async function deleteSocialMediaLink(id: string, userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found.");

    await prisma.socialLink.delete({
      where: { id, userId: user.id },
    });
  } catch (error) {
    console.log(error);
  }
}
