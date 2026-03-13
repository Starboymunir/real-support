import { ComponentProps } from "react";
import { AppImage } from "./app-image";
import { cn } from "@/lib/utils";
import AwsImageRender from "@/components/AwsImageRender";

export function AppAvatar(
  props: Omit<ComponentProps<typeof AppImage>, "src"> & {
    src?: string | null | undefined;
    width?: number;
    height?: number;
    alt?: string;
    imageClass?: any;
  }
) {
  const {
    src,
    alt = "Image",
    width = 100,
    height = 100,
    className,
    imageClass,
    ...rest
  } = props; // Default values for width and height

  return (
    <div
      className={cn(
        "rounded-full p-0 overflow-hidden object-top text-center object-cover md:row-span-2",
        { "p-1": !src }, // Add padding if no src is provided
        className
      )}
    >
      <AwsImageRender
        width={width}
        height={height}
        imageKey={src}
        alt={alt}
        placeHolderImage="/images/profileImagePlaceholder.jpg"
        className={imageClass}
        {...rest} // Spread remaining props (e.g., alt text, onLoad, etc.)
      />
    </div>
  );
}
