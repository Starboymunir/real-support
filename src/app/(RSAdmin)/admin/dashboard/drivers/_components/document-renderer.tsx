"use client";
import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import Iconify from "@/components/iconify/iconify";

const S3_BUCKET = "psslrscab-storage-bucket4439f-dev";
const S3_REGION = "eu-west-1";
function resolveS3Url(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/")) return key;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/public/${key}`;
}

interface DocumentRendererProps {
  fileKey: string;
  alt?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

const DocumentRenderer = ({
  fileKey,
  alt = "document",
  width = 400,
  height = 300,
  onClick,
}: DocumentRendererProps) => {
  const [imgError, setImgError] = useState(false);
  const file = useMemo(() => resolveS3Url(fileKey), [fileKey]);

  if (!fileKey || !file) {
    return (
      <Box
        sx={{
          width,
          height: height / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.neutral",
          borderRadius: 1.5,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.disabled">
          No document uploaded
        </Typography>
      </Box>
    );
  }

  const extension = fileKey?.split(".").pop()?.toLowerCase();

  // PDF files
  if (extension === "pdf") {
    return (
      <Box
        onClick={onClick || (() => window.open(file, "_blank"))}
        sx={{
          width,
          height: height / 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.neutral",
          borderRadius: 1.5,
          cursor: "pointer",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Iconify icon="solar:document-bold" width={48} sx={{ color: "error.main", mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          PDF Document — Click to view
        </Typography>
      </Box>
    );
  }

  // Unsupported browser formats (HEIC/HEIF from Apple)
  if (extension === "heic" || extension === "heif") {
    return (
      <Box
        onClick={onClick || (() => window.open(file, "_blank"))}
        sx={{
          width,
          height: height / 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.neutral",
          borderRadius: 1.5,
          cursor: "pointer",
          border: "1px solid",
          borderColor: "warning.main",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Iconify icon="solar:gallery-bold" width={48} sx={{ color: "warning.main", mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          HEIC Image — Click to download
        </Typography>
      </Box>
    );
  }

  // Image with error fallback
  if (imgError) {
    return (
      <Box
        onClick={onClick || (() => window.open(file, "_blank"))}
        sx={{
          width,
          height: height / 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.neutral",
          borderRadius: 1.5,
          cursor: "pointer",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Iconify icon="solar:gallery-broken" width={48} sx={{ color: "text.disabled", mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Could not load preview — Click to open
        </Typography>
      </Box>
    );
  }

  // Regular image (jpg, jpeg, png, webp, etc.)
  return (
    <Box
      component="img"
      src={file}
      alt={alt}
      onError={() => setImgError(true)}
      onClick={onClick}
      sx={{
        width,
        height,
        objectFit: "contain",
        borderRadius: 1.5,
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.neutral",
        "&:hover": onClick ? { borderColor: "primary.main", boxShadow: 2 } : {},
      }}
    />
  );
};

export default DocumentRenderer;
