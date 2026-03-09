"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { fData } from "@/lib/utils/format-number";
import { Typography } from "@mui/material";
import { getUrl } from "aws-amplify/storage";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { uploadImageFile } from "@/helpers/imageUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package } from "@prisma/client";
import axiosInstance from "@/lib/axios";

// ----------------------------------------------------------------------
type PackageFormValues = {
  coverImage?: File | string | null; // File for new uploads, string for existing S3 key
  filePreview?: string | null; // only for UI preview
  [key: string]: any; // other fields
};

export default function PackagesNewEditForm({
  currentPackage,
}: {
  currentPackage?: Package;
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // ------------------- Zod Schema -------------------
  const NewPackageSchema = z.object({
    coverImage: z.union([z.string(), z.instanceof(File)]),
    filePreview: z.any(),
    name: z.string().min(2).max(100).nonempty("Name is required"),
    sortIndex: z.coerce.number().min(1, "Sort Index is required").max(100),
    description: z.string().min(2).max(500).nonempty("Description is required"),
    summary: z.string().min(2).max(500).nonempty("Summary is required"),
    serviceFee: z.coerce.number().min(0, "Service Fee is required"),
    pricePerMilage: z.coerce.number().min(0, "Price Per Milage is required"),
    drivingProMin: z.coerce.number().min(0, "Driving Pro minute is required"),
    waitingProMin: z.coerce.number().min(0, "Waiting Pro minute is required"),
    minBill: z.coerce.number().min(0, "Min Bill is required"),
    vat: z.coerce.number().min(0, "Vat is required"),
  });

  // ------------------- Default Values -------------------
  const defaultValues = useMemo(
    () => ({
      coverImage: currentPackage?.coverImage || null,
      filePreview: null,
      name: currentPackage?.name || "",
      summary: currentPackage?.summary || "",
      description: currentPackage?.description || "",
      serviceFee: currentPackage?.serviceFee || 0,
      sortIndex: currentPackage?.sortIndex || 0,
      pricePerMilage: currentPackage?.pricePerMilage || 0,
      drivingProMin: currentPackage?.drivingProMin || 0,
      waitingProMin: currentPackage?.waitingProMin || 0,
      minBill: currentPackage?.minBill || 0,
      vat: currentPackage?.vat || 0,
    }),
    [currentPackage]
  );

  const methods = useForm<PackageFormValues>({
    resolver: zodResolver(NewPackageSchema),
    defaultValues,
  });
  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    let fileName = data.coverImage;

    // If a File was uploaded, push it to S3
    if (data.coverImage instanceof File) {
      fileName = await uploadImageFile(data.coverImage);
    }
    delete data.filePreview;

    const payload = {
      ...data,
      coverImage: fileName,
    };

    try {
      if (currentPackage) {
        const { data } = await axiosInstance.patch(
          `/packages/${currentPackage.id}`,
          payload
        );

        if (data.success) {
          enqueueSnackbar(data.message);
          reset();
          router.push(paths.dashboard.packages.list);
        }
      } else {
        const { data } = await axiosInstance.post(`/packages`, payload);
        if (data.success) {
          enqueueSnackbar("Created successfully!");
          reset();
          router.push(paths.dashboard.packages.list);
        }
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.message ?? error.message, {
        variant: "error",
      });
    }
  });

  // -------------------------
  // File drop handler
  // -------------------------
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);

      setValue("coverImage", file, { shouldValidate: true });
      setValue("filePreview", previewUrl, { shouldValidate: true });
    },
    [setValue]
  );

  // -------------------------
  // Prefill preview when editing
  // -------------------------
  useEffect(() => {
    if (currentPackage?.coverImage) {
      (async () => {
        try {
          if (typeof currentPackage.coverImage === "string") {
            const url = await getUrl({ key: currentPackage.coverImage });
            setValue("filePreview", url.url.href, { shouldValidate: true });
            setValue("coverImage", currentPackage.coverImage, {
              shouldValidate: true,
            });
          }
        } catch (err) {
          console.error("Failed to fetch S3 preview:", err);
        }
      })();
    }
  }, [currentPackage?.coverImage, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 1fr)",
              }}
              marginTop={5}
            >
              <RHFUploadAvatar
                name="filePreview"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: "auto",
                      display: "block",
                      textAlign: "center",
                      color: "text.disabled",
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField name="name" label="Name" />
              <RHFTextField name="summary" label="Summary" />
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField name="description" label="Description" />
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(3, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField type="number" name="sortIndex" label="Sort Index" />
              <RHFTextField
                type="number"
                name="serviceFee"
                label="Service Fee"
              />
              <RHFTextField
                type="number"
                name="pricePerMilage"
                label="Price Per Milage"
              />
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(4, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField
                type="number"
                name="drivingProMin"
                label="Driving Pro Min"
              />
              <RHFTextField
                type="number"
                name="waitingProMin"
                label="Waiting Pro Min"
              />
              <RHFTextField type="number" name="vat" label="Vat" />
              <RHFTextField type="number" name="minBill" label="Min Bill" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentPackage ? "Create Package" : "Save Package"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
