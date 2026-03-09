import * as yup from "yup";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { updateLegalInfo } from "@/server/Document";
import { Document } from "@/lib/interface-types/driver-types";

type LegalInfoFormValues = {
  LicenseNumber: string;
  LicenseExpiryDate: string;
  sortCode: string;
  accountNumber: string;
  bankName: string;
  pcoBadgeNumber: string;
  pcoBadgeExpiryDate: string;
  passportNumber: string;
  passportExpiryDate: string;
  workPermitCode: string;
  houseNumber: string;
  state: string;
  addressCode: string;
  streetAddress: string;
  city: string;
};

interface LegalInfoQuickEditFormProps {
  currentDocument: Document;
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}

export default function LegalInfoQuickEditForm({
  currentDocument,
  open,
  onClose,
  refetch,
}: LegalInfoQuickEditFormProps) {
  const { enqueueSnackbar } = useSnackbar();

  const CarSchema = yup.object().shape({
    LicenseNumber: yup.string().required("License number is required"),
    LicenseExpiryDate: yup.string().required("License expiry date is required"),
    sortCode: yup.string().required("Sort code is required"),
    accountNumber: yup.string().required("Account number is required"),
    bankName: yup.string().required("Bank name is required"),
    pcoBadgeNumber: yup.string().required("PCO badge number is required"),
    pcoBadgeExpiryDate: yup
      .string()
      .required("PCO badge expiry date is required"),
    passportNumber: yup.string().required("Passport number is required"),
    passportExpiryDate: yup
      .string()
      .required("Passport expiry date is required"),
    workPermitCode: yup.string().required("Work permit code is required"),
    houseNumber: yup.string().required("House Number is required"),
    state: yup.string().required("State is required"),
    addressCode: yup.string().required("Address code is required"),
    streetAddress: yup.string().required("Street Address is required"),
    city: yup.string().required("City is required"),
  });

  const defaultValues: LegalInfoFormValues = useMemo(
    () => ({
      LicenseNumber: (currentDocument?.drivingLicense as any)?.LicenseNumber || "",
      LicenseExpiryDate: (currentDocument?.drivingLicense as any)?.LicenseExpiryDate
        ? new Date((currentDocument?.drivingLicense as any).LicenseExpiryDate).toISOString()
        : "",
      sortCode: currentDocument?.bankDocuments?.sortCode || "",
      accountNumber: currentDocument?.bankDocuments?.accountNumber || "",
      bankName: currentDocument?.bankDocuments?.bankName || "",
      pcoBadgeNumber: currentDocument?.pcoDocuments?.pcoBadgeNumber || "",
      pcoBadgeExpiryDate: currentDocument?.pcoDocuments?.pcoBadgeExpiryDate
        ? new Date(currentDocument.pcoDocuments.pcoBadgeExpiryDate).toISOString()
        : "",
      passportNumber: currentDocument?.passport?.passportNumber || "",
      passportExpiryDate: currentDocument?.passport?.passportExpiryDate
        ? new Date(currentDocument.passport.passportExpiryDate).toISOString()
        : "",
      workPermitCode: currentDocument?.workPermitCode || "",
      houseNumber: currentDocument?.addressProfDocs?.houseNumber || "",
      state: currentDocument?.addressProfDocs?.state || "",
      addressCode: currentDocument?.addressProfDocs?.addressCode || "",
      streetAddress: currentDocument?.addressProfDocs?.streetAddress || "",
      city: currentDocument?.addressProfDocs?.city || "",
    }),
    [currentDocument]
  );

  const methods = useForm<LegalInfoFormValues>({
    resolver: yupResolver<LegalInfoFormValues>(CarSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { statusCode, message } = await updateLegalInfo(
        currentDocument?.id,
        data
      );
      if (statusCode == 200) {
        enqueueSnackbar(message);
        refetch();
        onClose();
      }
      enqueueSnackbar(message, { variant: "error" });
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
        <DialogTitle>Update Document Legal Info</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            py={5}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <RHFTextField name="LicenseNumber" label="License Number" />

            <Controller
              name="LicenseExpiryDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="License Expiry Date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? new Date(newValue as any).toISOString() : "");
                  }}
                  format="dd-MM-yyyy"
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
            <RHFTextField name="sortCode" label="Sort Code" />
            <RHFTextField name="accountNumber" label="Account Number" />
            <RHFTextField name="bankName" label="Bank Name" />
            <RHFTextField name="pcoBadgeNumber" label="PCO Badge Number" />

            <Controller
              name="pcoBadgeExpiryDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="PCO Badge Expiry Date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? new Date(newValue as any).toISOString() : "");
                  }}
                  format="dd-MM-yyyy"
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
            <RHFTextField name="passportNumber" label="Passport Number" />

            <Controller
              name="passportExpiryDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Passport Expiry Date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? new Date(newValue as any).toISOString() : "");
                  }}
                  format="dd-MM-yyyy"
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

            <RHFTextField name="houseNumber" label="House Number" />
            <RHFTextField name="state" label="State" />
            <RHFTextField name="addressCode" label="Address Code" />
            <RHFTextField name="streetAddress" label="Street Address" />
            <RHFTextField name="city" label="City" />
            <RHFTextField name="workPermitCode" label="Work Permit Code" />
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
