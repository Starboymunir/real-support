"use client";

// import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  RHFSelect,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { fData } from "@/lib/utils/format-number";
import { Divider, MenuItem, Typography } from "@mui/material";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import axiosInstance from "@/lib/admin-axios";
import { useAdminUsersQuery } from "@/hooks/Admin";
import { IAdmin, ICompany } from "@/types/type";
import { useQueryClient } from "@tanstack/react-query";
import { uploadImageFile } from "@/helpers/imageUpload";
import { resolveS3Url } from '@/lib/api';

// ----------------------------------------------------------------------

export default function CompanyNewEditForm({
  currentCompany,
}: {
  currentCompany?: ICompany;
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data: adminUsers = [] } = useAdminUsersQuery();

  const NewCompanySchema = Yup.object().shape({
    companyName: Yup.string().required("Name is required"),
    companyCode: Yup.string(),
    description: Yup.string(),
    companyEmail: Yup.string().required("Company Email is required"),
    phone_number: Yup.string().required("Company Phone is required"),
    HMRC_RegistrationNumber: Yup.string(),
    VAT_RegistrationNumber: Yup.string(),
    PCO_OperatorLicenseNumber: Yup.string(),
    PCO_OperatorLicenseExpiryDate: Yup.string(),
    PCO_OperatorLicenseIssueDate: Yup.string(),
    houseNumber: Yup.string(),
    streetName: Yup.string(),
    postCode: Yup.string(),
    city: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      companyName: currentCompany?.companyName || "",
      companyCode: (currentCompany as any)?.companyCode || "",
      coverImage: currentCompany?.coverImage || null,
      filePreview: null,
      companyEmail: currentCompany?.companyEmail || "",
      description: currentCompany?.description || "",
      phone_number: currentCompany?.phone_number || "",
      HMRC_RegistrationNumber: (currentCompany as any)?.HMRC_RegistrationNumber || "",
      VAT_RegistrationNumber: (currentCompany as any)?.VAT_RegistrationNumber || "",
      PCO_OperatorLicenseNumber: (currentCompany as any)?.PCO_OperatorLicenseNumber || "",
      PCO_OperatorLicenseExpiryDate: (currentCompany as any)?.PCO_OperatorLicenseExpiryDate
        ? new Date((currentCompany as any).PCO_OperatorLicenseExpiryDate).toISOString().split("T")[0]
        : "",
      PCO_OperatorLicenseIssueDate: (currentCompany as any)?.PCO_OperatorLicenseIssueDate
        ? new Date((currentCompany as any).PCO_OperatorLicenseIssueDate).toISOString().split("T")[0]
        : "",
      houseNumber: (currentCompany as any)?.companyAddress?.houseNumber || "",
      streetName: (currentCompany as any)?.companyAddress?.streetName || "",
      postCode: (currentCompany as any)?.companyAddress?.postCode || "",
      city: (currentCompany as any)?.companyAddress?.city || "",
    }),
    [currentCompany]
  );

  const methods = useForm({
    resolver: yupResolver(NewCompanySchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Prefill cover image when editing
  useEffect(() => {
    if (currentCompany?.coverImage && typeof currentCompany.coverImage === "string") {
      const url = resolveS3Url(currentCompany.coverImage);
      if (url) {
        setValue("filePreview" as any, url, { shouldValidate: true });
        setValue("coverImage" as any, currentCompany.coverImage, { shouldValidate: true });
      }
    }
  }, [currentCompany?.coverImage, setValue]);

  const onSubmit = handleSubmit(async (payload) => {
    try {
      const formattedPhone = payload.phone_number.split(" ").join("");
      const phone = payload.phone_number.startsWith("+")
        ? formattedPhone
        : `+${formattedPhone}`;

      let coverImage = (payload as any).coverImage ?? undefined;
      if (coverImage instanceof File) {
        const uploadedKey = await uploadImageFile(coverImage);
        if (!uploadedKey) {
          throw new Error("Image upload failed. Please try another image.");
        }
        coverImage = uploadedKey;
      }
      delete (payload as any).filePreview;

      // Build address object (only if any address field is provided)
      const hasAddress = payload.streetName || payload.city || payload.postCode || payload.houseNumber;
      const companyAddress = hasAddress
        ? {
            houseNumber: payload.houseNumber || "",
            streetName: payload.streetName || "",
            postCode: payload.postCode || "",
            city: payload.city || "",
          }
        : undefined;

      const submitData: Record<string, any> = {
        companyName: payload.companyName,
        companyEmail: payload.companyEmail,
        description: payload.description,
        phone_number: phone,
        ...(payload.companyCode && { companyCode: payload.companyCode }),
        HMRC_RegistrationNumber: payload.HMRC_RegistrationNumber || undefined,
        VAT_RegistrationNumber: payload.VAT_RegistrationNumber || undefined,
        PCO_OperatorLicenseNumber: payload.PCO_OperatorLicenseNumber || undefined,
        ...(payload.PCO_OperatorLicenseExpiryDate && {
          PCO_OperatorLicenseExpiryDate: new Date(payload.PCO_OperatorLicenseExpiryDate).toISOString(),
        }),
        ...(payload.PCO_OperatorLicenseIssueDate && {
          PCO_OperatorLicenseIssueDate: new Date(payload.PCO_OperatorLicenseIssueDate).toISOString(),
        }),
        ...(typeof coverImage === "string" && coverImage.trim().length > 0 && {
          coverImage,
        }),
        ...(companyAddress && { companyAddress }),
      };

      if (!currentCompany) {
        const { data } = await axiosInstance.post("/company/create-company", submitData);

        if (data.success === true) {
          queryClient.invalidateQueries({ queryKey: ["all_companies"] });
          enqueueSnackbar("Company Created Successfully");
          router.push(paths.dashboard.companies.list);
        }
      } else {
        const { data } = await axiosInstance.patch(
          `/company/updateById/${currentCompany.id}`,
          submitData
        );
        if (data.success === true) {
          queryClient.invalidateQueries({ queryKey: ["all_companies"] });
          queryClient.invalidateQueries({ queryKey: ["company", currentCompany.id] });
          enqueueSnackbar("Company Updated Successfully");
          router.push(paths.dashboard.companies.list);
        }
      }
    } catch (error: any) {
      const msg = typeof error === 'string' ? error : error?.message || 'Something went wrong';
      enqueueSnackbar(msg, { variant: "error" });
      console.log("error===", error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: any) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("coverImage" as any, file);
        setValue("filePreview" as any, newFile, { shouldValidate: true });
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

            {/* Basic Information */}
            <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField name="companyName" label="Company Name" />
              <RHFTextField
                name="companyCode"
                label="Company ID"
                placeholder={currentCompany ? "" : "Auto-generated if left blank"}
                helperText="Unique code drivers use to join this company"
              />
              <RHFTextField
                name="companyEmail"
                label="Company Email"
                type="email"
              />
              <RHFTextField
                type="string"
                name="phone_number"
                label="Company Phone"
              />
              <RHFSelect
                name="contactPerson"
                label={
                  !currentCompany ? "Select Contact Person" : "Contact Person"
                }
                placeholder="Select a contact person"
              >
                <MenuItem value="" disabled>
                  Select a contact person
                </MenuItem>
                {adminUsers.map((admin: IAdmin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin?.firstName || admin?.userProfile?.firstName}{" "}
                    {admin?.lastName || admin?.userProfile?.lastName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 1fr)",
              }}
              marginTop={3}
            >
              <RHFTextField name="description" label="Description" multiline rows={3} />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Registration & Licensing */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Registration &amp; Licensing
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(3, 1fr)",
              }}
            >
              <RHFTextField name="HMRC_RegistrationNumber" label="HMRC Registration Number" />
              <RHFTextField name="VAT_RegistrationNumber" label="VAT Registration Number" />
              <RHFTextField name="PCO_OperatorLicenseNumber" label="PCO Operator License Number" />
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
              marginTop={3}
            >
              <RHFTextField
                name="PCO_OperatorLicenseIssueDate"
                label="PCO License Issue Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField
                name="PCO_OperatorLicenseExpiryDate"
                label="PCO License Expiry Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Company Address */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Company Address
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField name="houseNumber" label="House Number" />
              <RHFTextField name="streetName" label="Street Name" />
              <RHFTextField name="postCode" label="Post Code" />
              <RHFTextField name="city" label="City" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentCompany ? "Create Company" : "Save Company"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
