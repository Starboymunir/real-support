import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import { uploadFile } from "@/app/(webpage)/chat/chatApi";
import image from "@/app/(RSAdmin)/admin/common/image";
import axiosInstance from "../axios";
Amplify.configure(awsconfig);

function getTitleFromChat(chat: any, currentUserId: string) {
  if (chat.bookingId) return chat.bookingId;

  const person = chat.participants.find(
    (x: any) => x.userId !== currentUserId
  )?.user;

  if (person) {
    return `${person?.firstName} ${person?.lastName}`;
  }

  return `Admin`;

  // if (chat.isAdminChat) {
  //   return `Admin`;
  // }
}

function getImageFromChat(chat: any, currentUserId: string) {
  // if (chat.bookingId) return chat.bookingId;
  if (chat.bookingId) return null;

  const person = chat.participants.find(
    (x: any) => x.userId !== currentUserId
  )?.user;

  if (person) {
    return person.coverImage;
  }

  return null;

  // if (chat.isAdminChat) {
  //   return `Admin`;
  // }
}

export function getChatWithTitle(chat: any, currentUserId: string) {  
  return {
    ...chat,
    title: getTitleFromChat(chat, currentUserId),
    image: getImageFromChat(chat, currentUserId),
  };
}

export const getChatList = async (
  currentUserId: string,
  getAdminList = false
) => {
  const res = await axiosInstance.get(`/chat?getAdminList=${getAdminList}`);
  return res.data.data.map((x: any) => {
    return getChatWithTitle(x, currentUserId);
  });
};

export const getChatWithMessage = async (
  chatId: string,
  currentUserId: string
) => {
  const res = await axiosInstance.get(`/chat/${chatId}`);
  return getChatWithTitle(res.data.data, currentUserId);
};

export const getChatIdFromParticipantId = async (participantId: string) => {
  const res = await axiosInstance.get(`/chat/one-on-one/${participantId}`);
  return res.data.data?.id || null;
};

export const getChatIdFromBookingId = async (bookingId: string) => {
  const res = await axiosInstance.get(`/chat/booking/${bookingId}`);
  return res.data.data?.id || null;
};
export const getChatIdFromAdmin = async (userId: string | null = null) => {
  let url = `/chat/one-on-one-admin`;
  if (!!userId) {
    url = url + `?userId=${userId}`;
  }
  const res = await axiosInstance.get(url);
  return res.data.data?.id || null;
};

export const sendChatMessage = async (
  chatId: string,
  content: string,
  image: File | null = null
) => {
  let attachments: string[] = [];
  if (!!image) {
    const imageKey = await uploadFile(image);
    if (imageKey) attachments = [imageKey];
  }
  const res = await axiosInstance.post(`/chat/${chatId}`, {
    content,
    attachments,
  });
  return res.data.data;
};

export const deleteChat = async (chatId: string) => {
  if (chatId) {
    const res = await axiosInstance.delete(`/chat/${chatId}`);
    return res.data.data;
  }
};

export const updateLastReadAt = async (chatId: string) => {
  if (chatId) {
    const res = await axiosInstance.post(`/chat/${chatId}/read`);
    return res.data.data;
  }
};

export const getUnreadCountByChatId = async (chatId: string) => {
  if (chatId) {
    const res = await axiosInstance.get(`/chat/${chatId}/read`);
    return res.data.data;
  }
};

export const getUnreadChatCount = async () => {
  const res = await axiosInstance.get(`/chat/unread-count`);
  return res.data.data || 0;
};
