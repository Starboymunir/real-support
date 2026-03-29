"use client";

import React from "react";
import Avatar, { AvatarProps } from "@mui/material/Avatar";

const S3_BUCKET = "psslrscab-storage-bucket4439f-dev";
const S3_REGION = "eu-west-1";

function resolveS3Url(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/")) return key;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/public/${key}`;
}

interface AwsImageAvatarProps extends AvatarProps {
  imageKey?: string | null;
  alt?: string;
  width?: number;
  height?: number;
}

const AwsImageAvatar: React.FC<AwsImageAvatarProps> = ({
  imageKey,
  alt = "image",
  ...props
}) => {
  return <Avatar src={resolveS3Url(imageKey)} alt={alt} {...props} />;
};

export default AwsImageAvatar;
