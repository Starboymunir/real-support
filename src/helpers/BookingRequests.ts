import { apiClient } from "@/lib/ApiClient";

type Address = {
  city?: string;
  latitude?: number | string;
  longitude?: number | string;
  [key: string]: any;
};

export const addressFieldChecker = (data: Address) => {
  const { city, latitude, longitude } = data || {};

  if (city && latitude && longitude) {
    return true;
  }
  return false;
};

export const createStopages = async (
  stoppages: Address[],
  requestId: string,
  userId: string
) => {
  if (!stoppages?.length || !requestId) {
    return;
  }

  const result = [];
  for (let i = 0; i < stoppages.length; ++i) {
    const stopagesFields = addressFieldChecker(stoppages[i]);
    if (stopagesFields) {
      try {
        const response = await apiClient.post("/addresses", {
          ...stoppages[i],
          userId,
          requestId,
        });
        result.push(response.data);
      } catch (error) {
        // Handle error from createAddress function
        console.error("Error creating address:", error);
      }
    }
  }
  return result;
};
