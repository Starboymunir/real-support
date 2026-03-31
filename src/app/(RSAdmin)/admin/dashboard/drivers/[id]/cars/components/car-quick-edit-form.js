import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { CAR_STATUS_OPTIONS } from "@/_mock/_drivers";
import { MenuItem, Typography } from "@mui/material";
import axios from "axios";
import { endpoints } from "@/lib/utils/axios";
import { fData } from "@/lib/utils/format-number";
import { resolveS3Url } from '@/lib/api';

// ----------------------------------------------------------------------

export default function CarsQuickEditForm({
  currentCar,
  open,
  onClose,
  setCurrentCar,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const CarSchema = Yup.object().shape({
    color: Yup.string(),
    engine: Yup.string(),
    make: Yup.string(),
    model: Yup.string(),
    year: Yup.string(),
    numberPlate: Yup.string().required("Number Plate is required"),
  });

  const defaultValues = useMemo(
    () => ({
      color: currentCar?.color || "",
      engine: currentCar?.engine || "",
      make: currentCar?.make || "",
      model: currentCar?.model || "",
      year: currentCar?.year || "",
      numberPlate: currentCar?.numberPlate || "",
    }),
    [currentCar]
  );

  const methods = useForm({
    resolver: yupResolver(CarSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    delete data.filePreview
    const formData = new FormData();

    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
    try {
      const response = await axios.put(
        endpoints.cars.update("null", currentCar?.id),
        formData
      );

      if (response.status === 200) {
        setCurrentCar(response.data.data);
        enqueueSnackbar("Update success!");
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (currentCar?.carImage) {
      const url = resolveS3Url(currentCar.carImage);
      if (url) {
        setValue("filePreview", { preview: url }, { shouldValidate: true });
      }
    }
  }, [currentCar?.carImage, setValue]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("carImage", file);
        setValue("filePreview", newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

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
        <DialogTitle>Update Car</DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 5 }}>
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
          >

            <RHFTextField name="color" label="Color" />
            <RHFTextField name="engine" label="Engine" />
            <RHFTextField name="make" label="Make" />
            <RHFTextField name="model" label="Model" />
            <RHFTextField name="year" label="Year" />
            <RHFTextField name="numberPlate" label="Number Plate" />
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

CarsQuickEditForm.propTypes = {
  currentCar: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  setCurrentCar: PropTypes.func,
};
