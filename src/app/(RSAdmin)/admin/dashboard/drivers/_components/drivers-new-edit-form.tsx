import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { fData } from "@/lib/utils/format-number";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { DRIVER_SUBSCRIPTION_OPTIONS, DRIVER_STATUS_OPTIONS } from "@/_mock/_drivers";
import { MenuItem } from "@mui/material";
import axiosInstance from "@/lib/admin-axios";
import { resolveS3Url } from '@/lib/api';
import { uploadImageFile } from '@/helpers/imageUpload';
import { IDriver } from "@/types/type";
import { useQueryClient } from "@tanstack/react-query";
import { useCompaniesQuery } from "@/hooks/Company";

// ----------------------------------------------------------------------

export default function DriversNewEditForm({
  currentDriver,
}: {
  currentDriver: IDriver;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data: companies = [] } = useCompaniesQuery();

  const NewUserSchema = Yup.object().shape({
    driverRecognitionNumber: Yup.string().required(
      "Driver Recognition Number is required"
    ),
    nationalInsuranceNumber: Yup.string().required(
      "National Insurance Number is required"
    ),
    selfAssessmentTaxId: Yup.string().required(
      "Self Assessment Tax ID is required"
    ),
    ratings: Yup.number()
      .min(0)
      .max(5, "Ratings must be between 0 and 5")
      .required("Ratings is required"),
    totalJobComplete: Yup.number().min(0).integer(),
    bio: Yup.string().required("Bio is required"),
    hobby: Yup.string().required("Hobby is required"),
    depositPaid: Yup.boolean().required("Deposit Paid is required"),
    depositAmount: Yup.number().min(0).required("Deposit Amount is required"),
    commissionPercentage: Yup.number()
      .min(0)
      .required("Current Balance is required"),
    status: Yup.string().oneOf(DRIVER_STATUS_OPTIONS.map((option) => option.value)).required(
      "Status is required"
    ),
    subscription: Yup.string().required("Subscription is required"),
    companyId: Yup.string().nullable(),
    profileImage: Yup.mixed().nullable(),
    filePreview: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentDriver?.userInfo?.firstName || "",
      lastName: currentDriver?.userInfo?.lastName || "",
      emailAddress: currentDriver?.userInfo?.emailAddress || "",
      phone_number: currentDriver?.userInfo?.phone_number || "",
      driverRecognitionNumber: currentDriver?.driverRecognitionNumber || "",
      nationalInsuranceNumber: currentDriver?.nationalInsuranceNumber || "",
      selfAssessmentTaxId: currentDriver?.selfAssessmentTaxId || "",
      profileImage: currentDriver?.userInfo?.coverImage || currentDriver?.userInfo?.profileImageUrl || null,
      ratings: currentDriver?.ratings || 0,
      totalJobComplete: currentDriver?.totalJobComplete || 0,
      bio: currentDriver?.bio || "",
      hobby: currentDriver?.hobby || "",
      depositPaid: currentDriver?.depositPaid || false,
      depositAmount: currentDriver?.depositAmount || 0,
      commissionPercentage: currentDriver?.commissionPercentage || 0,
      subscription: currentDriver?.subscription || "",
      status: currentDriver?.status || "",
      companyId: currentDriver?.companyId || "",
      filePreview: currentDriver?.userInfo?.coverImage || currentDriver?.userInfo?.profileImageUrl || null,
    }),
    [currentDriver]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (driverData) => {
    try {
      // Upload profile image if a new file was dropped
      let coverImageUrl: string | undefined;
      if (driverData.profileImage instanceof File) {
        const uploadedUrl = await uploadImageFile(driverData.profileImage as any);
        if (uploadedUrl) coverImageUrl = uploadedUrl;
      }

      // Remove form-only fields
      const { filePreview, profileImage, ...payload } = driverData as any;

      // Empty string means unassign company
      if (payload.companyId === "") {
        payload.companyId = null;
      }

      // If we uploaded a new image, include coverImage for the user update
      if (coverImageUrl) {
        payload.coverImage = coverImageUrl;
      }

      const { data } = await axiosInstance.put(
        `/admin/drivers/${currentDriver.id}`,
        payload
      );

      if (data.success === true) {
        queryClient.invalidateQueries({ queryKey: ["All-Drivers"] });
        queryClient.invalidateQueries({ queryKey: ["Driver", currentDriver.id] });
        enqueueSnackbar("Update success!");
      }
    } catch (error: any) {
      console.log("error", error);
      if (error?.response?.data?.message) {
        enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
      } else {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    }
  });

  useEffect(() => {
    const imageKey = currentDriver.userInfo?.coverImage || currentDriver.userInfo?.profileImageUrl;
    if (imageKey) {
      const url = resolveS3Url(imageKey);
      if (url) {
        setValue("filePreview", url, { shouldValidate: true });
      }
    }
  }, [currentDriver?.userInfo?.coverImage, currentDriver?.userInfo?.profileImageUrl, setValue]);

  const handleDrop = useCallback(
    (acceptedFiles: any[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("profileImage", file);
        setValue("filePreview", newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentDriver && (
              <Label
                color={
                  (values.status === "ACTIVE" && "success") ||
                  (values.status === "SUSPEND" && "error") ||
                  "warning"
                }
                sx={{ position: "absolute", top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
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

            <RHFSelect 
              name="subscription" 
              label="Subscription" 
              sx={{ mb: 3 }}
            >
              {DRIVER_SUBSCRIPTION_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="companyId"
              label="Company"
              sx={{ mb: 3 }}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {companies.map((company: any) => (
                <MenuItem key={company.id} value={company.id}>
                  {company?.name || company?.companyName || company?.email || company?.id}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSwitch
              name="depositPaid"
              labelPlacement="start"
              label={<>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Deposit Paid
                </Typography>
              </>}
              sx={{ mx: 0, width: 1, justifyContent: "space-between" }} helperText={undefined}            />
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
              <RHFTextField name="firstName" label="First Name" disabled />
              <RHFTextField name="lastName" label="Last Name" disabled />
              <RHFTextField
                name="emailAddress"
                label="Email Address"
                disabled
              />
              <RHFTextField name="phone_number" label="Phone Number" disabled />
              <RHFTextField
                name="nationalInsuranceNumber"
                label="National Insurance Number"
              />
              <RHFTextField
                name="driverRecognitionNumber"
                label="Driver Recognition Number"
              />
              <RHFTextField
                name="selfAssessmentTaxId"
                label="Self Assessment Tax Id"
              />
              <RHFTextField
                name="totalJobComplete"
                label="Total Job Complete"
                disabled
              />
              <RHFTextField name="bio" label="Bio" />
              <RHFTextField name="hobby" label="Hobby" />
              <RHFTextField
                type={"number"}
                name="depositAmount"
                label="Deposit Amount"
              />
              <RHFTextField
                type={"number"}
                name="commissionPercentage"
                label="Commission Percentage"
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentDriver ? "Create Driver" : "Save Changes"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
