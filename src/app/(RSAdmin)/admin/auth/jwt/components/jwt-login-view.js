"use client";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "next/navigation";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import { useAuth } from "@/lib/auth-context";
import Iconify from "@/components/iconify/iconify";
import FormProvider from "@/app/(RSAdmin)/admin/common/hook-form/form-provider";
import RHFTextField from "@/app/(RSAdmin)/admin/common/hook-form/rhf-text-field";
// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { adminLogin } = useAuth();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState("");

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Must be a valid email address"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg("");
      await adminLogin({ emailAddress: data.email, password: data.password });
      router.replace(paths.dashboard.root);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === "string" ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 4 }}>
      {/* Mobile-only logo */}
      <Box
        component="img"
        alt="RS Ride"
        src="/assets/logo.png"
        sx={{
          width: 64,
          height: 64,
          objectFit: "contain",
          mb: 1,
          display: { xs: "block", md: "none" },
        }}
      />
      <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
        Sign in to your admin dashboard
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField
        name="email"
        label="Email address"
        InputLabelProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&.Mui-focused fieldset": { borderColor: "#00E676" },
          },
        }}
      />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? "text" : "password"}
        InputLabelProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&.Mui-focused fieldset": { borderColor: "#00E676" },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={password.onToggle}
                edge="end"
                sx={{ color: "rgba(255,255,255,0.5)" }}
              >
                <Iconify
                  icon={
                    password.value ? "solar:eye-bold" : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link
        href={paths.auth.jwt.forgotPassword}
        variant="body2"
        underline="hover"
        sx={{
          alignSelf: "flex-end",
          color: "#00E676",
          "&:hover": { color: "#00C853" },
        }}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          mt: 1,
          bgcolor: "#00E676",
          color: "#070D18",
          fontWeight: 700,
          fontSize: "1rem",
          py: 1.5,
          "&:hover": { bgcolor: "#00C853" },
          "&.Mui-disabled": { bgcolor: "rgba(0,230,118,0.3)" },
        }}
      >
        Sign In
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}
