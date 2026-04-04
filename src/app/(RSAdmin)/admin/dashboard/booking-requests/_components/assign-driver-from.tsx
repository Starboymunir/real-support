import * as Yup from "yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
} from "@mui/material";
import { useDriversQuery } from "@/hooks/Drivers";
import { IBookingType, IDriver } from "@/types/type";
import { apiClient } from "@/lib/ApiClient";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { LoadingScreen } from "../../../common/loading-screen";

// ----------------------------------------------------------------------

export default function AssignQuickEditForm({
  row,
  open,
  onClose,
}: {
  row: any;
  open: boolean;
  onClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { data: allDrivers = [], isPending } = useDriversQuery();
  // Only show ACTIVE drivers who have the request's package assigned
  const drivers = allDrivers.filter((d: IDriver) => {
    const dr = d as any;
    if (dr.status !== 'ACTIVE') return false;
    if (!row?.packageId) return true;
    return Array.isArray(dr.packageIDs) && dr.packageIDs.includes(row.packageId);
  });
  const router = useRouter();

  const schema = Yup.object().shape({
    driverId: Yup.string().required("Driver is required"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue, watch } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        driverId: data.driverId,
        requestId: row.id,
      };

      const response = await apiClient.post<IBookingType>("/bookings", payload);
      if (!response.success) {
        enqueueSnackbar(response.message || "Failed to assign driver", { variant: "error" });
        return;
      }
      enqueueSnackbar("Driver assigned successfully");
      onClose();
      router.push("/admin/dashboard/bookings");
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.message || "Failed to assign driver";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  });

  const load = isPending || loading

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
      {load ? (
        <LoadingScreen />
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Select Driver For Create Booking</DialogTitle>

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
              {drivers.length === 0 && !isPending && (
                <Box sx={{ py: 1, color: "warning.main", fontSize: 14 }}>
                  No eligible drivers for this package. Make sure at least one active driver has this package assigned.
                </Box>
              )}
              <RHFAutocomplete
                name="driverId"
                label="Driver"
                placeholder="Select driver"
                options={drivers}
                getOptionLabel={(option) =>
                  `${option?.userInfo?.firstName ?? ""} ${
                    option?.userInfo?.lastName ?? ""
                  }`
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                renderOption={(props, option) => {
                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box sx={{ mr: 1 }}>
                        <AwsImageAvatar
                          alt={option?.userInfo?.firstName}
                          imageKey={option?.profileImage}
                        />
                      </Box>
                      <Box>
                        <ListItemText
                          primary={`${option?.userInfo?.firstName ?? ""} ${
                            option?.userInfo?.lastName ?? ""
                          }`}
                          secondary={option?.userInfo?.emailAddress}
                          primaryTypographyProps={{ typography: "body2" }}
                          secondaryTypographyProps={{
                            component: "span",
                            color: "text.disabled",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                }}
                onChange={(
                  _: React.SyntheticEvent<Element, Event>,
                  newValue: IDriver
                ) => setValue("driverId", newValue?.id || "")} // store id only
                value={
                  drivers.find((driver) => driver.id === watch("driverId")) ||
                  null
                }
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>

            <LoadingButton type="submit" variant="contained" loading={loading}>
              Assign To Driver
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      )}
    </Dialog>
  );
}
