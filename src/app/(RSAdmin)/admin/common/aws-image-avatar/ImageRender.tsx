"use client";

import Image from "next/image";
import React, { useState } from "react";
import { resolveS3Url } from "@/lib/api";

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
  const [error, setError] = useState(false);
  const resolvedUrl = resolveS3Url(imageKey);
  const displayImage = error ? (placeHolderImage || "/fallback.png") : (resolvedUrl || placeHolderImage || "/fallback.png");

  return (
    <Image
      alt={imageKey ? alt : "placeholder-image"}
      width={width}
      height={height}
      id={imageKey ? "aws-image" : "place-holder"}
      unoptimized
      src={displayImage}
      onError={() => setError(true)}
      className={`rounded-full shadow object-cover object-center ${className}`}
    />
  );
};

export default AwsImageRender;
