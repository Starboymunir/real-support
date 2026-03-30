import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import Iconify from '@/components/iconify/iconify';
import { Car } from '@/lib/interface-types/driver-types';
import React, { useState } from 'react';

const S3_BUCKET = "psslrscab-storage-bucket4439f-dev";
const S3_REGION = "eu-west-1";
function resolveS3Url(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/")) return key;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/public/${key}`;
}

interface CarCardProps {
  car: Car;
  handleClick: (driverId: string, id: string) => void;
}

export default function CarCard({ car, handleClick }: CarCardProps) {
  const { carImage, model, driverInfo, engine, make, id } = car;
  const [imgError, setImgError] = useState(false);
  const resolved = resolveS3Url(carImage);

  return (
    <Card
      sx={{ textAlign: "center", cursor: "pointer", "&:hover": { boxShadow: 6 } }}
      onClick={() => handleClick(driverInfo?.id || "", id)}
    >
      <Box
        sx={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.neutral",
          mt: 2,
          mx: 2,
          borderRadius: 1.5,
          overflow: "hidden",
        }}
      >
        {resolved && !imgError ? (
          <Box
            component="img"
            src={resolved}
            alt={model || make}
            onError={() => setImgError(true)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Stack alignItems="center" spacing={0.5}>
            <Iconify icon="fa6-solid:car" width={48} sx={{ color: "text.disabled" }} />
          </Stack>
        )}
      </Box>

      <ListItemText
        sx={{ my: 2 }}
        primary={make + " " + engine}
        secondary={`Model: ${model}`}
        primaryTypographyProps={{ typography: "subtitle1" }}
        secondaryTypographyProps={{ component: "span", mt: 0.5 }}
      />
    </Card>
  );
}
