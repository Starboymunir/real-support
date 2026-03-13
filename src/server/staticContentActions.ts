
"use server";
import prisma from '@/database/prisma';
import { ContentType, StaticContent } from "@prisma/client";

export const fetchContentByType = async (type: ContentType) => {
  try{
    const content:StaticContent | null = await prisma.staticContent.findUnique({where: {contentType: type}});
    return content;
  }catch(err){
    return null
  }
};
