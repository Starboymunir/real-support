import { UploadIcon } from "lucide-react";
import ReactImageUploading, {
  ImageListType,
  ImageType,
} from "react-images-uploading";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppImage } from "./app-image";
import { CloseIcon } from "../../../public/icons/CloseIcon";

export const useSelectedImage = (initialImage?: ImageType | string | null) => {
  const [selectedImage, setSelectedFile] = useState<ImageListType>([]);

  useEffect(() => {
    if (!initialImage) return;

    if (typeof initialImage === "string") {
      setSelectedFile([{ dataURL: initialImage }]);
    } else {
      setSelectedFile([initialImage]);
    }
  }, [initialImage]);

  return [selectedImage, setSelectedFile] as const;
};

export function AppImageUploader(
  props: ComponentProps<typeof ReactImageUploading> & {
    imageBuilder?: (image: ImageType, onUpdate: () => void) => ReactNode;
  }
) {
  return (
    <ReactImageUploading {...props}>
      {({
        imageList,
        onImageUpload,
        isDragging,
        onImageUpdate,
        onImageRemove,
        dragProps,
      }) => (
        <div>
          {imageList.length === 0 && (
            <button
              onClick={onImageUpload}
              {...dragProps}
              className={cn(
                `border-2 border-dashed w-full rounded-md text-center py-12 hover:border-main text-muted-foreground`,
                {
                  "border-primary bg-primary/30 text-background": isDragging,
                }
              )}
              type="button"
            >
              <div>
                <UploadIcon className="w-[70px] mx-auto" />

                <h6 className="text-base font-medium mt-3">
                  Drop your image here, or{" "}
                  <span className="text-main">browse</span>
                </h6>
              </div>
            </button>
          )}
          {imageList.length > 0 &&
            imageList.map((image, i) => (
              <div
                key={i}
                className={`relative cursor-pointer group rounded-md overflow-hidden w-fit`}
              >
                {props.imageBuilder ? (
                  props.imageBuilder(image, () => onImageUpdate(i))
                ) : (
                  <AppImage
                    src={image.dataURL ?? ""}
                    alt="Image"
                    width={200}
                    height={200}
                    onClick={() => onImageUpdate(i)}
                    className="object-cover object-top size-40"
                  />
                )}
                <div
                  className="absolute bottom-[5%] right-[5%] cursor-pointer text-gray-200 bg-destructive p-1 rounded-full"
                  onClick={(e) => {
                    onImageRemove(i);
                    e.stopPropagation();
                  }}
                >
                  <CloseIcon />
                </div>
              </div>
            ))}
        </div>
      )}
    </ReactImageUploading>
  );
}
