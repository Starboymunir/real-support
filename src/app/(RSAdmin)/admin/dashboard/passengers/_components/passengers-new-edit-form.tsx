"use client";

import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { fData } from "@/lib/utils/format-number";
import { getUrl } from "aws-amplify/storage";
import { updatePassengerById } from "@/server/Passenger";
import { uploadImageFile } from "@/helpers/imageUpload";
import { useRouter } from "next/navigation";

// --------------------
// Form types
// --------------------
export interface PassengerFormValues {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone_number: string;
  coverImage?: any;
  filePreview?: any;
}

export default function PassengerNewEditForm({ currentPassenger }: { currentPassenger: any }) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const NewPassengerSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    emailAddress: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    phone_number: Yup.string().required("Phone number is required"),
    coverImage: Yup.mixed().nullable(),
    filePreview: Yup.mixed().nullable()
  });

  const defaultValues = useMemo<PassengerFormValues>(
    () => ({
      firstName: currentPassenger?.firstName || "",
      lastName: currentPassenger?.lastName || "",
      emailAddress: currentPassenger?.emailAddress || "",
      phone_number: currentPassenger?.phone_number || "",
      coverImage: (currentPassenger?.coverImage as string) ?? null,
      filePreview: currentPassenger?.coverImage ? {
        preview: currentPassenger?.coverImage,
      } : null,
    }),
    [currentPassenger]
  );

  const methods = useForm({
    resolver: yupResolver(NewPassengerSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data: any) => {
    const fileName = await uploadImageFile(data.filePreview);
    delete data.filePreview;
    delete data.coverImage;
    const formData = new FormData();
    formData.append("coverImage", fileName || "");

    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }

    try {
      await updatePassengerById(currentPassenger.id, formData);
      enqueueSnackbar("Update success!");
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
      console.error(error);
    } finally {
      router.refresh();
    }
  });

  useEffect(() => {
    if (currentPassenger?.coverImage) {
      (async () => {
        const url = await getUrl({ key: currentPassenger?.coverImage });
        const newFile = Object.assign(
          {},
          {
            preview: url.url.href,
          }
        );
        setValue("filePreview", newFile, { shouldValidate: true });
      })();
    }
  }, [currentPassenger?.coverImage, setValue]);

  const handleDrop = useCallback(
    (acceptedFiles: any) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("coverImage", file);
        setValue("filePreview", newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

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
              marginBottom={5}
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
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              <RHFTextField name="emailAddress" label="Email Address" />
              <RHFTextField name="phone_number" label="Phone Number" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentPassenger ? "Create Passenger" : "Save Passenger"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
