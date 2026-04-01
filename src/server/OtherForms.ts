import { apiClient } from "@/lib/ApiClient";

export const createContactUs = async ({ formValues, userId }: { formValues: any; userId: string }) => {
  try {
    const result = await apiClient.post("/contact-us", { ...formValues, userId });
    return result.data;
  } catch (error: any) {
    console.error("Error creating contact us:", error);
    throw new Error("Unable to create contact us");
  }
};

export const getAllContactUs = async () => {
  try {
    const result = await apiClient.get("/admin/contact-us");
    return result.data || [];
  } catch (error: any) {
    console.error("Error getting contact us:", error);
    throw new Error("Unable to get contact us");
  }
};

export const getContactUsById = async (id: string) => {
  try {
    const result = await apiClient.get(`/admin/contact-us/${id}`);
    return result.data;
  } catch (error: any) {
    console.error("Error getting contact us:", error);
    throw new Error("Unable to get contact us");
  }
};

export const updateContactUsById = async (
  id: string, name: string, email: string,
  phone_number: string, reason: string, remarks: string, status: any
) => {
  try {
    const result = await apiClient.patch(`/admin/contact-us/${id}`, {
      name, email, phone_number, reason, remarks, status,
    });
    return result.data;
  } catch (error: any) {
    console.error("Error updating contact us:", error);
    throw new Error("Unable to update contact us");
  }
};
