import prisma from '@/database/prisma';
import { User } from "@prisma/client";

export const checkUser = async (
  emailAddress: string | null,
  phone_number: string | null,
  cognitoId: string | null
): Promise<User | null> => {
  if (emailAddress) {
    const userByEmail = await prisma.user.findUnique({
      where: { emailAddress },
    });

    if (userByEmail) {
      return userByEmail;
    }
  }

  if (phone_number) {
    const userByPhone = await prisma.user.findFirst({
      where: { phone_number },
    });

    if (userByPhone) {
      return userByPhone;
    }
  }

  if (cognitoId) {
    const userByCognitoId = await prisma.user.findUnique({
      where: { cognitoId },
    });

    return userByCognitoId;
  }
  return null;
};

// export const createUser = async (userData: User): Promise<User> => {
//   const { firstName, lastName, emailAddress, phone_number, cognitoId } =
//     userData || {};
//   const user = await prisma.user.create({
//     data: {
//       firstName,
//       lastName,
//       emailAddress,
//       phone_number,
//       cognitoId,
//     },
//   });
//   return user;
// };

export const findUser = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (
  id: string,
  data: Partial<User>
): Promise<User> => {
  const result = await prisma.user.update({
    where: { id },
    data: {
      ...data,
    },
  });
  return result;
};
