import { NextResponse } from 'next/server';
import { Driver } from '@prisma/client';
import prisma from '@/database/prisma';

export const findDriverByCognitoId = async (id: string) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        id,
      },
      include: {
        userInfo: true,
        car: { include: { carDocument: true } },
        document: true,
      },
    });

    return driver;
  } catch (err) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: err },
      {
        status: 500,
      }
    );
  }
};


export const findDriverById = async (driverId: string) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
      include: {
        userInfo: true,
        car: { include: { carDocument: true } },
        document: true,
      },
    });

    return driver;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Internal Server Error', error: err },
      {
        status: 500,
      }
    );
  }
};

export const createDriver = async (
  data: Partial<Driver>,
  userId: string,
  user: string
) => {
  try {
    const result = await prisma.driver.create({
      data: {
        dateOfBirth: data.dateOfBirth,
        selfAssessmentTaxId: data.selfAssessmentTaxId as string,
        driverUserId: user,
      },
    });

    return result;
  } catch (error) {
    console.error('[CREATE_DRIVER]', error);
     return new NextResponse('Internal error', { status: 500 });
  }
};
