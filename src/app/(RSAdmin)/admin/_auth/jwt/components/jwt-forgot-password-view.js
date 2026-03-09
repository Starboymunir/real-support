"use client";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import { PasswordIcon } from "@/config/icons";
import Iconify from "@/components/iconify/iconify";
import FormProvider, {
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import axiosInstance, { endpoints } from "@/lib/utils/axios";

export default function JwtForgotPasswordView() {
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .test(
        "email-format",
        "Email must be a valid email address with @ and .com domain",
        (value) => {
          if (value) {
            return value.includes("@") && value.includes(".com");
          }
          return true;
        }
      ),
  });

  const defaultValues = {
    email: "",
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    axiosInstance
      .post(endpoints.admin.userValidation, data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Send Request
      </LoadingButton>

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
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Forgot your password?</Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Please enter the email address associated with your account and We
          will email you a otp to reset your password.
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
