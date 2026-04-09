import { apiClient } from "@/lib/ApiClient";

type User = {
  id: string;
  emailAddress: string | null;
  phone_number: string | null;
  cognitoId: string | null;
  [key: string]: any;
};

export const checkUser = async (
  emailAddress: string | null,
  phone_number: string | null,
  cognitoId: string | null
): Promise<User | null> => {
  try {
    if (emailAddress) {
      const res = await apiClient.get<User>(`/users/lookup?email=${encodeURIComponent(emailAddress)}`);
      if (res.data) return res.data;
    }
    if (phone_number) {
      const res = await apiClient.get<User>(`/users/lookup?phone=${encodeURIComponent(phone_number)}`);
      if (res.data) return res.data;
    }
    if (cognitoId && emailAddress) {
      // /users/cognito/ endpoint no longer exists; fall back to email lookup
      const res = await apiClient.get<User>(`/users/lookup?email=${encodeURIComponent(emailAddress)}`);
      if (res.data) return res.data;
    }
    return null;
  } catch {
    return null;
  }
};

export const findUser = async (id: string): Promise<User | null> => {
  try {
    const res = await apiClient.get<User>(`/users/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const updateUser = async (
  id: string,
  data: Partial<User>
): Promise<User> => {
  const res = await apiClient.patch<User>(`/users/info/${id}`, data);
  return res.data;
};
