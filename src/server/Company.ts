"use server"

import prisma from "@/database/prisma";
import { Company, CompanyAddress } from "@prisma/client";

export const fetchCompanies = async () => {
    const result = await prisma.company.findMany({
        include: {
            companyAddress: true,
        },
    });
    return result;
}

export const createCompany = async (company: Company) => {
    const result = await prisma.company.create({
        data: company,
    });
    return result;
}

export const updateCompany = async (company: Company) => {
    const result = await prisma.company.update({
        where: {
            id: company.id,
        },
        data: company,
    });
    return result;
}

export const findCompany = async (id: string) => {
    const result = await prisma.company.findUnique({
        where: {
            id: id,
        },
        include: {
            companyAddress: true,
        },
    });
    return result;
}

export const deleteCompany = async (id: string) => {
    const result = await prisma.company.delete({
        where: {
            id: id,
        },
    });
    return result;
}

export const fetchCompanyAddresses = async (id: string) => {
    const result = await prisma.companyAddress.findMany({
        where: {
            companyId: id,
        },
    });
    return result;
}

export const createCompanyAddress = async (address: CompanyAddress) => {
    const result = await prisma.companyAddress.create({
        data: address,
    });
    return result;
}

export const updateCompanyAddress = async (address: CompanyAddress) => {
    const result = await prisma.companyAddress.update({
        where: {
            id: address.id,
        },
        data: address,
    });
    return result;
}

export const deleteCompanyAddress = async (id: string) => {
    const result = await prisma.companyAddress.delete({
        where: {
            id: id,
        },
    });
    return result;
}

export const findCompanyAddress = async (id: string) => {
    const result = await prisma.companyAddress.findUnique({
        where: {
            id: id,
        },
    });
    return result;
}