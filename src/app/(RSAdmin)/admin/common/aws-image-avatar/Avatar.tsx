"use client";

import React from "react";
import Avatar, { AvatarProps } from "@mui/material/Avatar";

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
  return <Avatar src={imageKey ?? undefined} alt={alt} {...props} />;
};

export default AwsImageAvatar;
