import { v4 as uuid } from "uuid";
import { uploadData } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(awsconfig);

export async function uploadFile(
  image: File | null
): Promise<string | undefined | null> {
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
      path: fileName,
      data: image,
      options: {
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

    console.log('result----', result);


    return result.path;
  } catch (error: any) {
    console.log('uploading error: ', error.message);

    return null;
  }
}
