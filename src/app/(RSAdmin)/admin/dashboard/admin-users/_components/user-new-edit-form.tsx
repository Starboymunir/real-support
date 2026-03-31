import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import axiosInstance from "@/lib/admin-axios";
import { Grid, Typography } from "@mui/material";
import { fData } from "@/lib/utils/format-number";
import { IAdmin } from "@/types/type";
import { useQueryClient } from "@tanstack/react-query";
import { resolveS3Url } from '@/lib/api';

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "COMPANY_ADMIN", label: "Company Admin" },
];

export default function UserNewEditForm({
  currentUser,
}: {
  currentUser?: IAdmin;
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    profileImage: Yup.mixed(),
    filePreview: Yup.mixed(),
    firstName: Yup.string().required("Name is required"),
    lastName: Yup.string(),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    phone_number: Yup.string().required("Phone number is required"),
    secretNumber: Yup.string().required("Secret number is required"),
    password: !currentUser
      ? Yup.string().required("Password is required")
      : Yup.string(),
    role: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      role: currentUser?.role || "",
      email: currentUser?.email || "",
      phone_number: currentUser?.phone_number || "",
      password: "",
      secretNumber: currentUser?.secretNumber || "",
    }),
    [currentUser]
  );

  type UserFormValues = Yup.InferType<typeof NewUserSchema>;

  const methods = useForm<UserFormValues>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const payload: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        payload[key] = value;
      }
    });

    if (currentUser) {
      delete payload.password;
    }
    delete payload.filePreview;
    delete payload.profileImage;
    try {
      const url = currentUser
        ? `/admin/adminUsers/${currentUser.id}`
        : `/admin/adminUsers/register`;

      const method = currentUser ? "put" : "post";

      const response = await axiosInstance[method](url, payload);

      const successStatus = currentUser ? 200 : 201;
      if (response.status === successStatus) {
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        enqueueSnackbar(
          currentUser ? "Updated successfully!" : "Created successfully!"
        );
        if (!currentUser) reset();
        router.push(paths.dashboard.user.list);
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.message || "Something went wrong", {
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
    const imageUrl = resolveS3Url(currentUser?.coverImage || currentUser?.profileImageUrl);
    if (imageUrl) {
      setValue("filePreview", { preview: imageUrl }, { shouldValidate: true });
    }
  }, [currentUser?.coverImage, currentUser?.profileImageUrl, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3} justifyContent={"center"}>
        <Grid xs={12} md={10}>
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
                    <br /> max size of {fData(5145728)}
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
                sm: "repeat(1, 1fr)",
              }}
            >
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
                <RHFTextField
                  name="email"
                  label="Email Address"
                  disabled={currentUser ? true : false}
                />
                <RHFTextField name="phone_number" label="Phone Number" />
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
                <RHFTextField name="secretNumber" label="Secret Number" />
                {!currentUser ? (
                  <RHFTextField
                    name="password"
                    label="Password"
                    disabled={currentUser ? true : false}
                  />
                ) : null}

                <RHFAutocomplete
                  name="role"
                  label="Role"
                  options={ROLE_OPTIONS.map((r) => r.value)}
                  getOptionLabel={(option) => {
                    const found = ROLE_OPTIONS.find((r) => r.value === option);
                    return found ? found.label : option;
                  }}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderOption={(props, option) => {
                    if (!option) {
                      return null;
                    }
                    const found = ROLE_OPTIONS.find((r) => r.value === option);

                    return (
                      <li {...props} key={option}>
                        {found ? found.label : option}
                      </li>
                    );
                  }}
                />
              </Box>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentUser ? "Create User" : "Save Changes"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
