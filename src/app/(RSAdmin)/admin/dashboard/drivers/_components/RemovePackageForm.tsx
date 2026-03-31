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
import axiosInstance from "@/lib/admin-axios";
import { IDriver } from "@/types/type";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";

// ----------------------------------------------------------------------

export default function RemovePackageDriverForm({
  driver,
  open,
  onClose,
  refetch,
}: {
  driver: IDriver;
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    package: Yup.object().required("Select Package"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      package: null,
    },
  });

  const {
    handleSubmit,
    setValue,
  } = methods;

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/packages/admin?count=1000&page=1&sort=asc');
      const allPackages = Array.isArray(data?.data) ? data.data : [];
      const assigned = allPackages.filter((pkg: any) =>
        (driver?.packageIDs || []).includes(pkg.id)
      );
      setPackages(assigned);
    } catch (err) {
      try {
        const { data } = await axiosInstance.get('/packages?count=1000&page=1&sort=asc');
        const allPackages = Array.isArray(data?.data) ? data.data : [];
        const assigned = allPackages.filter((pkg: any) =>
          (driver?.packageIDs || []).includes(pkg.id)
        );
        setPackages(assigned);
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
  }, [open, driver?.id]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const result = await axiosInstance.patch(
        `/drivers/${driver.id}/packages/remove`,
        { packageId: data.package?.id }
      );

      if (result.data.success) {
        enqueueSnackbar(result.data.message, { variant: "success" });
        setLoading(false);
        refetch();
      }
    } catch (error) {
      console.error("Error removing package:", error);
      enqueueSnackbar("Failed to remove package. Please try again later.", {
        variant: "error",
      });
    } finally {
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
        <DialogTitle>Select Package for Remove</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
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
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
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
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={loading}>
            Remove Package
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}