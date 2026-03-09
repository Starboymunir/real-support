import PropTypes from "prop-types";
import * as Yup from "yup";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import MenuItem from "@mui/material/MenuItem";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import {
  DRIVER_STATUS_OPTIONS,
  DRIVER_SUBSCRIPTION_OPTIONS,
} from "@/_mock/_drivers";
import { DatePicker } from "@mui/x-date-pickers";
import axios from "axios";
import { endpoints } from "@/lib/utils/axios";

// ----------------------------------------------------------------------

export default function DriversQuickEditForm({
  currentUser,
  open,
  onClose,
  refetch,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    phone_number: Yup.string().required("Phone number is required"),
    driverRecognitionNumber: Yup.string().required(
      "Driver Recognition Number is required"
    ),
    nationalInsuranceNumber: Yup.string().required(
      "National Insurance Number is required"
    ),
    selfAssessmentTaxId: Yup.string().required(
      "Self Assessment Tax ID is required"
    ),
    dateOfBirth: Yup.date()
      .max(new Date(), "Date of Birth cannot be in the future")
      .required("Date of Birth is required"),
    ratings: Yup.number()
      .min(0)
      .max(5, "Ratings must be between 0 and 5")
      .required("Ratings is required"),
    totalJobComplete: Yup.number()
      .min(0)
      .integer()
      .required("Total Job Complete is required"),
    bio: Yup.string().required("Bio is required"),
    hobby: Yup.string().required("Hobby is required"),
    depositePaid: Yup.boolean().required("Deposit Paid is required"),
    depositeAmount: Yup.number().min(0).required("Deposit Amount is required"),
    commision: Yup.number().min(0).required("Commission is required"),
    currentBalance: Yup.number().min(0).required("Current Balance is required"),
    subcription: Yup.string().required("Subscription is required"),
    status: Yup.string().required("Status is required"),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.userInfo?.firstName || "",
      lastName: currentUser?.userInfo?.lastName || "",
      email: currentUser?.userInfo?.email || "",
      phone_number: currentUser?.userInfo?.phone_number || "",
      driverRecognitionNumber: currentUser?.driverRecognitionNumber || "",
      nationalInsuranceNumber: currentUser?.nationalInsuranceNumber || "",
      selfAssessmentTaxId: currentUser?.selfAssessmentTaxId || "",
      dateOfBirth: currentUser?.dateOfBirth || null,
      ratings: currentUser?.ratings || 0,
      totalJobComplete: currentUser?.totalJobComplete || 0,
      bio: currentUser?.bio || "",
      hobby: currentUser?.hobby || "",
      depositePaid: currentUser?.depositePaid || false,
      depositeAmount: currentUser?.depositeAmount || 0,
      commision: currentUser?.commision || 0,
      currentBalance: currentUser?.currentBalance || 0,
      subcription: currentUser?.subcription || "",
      status: currentUser?.status || "",
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    for (const key in data) {
      if (key === "dateOfBirth" && data[key]) {
        // Convert the date to ISO-8601 format before appending
        const formattedDate = new Date(data[key]).toISOString();
        formData.append(key, formattedDate);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }

    try {
      const response = await axios.put(
        endpoints.drivers.update(currentUser?.id),
        formData
      );

      if (response.status === 200) {
        enqueueSnackbar("Update success!");
        refetch();
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Account is waiting for confirmation
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <RHFSelect name="status" label="Status">
              {DRIVER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="subcription" label="Subcription">
              {DRIVER_SUBSCRIPTION_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
            <RHFTextField name="email" label="Email Address" />
            <RHFTextField name="phone_number" label="Phone Number" />
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Date of birth"
                  value={field.value ? new Date(field.value) : null} // Convert to Date object if not null
                  onChange={(newValue) => {
                    field.onChange(newValue.toISOString()); // Convert to ISO-8601 format before setting
                  }}
                  format="dd-MM-yyyy" // ISO-8601 format
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />

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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

DriversQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
