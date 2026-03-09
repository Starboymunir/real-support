"use client";

import Image from "next/image";
import React from "react";

interface AwsImageRenderOwnProps {
  imageKey?: string | null;
  placeHolderImage?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

type AwsImageRenderProps = Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "width" | "height" | "className" | "id" | "unoptimized"> & AwsImageRenderOwnProps;

const AwsImageRender: React.FC<AwsImageRenderProps> = ({
  imageKey = null,
  placeHolderImage,
  alt = "image",
  width = 100,
  height = 100,
  className = "",
  ...rest
}) => {
  const displayImage = imageKey || placeHolderImage;

  return (
    <Image
      alt={imageKey ? alt : "placeholder-image"}
      width={width}
      height={height}
      id={imageKey ? "aws-image" : "place-holder"}
      unoptimized={!displayImage?.startsWith("/")}
      src={displayImage || "/fallback.png"}
      className={`rounded-full shadow object-cover object-center ${className}`}
    />
  );
};

export default AwsImageRender;
