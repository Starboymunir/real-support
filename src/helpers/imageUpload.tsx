import { api, ApiError } from "@/lib/api";

/**
 * Upload an image to /documents/upload_file. Throws an Error with a useful
 * message on every failure so callers can surface it instead of silently
 * submitting an "Update success!" with no photo attached. Returns the
 * uploaded S3 URL (or local fallback URL) on success.
 *
 * Callers that previously did `if (uploadedUrl) ...` should now wrap this
 * in try/catch and show `err.message` to the user.
 */
export const uploadImageFile = async (
  image: File | null
): Promise<string | null> => {
  if (!image) {
    return null;
  }

  if (!image.type?.startsWith("image/")) {
    throw new Error(
      `Not an image — got "${image.type || "unknown"}". Please pick a JPG, PNG or WebP.`
    );
  }

  // Real-Drive client caps uploads at 5 MB; staying consistent so the rider
  // and admin paths behave identically.
  const MAX_BYTES = 5 * 1024 * 1024;
  if (image.size > MAX_BYTES) {
    throw new Error(
      `Image is ${(image.size / 1024 / 1024).toFixed(1)} MB — please choose one under 5 MB.`
    );
  }

  const formData = new FormData();
  formData.append("file", image);

  try {
    const result = await api.upload<{ fileUrl?: string }>(
      "/documents/upload_file",
      formData
    );
    const fileUrl = result?.fileUrl;
    if (!fileUrl) {
      // Server returned 200 but no URL — almost always means the response
      // body shape changed or the proxy mangled it.
      throw new Error(
        "Upload server returned no fileUrl — check the backend logs for /documents/upload_file."
      );
    }
    return fileUrl;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      // Pass through the backend's actual message ("File too large", S3
      // error, auth error, etc.) so the user sees what's wrong.
      throw new Error(error.message || `Upload failed (HTTP ${error.status})`);
    }
    if (error instanceof Error) throw error;
    throw new Error("Upload failed: unknown error");
  }
};
