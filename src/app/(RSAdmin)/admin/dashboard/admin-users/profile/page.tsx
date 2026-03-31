"use client";

import { useState, useCallback, useEffect } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { fData } from "@/lib/utils/format-number";
import { useAuth } from "@/lib/auth-context";
import { resolveS3Url } from '@/lib/api';
import axiosInstance from "@/lib/admin-axios";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

const ProfileSchema = Yup.object().shape({
  profileImage: Yup.mixed().optional(),
  filePreview: Yup.mixed().optional(),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().optional(),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
});

type ProfileFormValues = Yup.InferType<typeof ProfileSchema>;

export default function AdminProfilePage() {
  const { admin, refreshUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues: ProfileFormValues = {
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    email: admin?.email || "",
    phone_number: admin?.phone_number || "",
  };

  const methods = useForm<ProfileFormValues>({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!admin?.id) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "filePreview" &&
        key !== "profileImage"
      ) {
        formData.append(key, value as string);
      }
    });
    // Append file separately if a new image was dropped
    if (data.profileImage instanceof File) {
      formData.append("profileImage", data.profileImage);
    }

    try {
      await axiosInstance.put(
        `/admin/adminUsers/${admin.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      enqueueSnackbar("Profile updated successfully!");
      await refreshUser();
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to update profile", {
        variant: "error",
      });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setValue("profileImage", file);
      setValue("filePreview", newFile, { shouldValidate: true });
    },
    [setValue]
  );

  useEffect(() => {
    const coverImageKey = admin?.coverImage;
    if (!coverImageKey) return;
    const url = resolveS3Url(coverImageKey);
    if (url) {
      setValue(
        "filePreview",
        { preview: url },
        { shouldValidate: true }
      );
    }
  }, [admin?.coverImage, setValue]);

  const roleLabel =
    admin?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : "Admin";

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="My Profile"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Profile" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3} justifyContent="center">
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 5, pb: 5, px: 3, textAlign: "center" }}>
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
                    Allowed *.jpeg, *.jpg, *.png
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />

              <Stack spacing={1} sx={{ mt: 3 }} alignItems="center">
                <Typography variant="h6">
                  {admin?.firstName} {admin?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {admin?.email}
                </Typography>
                <Chip label={roleLabel} color="primary" size="small" />
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
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
                <RHFTextField name="email" label="Email Address" disabled />
                <RHFTextField name="phone_number" label="Phone Number" />
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </Container>
  );
}
