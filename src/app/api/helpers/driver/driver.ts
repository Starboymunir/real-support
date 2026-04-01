import { apiClient } from "@/lib/ApiClient";
import { uploadFile } from "@/app/api/helpers/imageUpload";
import { convertFormData } from "../../utils/convertFormData";
import { fieldsExtracter } from "../../utils/filterFields";
import { remove } from "aws-amplify/storage";

type CarStatus = "ACTIVE" | "INACTIVE";

export const findAllDrivers = async () => {
  try {
    const res = await apiClient.get("/admin/drivers?count=1000");
    return res.data || [];
  } catch {
    return [];
  }
};

export const findDriver = async (id: string) => {
  try {
    const res = await apiClient.get(`/admin/drivers/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findDriverByUserId = async (driverUserId: string) => {
  try {
    const res = await apiClient.get(`/admin/drivers?userId=${driverUserId}`);
    const drivers = res.data || [];
    return Array.isArray(drivers) ? drivers[0] || null : drivers;
  } catch {
    return null;
  }
};

// Driver document operations
export const createOrUpdateDocument = async (
  body: FormData,
  documentType: string,
  documentFields: string[],
  fileToExtract: string[]
) => {
  let data: Record<string, string | File | null | undefined> =
    convertFormData(body);

  const { driverId } = data || {};
  const dataPayload: Record<string, string | File | null | undefined> =
    fieldsExtracter(data, documentFields);
  const Files = fieldsExtracter(data, fileToExtract);

  // Get existing document via API
  let document: any = null;
  try {
    const docRes = await apiClient.get(`/documents/driver/${driverId}`);
    document = docRes.data;
  } catch {
    // no existing document
  }

  for (let file in Files) {
    const fileUrl = await uploadFile(data[file] as File);
    dataPayload[file] = fileUrl;

    const documentTypeKey = documentType as keyof typeof document;
    const fileKeyInDocumentType =
      file as keyof (typeof document)[typeof documentTypeKey];

    if (
      document &&
      document[documentTypeKey] &&
      document[documentTypeKey][fileKeyInDocumentType]
    ) {
      await remove({ key: document[documentTypeKey][fileKeyInDocumentType] });
    }
  }

  const payload = {
    [documentType]: {
      ...dataPayload,
      details: {
        isSubmitted: true,
        status: "Pending",
      },
    },
    driverId: driverId as string,
  };

  if (!document) {
    const res = await apiClient.post(`/documents/driving-license`, payload);
    return res.data;
  }
  const res = await apiClient.patch(`/documents/driver/${driverId}`, payload);
  return res.data;
};

// Driver Car document operations
export const createOrUpdateCarDocument = async (
  body: FormData,
  documentType: string,
  documentFields: string[],
  fileToExtract: string[]
) => {
  let data: Partial<Record<string, string | File>> = convertFormData(body);
  const { carId } = data || {};
  const dataPayload: Partial<Record<string, string | File | null>> =
    fieldsExtracter(data, documentFields);
  const Files = fieldsExtracter(data, fileToExtract);

  let carDocument: any = null;
  try {
    const docRes = await apiClient.get(`/documents/car/${carId}`);
    carDocument = docRes.data;
  } catch {
    // no existing car document
  }

  for (let file in Files) {
    const fileUrl = await uploadFile(data[file] as File);
    dataPayload[file] = fileUrl;
    const documentTypeKey = documentType as keyof typeof carDocument;
    const fileKeyInDocumentType =
      file as keyof (typeof carDocument)[typeof documentTypeKey];

    if (
      carDocument &&
      carDocument[documentTypeKey] &&
      carDocument[documentTypeKey][fileKeyInDocumentType]
    ) {
      await remove({ key: carDocument[documentTypeKey][fileKeyInDocumentType] });
    }
  }

  const payload = {
    [documentType]: {
      ...dataPayload,
      details: {
        isSubmitted: true,
        status: "Pending",
      },
    },
    carId: carId as string,
  };

  if (!carDocument) {
    const res = await apiClient.post(`/documents/driver/car/insurance`, payload);
    return res.data;
  }
  const res = await apiClient.patch(`/documents/car/${carId}`, payload);
  return res.data;
};

export const findDriverDocument = async (driverId: string) => {
  try {
    const res = await apiClient.get(`/documents/driver/${driverId}`);
    return res.data;
  } catch {
    return null;
  }
};

// Car-related functions
export const findDriverCar = async (driverId: string) => {
  try {
    const res = await apiClient.get(`/driver-cars?driverId=${driverId}`);
    const cars = res.data;
    return Array.isArray(cars) ? cars[0] || null : cars;
  } catch {
    return null;
  }
};

export const findCarByNumberPlate = async (numberPlate: string) => {
  try {
    const res = await apiClient.get(`/driver-cars?numberPlate=${encodeURIComponent(numberPlate)}`);
    const cars = res.data;
    return Array.isArray(cars) ? cars[0] || null : cars;
  } catch {
    return null;
  }
};

export const findCar = async (id: string) => {
  try {
    const res = await apiClient.get(`/driver-cars/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createCar = async (
  data: {
    color: string;
    carImage: string | null;
    engine: string;
    make: string;
    model: string;
    year: string;
    numberPlate: string;
    driverId: string;
  },
  fileName: string | null | undefined
) => {
  const res = await apiClient.post("/driver-cars", {
    ...data,
    carImage: fileName,
  });
  return res.data;
};

export const updateCar = async (
  id: string,
  data: {
    color: string | undefined;
    carImage: string | null | undefined;
    engine: string | undefined;
    make: string | undefined;
    model: string | undefined;
    year: string | undefined;
    numberPlate: string | undefined;
    status: CarStatus | undefined;
  }
) => {
  const res = await apiClient.patch(`/driver-cars/${id}`, data);
  return res.data;
};

export const findCarDocument = async (carId: string) => {
  try {
    const res = await apiClient.get(`/documents/car/${carId}`);
    return res.data;
  } catch {
    return null;
  }
};
