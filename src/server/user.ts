import { api } from "@/lib/api";
import { apiClient } from "@/lib/ApiClient";
import { IUser } from "./../types/type";

export const findUserByCognitoId = async (cognitoId: string): Promise<IUser | null> => {
  // The /users/cognito/ endpoint no longer exists on the backend.
  // Use email-based lookup instead if needed, or look up by MongoDB ID.
  try {
    const result = await api.get(`/users/lookup?email=${encodeURIComponent(cognitoId)}`);
    return (result as any)?.data || null;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const result = await api.get(`/users/${id}`);
    return (result as any)?.data || result;
  } catch (error: any) {
    throw { message: error.message };
  }
};

export const getUser = async (input: string) => {
  try {
    // Determine if input is email or phone and use the correct query param
    const param = input.includes('@') ? 'email' : 'phone';
    const result = await api.get(`/users/lookup?${param}=${encodeURIComponent(input)}`);
    return (result as any)?.data || null;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
};

export const checkPhoneUnique = async (phone: string) => {
  try {
    const result = await api.get(`/users/lookup?phone=${encodeURIComponent(phone)}`);
    return (result as any)?.data || null;
  } catch (err) {
    return null;
  }
};

export const getUserWallet = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/wallets/${userId}`);
    return result.data;
  } catch (err) {
    return null;
  }
};

export const getDriverWallet = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/wallets/${userId}`);
    return result.data;
  } catch (err) {
    return null;
  }
};

export async function createAddress(data: any, userId: string) {
  try {
    const result = await api.post("/user-address", { ...data, userId });
    return (result as any)?.data || result;
  } catch (error) {
    console.error("Error creating address: ", error);
    throw new Error("Failed to create the address. Please try again.");
  }
}

export async function updateAddress(data: any) {
  try {
    const result = await api.patch(`/user-address/${data.id}`, data);
    return (result as any)?.data || result;
  } catch (error) {
    console.error("Error updating address: ", error);
    throw new Error("Failed to update the address.");
  }
}

export async function getAddress(userId: string, id: string) {
  const result = await api.get(`/user-address/${id}?userId=${userId}`);
  return (result as any)?.data || result;
}

export async function getAccount(userId: string, id: string) {
  const result = await api.get(`/bank-accounts/${id}?userId=${userId}`);
  return (result as any)?.data || result;
}

export async function deleteAddress(id: string, userId: string) {
  try {
    await api.del(`/user-address/${id}?userId=${userId}`);
  } catch (error) {
    console.log(error);
  }
}

export async function createSocialMediaLink(provider: string, url: string, userId: string) {
  try {
    await api.post("/social-links", { type: provider, link: url, userId });
  } catch (error) {
    console.error("Error creating social link: ", error);
    throw new Error("Failed to create the social link. Please try again.");
  }
}

export async function deleteSocialMediaLink(id: string, userId: string) {
  try {
    await api.del(`/social-links/${id}?userId=${userId}`);
  } catch (error) {
    console.log(error);
  }
}
