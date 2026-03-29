"use client";

import Image from "next/image";
import React from "react";

const S3_BUCKET = "psslrscab-storage-bucket4439f-dev";
const S3_REGION = "eu-west-1";

function resolveS3Url(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/")) return key;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/public/${key}`;
}

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
  const resolvedUrl = resolveS3Url(imageKey);
  const displayImage = resolvedUrl || placeHolderImage;

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
