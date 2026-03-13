import prisma from "@/database/prisma";
import bcrypt from "bcrypt";

export const checkUser = async (email, phone_number, cognitoUserName) => {
  const user = await prisma.User.findUnique({
    where: {
      OR: [{ emailAddress: email }, { phone_number }, { cognitoUserName }],
    },
  });
  return user;
};

export const checkUserByEmail = async (email) => {
  const user = await prisma.User.findUnique({
    where: {
      emailAddress: email,
    },
    include: {
      driver: {
        include: {
          document: true,
        },
      },
      passenger: true,
    },
  });
  return user;
};

export const checkUserByPhone = async (phone_number) => {
  const user = await prisma.User.findUnique({
    where: {
      phone_number,
    },
  });
  return user;
};

export const checkUserByCognito = async (cognitoUserName) => {
  const user = await prisma.User.findUnique({
    where: {
      cognitoUserName,
    },
    include: {
      driver: {
        include: {
          document: true,
        },
      },
      passenger: true,
    },
  });
  return user;
};

export const findUser = async (id) => {
  const user = await prisma.User.findUnique({
    where: {
      id,
    },
  });
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await prisma.User.findUnique({
    where: {
      emailAddress: email,
    },
    include: {
      driver: {
        include: {
          document: true,
        },
      },
      passenger: true,
    },
  });
  return user;
};

export const createUser = async (
  firstName,
  lastName,
  email,
  password,
  phone_number
) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.User.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone_number,
    },
  });

  return user;
};

export const updateUser = async (id, data) => {
  const result = await prisma.User.update({
    where: { id },
    data,
  });
  return result;
};
