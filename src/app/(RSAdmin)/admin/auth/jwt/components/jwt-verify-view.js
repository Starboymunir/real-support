"use client";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { EmailInboxIcon } from "@/config/icons";
import Iconify from "@/components/iconify/iconify";
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import FormProvider from "@/app/(RSAdmin)/admin/common/hook-form/form-provider";
import RHFCode from "@/app/(RSAdmin)/admin/common/hook-form/rhf-code";
import axiosInstance, { endpoints } from "@/lib/utils/axios";

export default function JwtVerifyOtp() {
  const VerifySchema = Yup.object().shape({
    code: Yup.string()
      .min(6, "Code must be at least 6 characters")
      .required("Code is required"),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
  });

  const defaultValues = {
    code: "",
    email: "",
  };

  const methods = useForm({
    mode: "onChange",
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    axiosInstance
      .post(endpoints.admin.verifyOtp, data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFCode name="code" />

      <LoadingButton
        href={paths.auth.jwt.newPassword}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Verify
      </LoadingButton>

      <Typography variant="body2">
        {`Don’t have a code? `}
        <Link
          variant="subtitle2"
          sx={{
            cursor: "pointer",
          }}
        >
          Resend code
        </Link>
      </Typography>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: "center",
          display: "inline-flex",
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <EmailInboxIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Please check your email!</Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          We have emailed a 6-digit confirmation code to acb@domain, please
          enter the code in below box to verify your email.
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
