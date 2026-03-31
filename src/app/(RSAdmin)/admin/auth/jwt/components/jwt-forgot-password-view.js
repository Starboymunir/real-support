"use client";

import { useState, useRef } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import { PasswordIcon } from "@/config/icons";
import Iconify from "@/components/iconify/iconify";
import FormProvider from "@/app/(RSAdmin)/admin/common/hook-form/form-provider";
import RHFTextField from "@/app/(RSAdmin)/admin/common/hook-form/rhf-text-field";
import { adminAuthApi } from "@/lib/services/admin";

export default function JwtForgotPasswordView() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newPassword, 3=success
  const [email, setEmailState] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Step 1 schema
  const EmailSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Must be a valid email address"),
  });

  const methods = useForm({
    resolver: yupResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Step 1: Send OTP
  const onSubmitEmail = handleSubmit(async (data) => {
    setError("");
    try {
      await adminAuthApi.forgotPassword(data.email);
      setEmailState(data.email);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to send reset code");
    }
  });

  // Step 2: OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await adminAuthApi.resetPassword({
        email,
        otp: otpString,
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Success
  if (step === 3) {
    return (
      <Stack spacing={3} alignItems="center">
        <Iconify icon="eva:checkmark-circle-2-fill" width={96} sx={{ color: "success.main" }} />
        <Typography variant="h4">Password Reset Successful</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Your password has been reset. You can now sign in with your new password.
        </Typography>
        <Link
          component={RouterLink}
          href={paths.auth.jwt.login}
          variant="subtitle2"
          sx={{ alignItems: "center", display: "inline-flex" }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          Back to sign in
        </Link>
      </Stack>
    );
  }

  // Step 2: OTP + new password
  if (step === 2) {
    return (
      <form onSubmit={handleResetPassword}>
        <Stack spacing={3} alignItems="center">
          <PasswordIcon sx={{ height: 96 }} />
          <Typography variant="h4">Reset Your Password</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
            Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={1} justifyContent="center">
            {otp.map((digit, i) => (
              <TextField
                key={i}
                inputRef={(el) => { inputRefs.current[i] = el; }}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    width: "2.5rem",
                    padding: "12px 0",
                  },
                  inputMode: "numeric",
                }}
                variant="outlined"
              />
            ))}
          </Stack>

          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
          >
            Reset Password
          </LoadingButton>

          <Link
            component="button"
            type="button"
            variant="subtitle2"
            onClick={() => {
              setStep(1);
              setOtp(["", "", "", "", "", ""]);
              setNewPassword("");
              setConfirmPassword("");
              setError("");
            }}
            sx={{ alignItems: "center", display: "inline-flex" }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={16} />
            Back
          </Link>
        </Stack>
      </form>
    );
  }

  // Step 1: Email
  return (
    <FormProvider methods={methods} onSubmit={onSubmitEmail}>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Forgot your password?</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Please enter the email address associated with your account and we
          will email you a code to reset your password.
        </Typography>
      </Stack>

      <Stack spacing={3} alignItems="center">
        {error && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        )}

        <RHFTextField name="email" label="Email address" />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Send Reset Code
        </LoadingButton>

        <Link
          component={RouterLink}
          href={paths.auth.jwt.login}
          color="inherit"
          variant="subtitle2"
          sx={{ alignItems: "center", display: "inline-flex" }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          Return to sign in
        </Link>
      </Stack>
    </FormProvider>
  );
}
