import { v4 as uuid } from "uuid";
import { getUrl, uploadData } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
Amplify.configure(awsconfig);

export const uploadFile = async (
  image
) => {
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
        accessLevel: "guest",
        onProgress: ({ transferredBytes, totalBytes }) => {
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
  } catch (error) {
    return null;
  }
};
