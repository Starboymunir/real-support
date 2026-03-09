"use client";

// import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useMemo } from "react";
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
import { MenuItem, Typography } from "@mui/material";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import axiosInstance from "@/lib/axios";
import { useAdminUsersQuery } from "@/hooks/Admin";
import { IAdmin, ICompany } from "@/types/type";

// ----------------------------------------------------------------------

export default function CompanyNewEditForm({
  currentCompany,
}: {
  currentCompany?: ICompany;
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: adminUsers = [] } = useAdminUsersQuery();

  const NewCompanySchema = Yup.object().shape({
    companyName: Yup.string().required("Name is required"),
    description: Yup.string(),
    companyEmail: Yup.string().required("Company Email is required"),
    phone_number: Yup.string().required("Company Phone is required"),
    password: Yup.string().required("Password is required"),
    contactPerson: Yup.string().required("Admin/User Id is required"),
  });

  const defaultValues = useMemo(
    () => ({
      companyName: currentCompany?.companyName || "",
      companyEmail: currentCompany?.companyEmail || "",
      description: currentCompany?.description || "",
      phone_number: currentCompany?.phone_number || "",
      password: currentCompany?.password || "",
      contactPerson: currentCompany?.userInfo?.id || "", // Use admin ID
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

  const onSubmit = handleSubmit(async (payload) => {
    try {
      const formattedPhone = payload.phone_number.split(" ").join("");
      const phone = payload.phone_number.startsWith("+")
        ? formattedPhone
        : `+${formattedPhone}`;

      if (!currentCompany) {
        const { data } = await axiosInstance.post("/company/create-company", {
          ...payload,
          phone_number: phone,
        });

        if (data.success === true) {
          enqueueSnackbar("Company Created Successfully");
          router.push(paths.dashboard.companies.list);
        }
      } else {
        const { data } = await axiosInstance.patch(
          `/company/updateById/${currentCompany.id}`,
          payload
        );
        if (data.success === true) {
          enqueueSnackbar("Company Updated Successfully");
          router.push(paths.dashboard.companies.list);
        }
      }
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
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
        // setValue("coverImage", file);
        // setValue("filePreview", newFile, { shouldValidate: true });
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
              <RHFTextField name="companyName" label="CompanyName" />
              <RHFTextField
                name="companyEmail"
                label="Company Email"
                type="email"
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
              <RHFTextField
                type="string"
                name="phone_number"
                label="Company Phone"
              />
              <RHFTextField name="password" label="Password" />
              <RHFSelect
                name="contactPerson"
                label={
                  !currentCompany ? "Select Contact Person" : "Contact Person"
                }
                placeholder="Select a contact person"
                // options={adminUsers.map((option: IAdmin) => option.id)}
              >
                <MenuItem value="" disabled>
                  Select a contact person
                </MenuItem>
                {adminUsers.map((admin: IAdmin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin?.userProfile?.firstName}{" "}
                    {admin?.userProfile?.lastName}
                  </MenuItem>
                ))}
              </RHFSelect>
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
