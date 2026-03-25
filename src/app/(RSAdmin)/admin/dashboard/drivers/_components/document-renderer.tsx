"use client";
import { getUrl } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import Image, { ImageProps } from "next/image";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

Amplify.configure(awsconfig);

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
  const [file, setFile] = useState<string | null>(null);
  const [loadFile, setLoadFile] = useState<boolean>(false);
  const navigation = useRouter();

  useEffect(() => {
    const fetchFile = async (fileKey: string) => {
      setLoadFile(true);
      try {
        const imageUrl = await getUrl({ key: fileKey, options: { accessLevel: "guest" } });
        setFile(imageUrl?.url?.href);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadFile(false);
      }
    };

    if (fileKey) {
      fetchFile(fileKey);
    } else {
      setFile(null);
    }
  }, [fileKey]);

  if (!fileKey || loadFile || !file) {
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

  const extension = fileKey?.split(".")[1];
  console.log("Extension", extension);

  if (extension !== "pdf") {
    return (
      <Image
        onClick={() => navigation.push(file)}
        {...restProps}
        src={file}
        alt={"place holder image"}
        width={width}
        height={height}
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
