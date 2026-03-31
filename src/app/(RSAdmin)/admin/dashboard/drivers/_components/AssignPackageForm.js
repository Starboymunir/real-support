import PropTypes from "prop-types";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { ListItemText } from "@mui/material";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import axiosInstance from "@/lib/admin-axios";

// ----------------------------------------------------------------------

export default function AssignPackageDriverForm({
  driver,
  open,
  onClose,
  refetch,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    package: Yup.object().required("Select Package"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      package: driver?.packageInfo,
    },
  });

  const {
    handleSubmit,
    setValue,
  } = methods;

  const normalizePackages = (raw) => {
    const list = Array.isArray(raw) ? raw : [];
    const seen = new Set();
    return list
      .map((pkg, idx) => ({
        ...pkg,
        _optionKey: String(pkg?.id || `${pkg?.name || "package"}-${idx}`),
      }))
      .filter((pkg) => {
        if (seen.has(pkg._optionKey)) return false;
        seen.add(pkg._optionKey);
        return true;
      });
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Admin endpoint includes all packages; request a large page to avoid empty picker.
      const { data } = await axiosInstance.get('/packages/admin?count=1000&page=1&sort=asc');
      setPackages(normalizePackages(data?.data));
    } catch (err) {
      // Fallback for non-admin roles that may only access /packages.
      try {
        const { data } = await axiosInstance.get('/packages?count=1000&page=1&sort=asc');
        setPackages(normalizePackages(data?.data));
      } catch (fallbackErr) {
        console.log("Error fetching packages:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPackages();
      setValue("package", null);
    }
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    
    try {
      setLoading(true);
      const result = await axiosInstance.patch(
        `/drivers/${driver.id}/packages/add`,
        { packageId: data.package.id }
      );
      
      if (result.data.success) {
        enqueueSnackbar(result.data.message, { variant: "success" });
        setLoading(false);
        refetch();
      }
    } catch (error) {
      console.error("Error assigning package:", error);
      enqueueSnackbar("Failed to assign package. Please try again later.", {
        variant: "error",
      });
      setLoading(false);
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
        <DialogTitle>Select Package for the Driver:</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: `repeat(1, 1fr)`,
            }}
          >
            <RHFAutocomplete
              name="package"
              label="Packages"
              options={packages}
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderOption={(props, option, state) => (
                <li {...props} key={`${option?._optionKey || option?.id || option?.name || "package"}-${state.index}`}>
                  <Box sx={{ mr: 2 }}>
                    <AwsImageRender
                      placeHolderImage={"/webAssets/images/placeholder/car.png"}
                      height={50}
                      width={50}
                      alt={option?.name}
                      imageKey={option?.coverImage}
                    />
                  </Box>
                  <Box>
                    <ListItemText
                      primary={option?.name}
                      secondary={option?.summary}
                      primaryTypographyProps={{ typography: "body2" }}
                      secondaryTypographyProps={{
                        component: "span",
                        color: "text.disabled",
                      }}
                    />
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={loading}
          >
            Assign Package
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AssignPackageDriverForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  driver: PropTypes.object,
  refetch: PropTypes.func,
};
