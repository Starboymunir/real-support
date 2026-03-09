import PropTypes from "prop-types";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { Grid, ListItemText, MenuItem, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { getAllOnlineDrivers } from "@/server/Driver";
import { useSocket } from "@/providers/SocketProvider";
import { convertToISOTime } from "@/lib/utils";
import { paths } from "../../../routes/paths";
import { LoadingScreen } from "../../../common/loading-screen";

const statusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "ACCEPTED", label: "ACCEPTED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "COMPLETED", label: "COMPLETED" },
];

const paymentType = [
  { value: "CASH", label: "CASH" },
  { value: "WALLET", label: "WALLET" },
  { value: "CASHANDWALLET", label: "CASHANDWALLET" },
  { value: "CARD", label: "CARD" },
  { value: "BANK_TRANSFER", label: "BANK_TRANSFER" },
  { value: "INVOICE", label: "INVOICE" },
];

const addressSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  latitude: Yup.string().required("latitude is required"),
  longitude: Yup.string().required("longitude is required"),
  postCode: Yup.string(),
  houseNumber: Yup.string(),
  streetName: Yup.string(),
  city: Yup.string(),
});

export default function BookingNewEditForm({ currentData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [isSubmiting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const { socket } = useSocket();

  const BookingSchema = Yup.object().shape({
    bookingDate: Yup.string().required("Date is required"),
    bookingTime: Yup.string().required("Time is required"),
    driver: Yup.object(),
    driverName: Yup.string()
      .required()
      .min(1, "Servive Partner name is Required"),
    servicePartnerPhone: Yup.string()
      .required()
      .min(9, "Servive Partner Phone number is required"),
    servicePartnerEmail: Yup.string().email().required("Invalid email address"),
    status: Yup.string().required("Status is required"),
    paymentType: Yup.string().required("Payment Type is required"),
    paymentStatus: Yup.boolean().required("Payment Status is required"),
    commission: Yup.number().required("commission is required"),
    totalDistance: Yup.string().required("Total Distance is required"),
    totalDistanceTime: Yup.string().required("Total Distance Time is required"),
    totalWaitingTime: Yup.string(),
    passengerRating: Yup.number().max(5),
    driverRating: Yup.number().max(5),
    driverReview: Yup.string(),
    passengerReview: Yup.string(),
    nationalInsuranceNumber: Yup.string().required(
      "National Insurance Number is required"
    ),
    selfAssessmentTaxId: Yup.string().required(
      "Self Assesment Tax Id is required"
    ),
    vehicleNumberPlate: Yup.string().required(
      "Vehicle Number Plate is required"
    ),
    totalBill: Yup.string().required("Total Bill is required"),
    discountAmount: Yup.string().required("Discount Amount is required"),
  });

  const defaultValues = {
    bookingDate: new Date(currentData?.bookingDate)?.toISOString() || "",
    bookingTime: currentData?.bookingTime || "",
    driver: currentData?.driverInfo || {},
    driverName: currentData?.driverName || "",
    servicePartnerPhone: currentData?.servicePartnerPhone || "",
    servicePartnerEmail: currentData?.servicePartnerEmail || "",
    status: currentData?.status || "",
    paymentType: currentData?.paymentType || "",
    paymentStatus: currentData?.paymentStatus || false,
    commission: currentData?.commission || 0,
    totalDistance: currentData?.totalDistance || "",
    totalDistanceTime: currentData?.totalDistanceTime || "",
    totalWaitingTime: currentData?.totalWaitingTime || "",
    passengerRating: currentData?.passengerRating || null,
    driverRating: currentData?.driverRating || null,
    driverReview: currentData?.driverReview || "",
    passengerReview: currentData?.passengerReview || "",
    nationalInsuranceNumber: currentData?.nationalInsuranceNumber || "",
    selfAssessmentTaxId: currentData?.selfAssessmentTaxId || "",
    vehicleNumberPlate: currentData?.vehicleNumberPlate || "",
    totalBill: currentData?.totalBill || "",
    discountAmount: currentData?.discountAmount || "",
  };

  const methods = useForm({
    resolver: yupResolver(BookingSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const values = watch();

  const fetch = async () => {
    setLoading(true);
    try {
      const drivers = await getAllOnlineDrivers();
      setDrivers(drivers);
    } catch (err) {
      console.log("Error in pre fertching driver");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    const bookingData = {
      ...values,
      driverId: values?.driver?.id,
      id: currentData.id,
    };
    delete bookingData?.driver;
    setIsSubmitting(true);
    if (socket) {
      socket?.once("edit-booking-error", (data) => {
        setIsSubmitting(false);
        enqueueSnackbar(data.message, { variant: "error" });
      });

      socket?.once("edit-booking-successfully", (data) => {
        enqueueSnackbar(data.message);
        setIsSubmitting(false);
      });
      socket.emit("edit-booking", bookingData);
    }
  });

  const handleUpdateRequest = () => {
    router.push(paths.dashboard.requests.edit(currentData?.requestId));
  };

  if (loading) {
    return <LoadingScreen />;
  } else {
    return (
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3} justifyContent={"center"}>
          <Grid xs={12} md={10}>
            <Card sx={{ p: 3 }}>
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="button"
                  variant="contained"
                  onClick={handleUpdateRequest}
                  color="primary"
                >
                  Update Request Info
                </LoadingButton>
              </Stack>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                }}
              >
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  Date & Time
                </Typography>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <Controller
                    name="bookingDate"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Booking Date"
                        value={field.value ? new Date(field.value) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue.toISOString());
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
                    name="bookingTime"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TimePicker
                        {...field}
                        label="Booking Time"
                        onChange={(newValue) => {
                          field.onChange(newValue.toISOString().split("T")[1]);
                        }}
                        defaultValue={
                          field.value ? convertToISOTime(field.value) : null
                        }
                        value={
                          field.value ? convertToISOTime(field.value) : null
                        }
                        format="HH:mm:ss"
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

                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  Driver Details
                </Typography>

                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <RHFAutocomplete
                    name="driver"
                    label="Driver"
                    options={drivers.map((option) => option)}
                    getOptionLabel={(option) =>
                      `${option?.userInfo?.firstName} ${option?.userInfo?.lastName}`
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        <Box sx={{ mr: 1 }}>
                          <AwsImageAvatar
                            alt={option?.userInfo?.firstName}
                            imageKey={option?.profileImage}
                          />
                        </Box>
                        <Box>
                          <ListItemText
                            primary={
                              option?.userInfo?.firstName +
                              "" +
                              option?.userInfo?.lastName
                            }
                            secondary={option?.userInfo?.emailAddress}
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
                  <RHFTextField
                    name="driverName"
                    label="Service Partner Name"
                  />
                  <RHFTextField
                    name="servicePartnerPhone"
                    label="Service Partner Phone"
                  />
                  <RHFTextField
                    name="servicePartnerEmail"
                    label="Service Partner Email"
                  />

                  <RHFTextField
                    name="nationalInsuranceNumber"
                    label="National Insurance Number"
                  />
                  <RHFTextField
                    name="selfAssessmentTaxId"
                    label="Self Assesment Tax Id"
                  />
                  <RHFTextField
                    name="vehicleNumberPlate"
                    label="Vehicle Number Plate"
                  />
                </Box>

                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  Ratings And Reviews Detail
                </Typography>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <RHFTextField
                    type="number"
                    name="passengerRating"
                    label="Passenger Rating"
                  />
                  <RHFTextField
                    type="number"
                    name="driverRating"
                    label="Driver Rating"
                  />
                  <RHFTextField
                    name="passengerReview"
                    label="Passenger Review"
                  />
                  <RHFTextField name="driverReview" label="Driver Review" />
                </Box>

                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  Commission, Distance and Time
                </Typography>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(4, 1fr)",
                  }}
                >
                  <RHFTextField name="commission" label="Commission" />
                  <RHFTextField name="totalDistance" label="Total Distance" />
                  <RHFTextField
                    name="totalDistanceTime"
                    label="Total Distance Time"
                  />

                  <RHFTextField
                    name="totalWaitingTime"
                    label="Total Waiting Time"
                  />
                </Box>

                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  Others Info
                </Typography>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(4, 1fr)",
                  }}
                >
                  <RHFSelect name="status" label="Status">
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFSelect name="paymentType" label="Payment Type">
                    {paymentType.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFTextField name="discountAmount" label="Discount Amount" />
                  <RHFTextField name="totalBill" label="Total Bill" />
                </Box>
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmiting}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    );
  }
}

BookingNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
