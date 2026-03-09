import { v4 as uuid } from "uuid";
import { uploadData } from "aws-amplify/storage";

export const uploadImageFile = async (
  image: File | null
): Promise<string | undefined | null> => {
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
        accessLevel: 'guest',
        onProgress: ({
          transferredBytes,
          totalBytes,
        }: {
          transferredBytes: number;
          totalBytes: number;
        }) => {
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
  } catch (error: any) {
    console.log("uploading error: ", error);
    return null;
  }
};
