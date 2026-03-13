import PropTypes from "prop-types";
import * as yup from "yup";
import { useMemo, Dispatch, SetStateAction } from "react";
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
import { updateCarLegalInfo } from "@/server/Document";

interface LegalInfoQuickEditFormProps {
  currentDocument: any;
  open: boolean;
  onClose: () => void;
  setChangeFlag: Dispatch<SetStateAction<boolean>>;
}

export default function LegalInfoQuickEditForm({
  currentDocument,
  open,
  onClose,
  setChangeFlag,
}: LegalInfoQuickEditFormProps) {
  const { enqueueSnackbar } = useSnackbar();

  const CarSchema = yup.object().shape({
    motPassDate: yup.string().required("Mot Pass Date is required"),
    insurenceExpiryDate: yup
      .string()
      .required("Insurance expiry date is required"),
    pcoVehicleLicenseExpiryDate: yup
      .string()
      .required("Pco Vehilce License expiry date is required"),
  });

  const defaultValues = useMemo(
    () => ({
      pcoVehicleLicenseExpiryDate:
        currentDocument?.pCOVehicleLicense?.pcoVehicleLicenseExpiryDate || "",
      insurenceExpiryDate:
        currentDocument?.insuranceDocument?.insurenceExpiryDate || "",
      motPassDate: currentDocument?.motDocument?.motPassDate || "",
    }),
    [currentDocument]
  );

  const methods = useForm({
    resolver: yupResolver(CarSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { statusCode, message } = await updateCarLegalInfo(
        currentDocument?.id,
        data
      );
      if (statusCode == 200) {
        enqueueSnackbar(message);
        setChangeFlag((prev) => !prev);
        onClose();
      } else {
        enqueueSnackbar(message, { variant: "error" });
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
        <DialogTitle>Update Car Document Legal Info</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            py={5}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <Controller
              name="motPassDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Mot Pass Date"
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

            <Controller
              name="insurenceExpiryDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Insurance expiry date"
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

            <Controller
              name="pcoVehicleLicenseExpiryDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Pco Vehilce License expiry date"
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
