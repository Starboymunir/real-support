import { apiClient } from "@/lib/ApiClient";

export const checkUser = async (email, phone_number, cognitoUserName) => {
  try {
    if (email) {
      const res = await apiClient.get(`/users/lookup?query=${encodeURIComponent(email)}`);
      if (res.data) return res.data;
    }
    if (phone_number) {
      const res = await apiClient.get(`/users/lookup?query=${encodeURIComponent(phone_number)}`);
      if (res.data) return res.data;
    }
    if (cognitoUserName) {
      const res = await apiClient.get(`/users/cognito/${cognitoUserName}`);
      if (res.data) return res.data;
    }
    return null;
  } catch {
    return null;
  }
};

export const checkUserByEmail = async (email) => {
  try {
    const res = await apiClient.get(`/users/lookup?query=${encodeURIComponent(email)}`);
    return res.data;
  } catch {
    return null;
  }
};

export const checkUserByPhone = async (phone_number) => {
  try {
    const res = await apiClient.get(`/users/lookup?query=${encodeURIComponent(phone_number)}`);
    return res.data;
  } catch {
    return null;
  }
};

export const checkUserByCognito = async (cognitoUserName) => {
  try {
    const res = await apiClient.get(`/users/cognito/${cognitoUserName}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findUser = async (id) => {
  try {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const res = await apiClient.get(`/users/lookup?query=${encodeURIComponent(email)}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createUser = async (firstName, lastName, email, password, phone_number) => {
  const res = await apiClient.post("/auth/register", {
    firstName,
    lastName,
    emailAddress: email,
    password,
    phone_number,
  });
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await apiClient.patch(`/users/info/${id}`, data);
  return res.data;
};
