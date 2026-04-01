import { apiClient } from "@/lib/ApiClient";

const driverDocumentApprovalOrRejection = async (driverId, documentType, approve) => {
  try {
    const result = await apiClient.patch(
      `/admin/drivers/${driverId}/documents/${documentType}/approval`,
      { approve }
    );
    return result.data;
  } catch (error) {
    throw { message: error.message };
  }
};

const updateLegalInfo = async (id, data) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/documents/${id}/legal-info`, data);
    return { statusCode: 200, data: result.data, message: "Legal Info Updated Successfully." };
  } catch (error) {
    return { statusCode: 500, message: error.message };
  }
};

const updateCarLegalInfo = async (id, data) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/car-documents/${id}/legal-info`, data);
    return { statusCode: 200, data: result.data, message: "Car Legal Info Updated Successfully." };
  } catch (error) {
    return { statusCode: 500, message: error.message };
  }
};

const carDocumentApprovalOrRejection = async (id, documentType, approve) => {
  try {
    const result = await apiClient.patch(
      `/admin/drivers/car-documents/${id}/${documentType}/approval`,
      { approve }
    );
    return result.data;
  } catch (error) {
    throw { message: error.message };
  }
};

const EditCarDocument = async (id, documentType, data) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/car-documents/${id}`, {
      [documentType]: data,
    });
    return result.data;
  } catch (error) {
    throw { message: error.message };
  }
};

export {
  driverDocumentApprovalOrRejection,
  carDocumentApprovalOrRejection,
  EditCarDocument,
  updateLegalInfo,
  updateCarLegalInfo,
};
