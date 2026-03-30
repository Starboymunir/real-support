"use client";
import Image, { ImageProps } from "next/image";
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

const S3_BUCKET = "psslrscab-storage-bucket4439f-dev";
const S3_REGION = "eu-west-1";
function resolveS3Url(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/")) return key;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/public/${key}`;
}

interface DocumentRendererProps extends ImageProps {
  fileKey: string;
}

const DocumentRenderer = ({
  fileKey,
  width = 100,
  height = 100,
  ...props
}: DocumentRendererProps) => {
  const {src, ...restProps} = props;
  const navigation = useRouter();

  const file = useMemo(() => resolveS3Url(fileKey), [fileKey]);

  if (!fileKey || !file) {
    return (
      <Image
        {...restProps}
        alt={"place holder image"}
        width={width}
        height={height}
        src={"/webAssets/images/placeholder/package.jpg"}
        className="rounded-full shadow object-cover object-center"
      />
    );
  }

  const extension = fileKey?.split(".").pop()?.toLowerCase();

  if (extension !== "pdf") {
    return (
      <Image
        onClick={() => navigation.push(file)}
        {...restProps}
        src={file}
        alt={"place holder image"}
        width={width}
        height={height}
        unoptimized
        className="rounded-full shadow object-cover  object-center cursor-pointer"
      />
    );
  }

  return (
    <Box
      component="img"
      onClick={() => navigation.push(file)}
      src={`/assets/icons/files/ic_pdf.svg`}
      sx={{
        width: 100,
        height: 100,
        cursor: "pointer",
        flexShrink: 0,
      }}
    />
  );
};

export default DocumentRenderer;
