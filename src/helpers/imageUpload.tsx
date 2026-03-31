import { api } from "@/lib/api";

export const uploadImageFile = async (
  image: File | null
): Promise<string | undefined | null> => {
  if (!image) {
    return null;
  }

  if (!image.type?.startsWith("image/")) {
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", image);

    const result = await api.upload<{ fileUrl?: string }>(
      "/documents/upload_file",
      formData
    );

    // Backend returns { fileUrl } in the unwrapped data payload
    return result?.fileUrl ?? null;
  } catch (error: any) {
    console.log("uploading error: ", error);
    return null;
  }
};
