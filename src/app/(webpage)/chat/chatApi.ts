import { fetchAuthSession } from "aws-amplify/auth";
import axios from "axios";
import type { InternalAxiosRequestConfig  } from 'axios';
import { v4 as uuid } from "uuid";
import { getUrl, uploadData } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
Amplify.configure(awsconfig);

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      const token = session?.tokens?.idToken?.toString();

      if (token) {
        if (config.headers && typeof config.headers.set === 'function') {
          // If headers is an instance of AxiosHeaders, use set method
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          // If headers is not AxiosHeaders, manually spread the headers safely
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          } as typeof config.headers; // Ensure headers match AxiosHeaders type
        }
      }

      return config;
    } catch (error) {
      console.error('Error fetching auth session:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);


function getTitleFromChat(chat: any, currentUserId: string) {
  let title = chat.bookingId;

  if (chat.bookingId == null) {
    const person = chat.participants.find(
      (x: any) => x.userId !== currentUserId
    )?.user;
    title = `${person?.firstName} ${person?.lastName}`;
  }
  return title;
}

export function getChatWithTitle(chat: any, currentUserId: string) {
  return { ...chat, title: getTitleFromChat(chat, currentUserId) };
}

export const getAllChats = async (currentUserId: any) => {
  const res = await axiosInstance.get("/api/chat");
  return res.data.data.map((x: any) => {
    return getChatWithTitle(x, currentUserId);
  });
};

export const getChatWithMessage = async (
  chatId: string,
  currentUserId: string
) => {
  const res = await axiosInstance.get(`/api/chat/${chatId}`);

  return getChatWithTitle(res.data.data, currentUserId);
};

export const getChatIdByParticipantId = async (participantId: string) => {
  const res = await axiosInstance.get(`/api/chat/one-on-one/${participantId}`);
  console.log(res.data.data);
  return res.data.data?.id || null;
};

export const getChatIdByBookingId = async (bookingId: string) => {
  const res = await axiosInstance.get(`/api/chat/booking/${bookingId}`);
  console.log(res.data.data);
  return res.data.data?.id || null;
};

export const sendMessage = async (
  chatId: string,
  content: string,
  image: File | null = null
) => {
  let attachments: string[] = [];
  if (!!image) {
    const imageKey = await uploadFile(image);
    if (imageKey) attachments = [imageKey];
  }
  const res = await axiosInstance.post(`/api/chat/${chatId}`, {
    content,
    attachments,
  });
  return res.data.data;
};

export const deleteChat = async (chatId: string) => {
  if (chatId) {
    const res = await axiosInstance.delete(`/api/chat/${chatId}`);
    return res.data.data;
  }
};

export const uploadFile = async (image: File) => {
  if (!image) {
    return null;
  }

  const mimeType = image.type;
  const fileExtension = mimeType ? mimeType.split("/")[1] : null;

  if (!fileExtension) {
    return null;
  }

  const fileName = `${uuid()}.${fileExtension}`;

  try {
    const result = await uploadData({
      key: fileName,
      data: image,
      options: {
        accessLevel: "guest",
        onProgress: ({ transferredBytes, totalBytes }) => {
          if (totalBytes) {
            console.log(
              `Upload progress ${Math.round(
                (transferredBytes / totalBytes) * 100
              )} %`
            );
          }
        },
      },
    }).result;

    return result.key;
  } catch (error) {
    return null;
  }
};
