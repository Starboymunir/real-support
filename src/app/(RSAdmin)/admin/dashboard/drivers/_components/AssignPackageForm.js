import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
  RHFAutocomplete,
  RHFUpload,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { endpoints } from "@/lib/utils/axios";
import axios from "axios";
import { getUrl } from "aws-amplify/storage";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { ListItemText } from "@mui/material";
import {
  assignPackageDriver,
  getAllOnlineDrivers,
  assignPackages,
} from "@/server/Driver";
import { useSocket } from "@/providers/SocketProvider";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import axiosInstance from "@/lib/axios";

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
  const { socket } = useSocket();

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
    formState: { errors },
  } = methods;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(endpoints.packages.allPackages);
      setPackages(data);
    } catch (err) {
      console.log("Error in  fetching packages :", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

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
              options={packages.map((option) => option)}
              getOptionLabel={(option) => option.name}
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
