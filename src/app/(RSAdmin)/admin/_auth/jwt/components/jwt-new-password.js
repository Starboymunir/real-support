"use client";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import FormProvider, {
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { useAuthContext } from "@/app/(RSAdmin)/admin/_auth/hooks";

export default function JwtNewPassword() {
  const { changePassword, user } = useAuthContext();
  const password = useBoolean();
  const newPassword = useBoolean();
  const confirmPassword = useBoolean();
  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Old Password must be at least 6 characters")
      .required("Old Password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });
  const defaultValues = {
    email: "",
    password: "",
    newPassword: "",
  };
  const methods = useForm({
    mode: "onChange",

    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    await changePassword?.(user.email, data.password, data.newPassword);
    reset();
  });
  const renderForm = (
    <Stack spacing={5}>
      <RHFTextField
        name="password"
        label="Old Password"
        type={password.value ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
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
      <RHFTextField
        name="newPassword"
        label="New Password"
        type={newPassword.value ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPassword.onToggle} edge="end">
                <Iconify
                  icon={
                    newPassword.value
                      ? "solar:eye-bold"
                      : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <RHFTextField
        name="confirmPassword"
        label="Confirm New Password"
        type={confirmPassword.value ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify
                  icon={
                    confirmPassword.value
                      ? "solar:eye-bold"
                      : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Update Password
      </LoadingButton>
    </Stack>
  );
  const renderHead = (
    <>
      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Update Your Password!</Typography>
      </Stack>
    </>
  );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack
        sx={{
          py: 7,
          mx: "auto",
          maxWidth: 400,
          minHeight: "70vh",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {renderHead}

        {renderForm}
      </Stack>
    </FormProvider>
  );
}
