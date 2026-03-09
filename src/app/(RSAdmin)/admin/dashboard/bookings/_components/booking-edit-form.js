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
import { endpoints } from "@/lib/utils/axios";

import {
  Checkbox,
  Grid,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import axios from "axios";
import {
  calculateTotalDistance,
  fetchPlaceDetails,
} from "@/lib/utils/GoogleMapsApi";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { getAllPassengers } from "@/server/Passenger";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import LocationInput from "../../bookings/_components/LocationInput";
import { calculatePrice } from "@/lib/calculatePrice";
import Label from "../../../common/label";
import { getCoupon } from "@/server/Bookings";
import { getAllOnlineDrivers } from "@/server/Driver";
import { useSocket } from "@/providers/SocketProvider";
import { convertToISOTime, isDateInThePast } from "@/lib/utils";
import { LoadingScreen } from "../../../common/loading-screen";

const statusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "ACCEPTED", label: "ACCEPTED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "COMPLETED", label: "COMPLETED" },
];

const requestType = [
  { value: "ADJUSTABLE", label: "ADJUSTABLE" },
  { value: "FIXED", label: "FIXED" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passengers, setPassengers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [stoppages, setStopages] = useState(currentData?.stoppages || []);
  const [inputFields, setInputFields] = useState(
    currentData?.stoppages ? currentData?.stoppages?.map(() => " ") : []
  );
  const [sameClient, setSameClient] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const { socket } = useSocket();

  const BookingSchema = Yup.object().shape({
    bookingDate: Yup.string().required("Date is required"),
    bookingTime: Yup.string().required("Time is required"),
    totalLuggage: Yup.string(),
    totalPersons: Yup.string(),
    notes: Yup.string(),
    startAddress: addressSchema,
    destinationAddress: addressSchema,
    package: Yup.object().required("Select any one package"),
    passenger: Yup.object().required("Select any passenger"),
    driver: Yup.object(),
    stoppages: Yup.array(),
    couponCode: Yup.string().nullable(),
    couponDiscount: Yup.number().nullable(),
    couponExpiryDate: Yup.string().nullable(),
    notes: Yup.string(),
    clientName: Yup.string().required().min(1, "Client name is Required"),
    clientPhone: Yup.string().required().min(9, "Phone number is required"),
    clientEmail: Yup.string().email().required("Invalid email address"),
    status: Yup.string().required("Status is required"),
    paymentType: Yup.string().required("Payment Type is required"),
    requestType: Yup.string().required("Request Type is required"),
    totalDistance: Yup.string().required("Total Distance is required"),
    totalDuration: Yup.string().required("Total Duration is required"),
    passengerRating: Yup.number().max(5).nullable(),
    driverRating: Yup.number().max(5).nullable(),
    driverReview: Yup.string(),
    passengerReview: Yup.string(),
    driver: Yup.object(),
  });

  const defaultValues = {
    bookingDate: currentData.bookingDate || "",
    bookingTime: currentData.bookingTime || "",
    totalLuggage: currentData.totalLuggage || "",
    totalPersons: currentData.totalPersons || "",
    notes: currentData.notes || "",
    startAddress: currentData.startFrom || {},
    destinationAddress: currentData.destination || {},
    package: currentData.packageInfo || {},
    passenger: currentData.riderInfo || {},
    stoppages: currentData.stoppages || [],
    couponCode: currentData.couponCode || "",
    couponDiscount: currentData.couponCode
      ? (Number(currentData.discountAmount | 0) * 100) /
        Number(currentData.totalBill)
      : 0,
    couponExpiryDate: currentData.couponExpiryDate
      ? new Date(currentData.couponExpiryDate).toISOString()
      : null,
    status: currentData.status || "",
    clientName: currentData.clientName || "",
    clientPhone: currentData.clientPhone || "",
    clientEmail: currentData.clientEmail || "",
    totalBill: currentData.totalBill || "",
    discountAmount: currentData.discountAmount || "",
    totalDistance: currentData.totalDistance || "",
    totalDuration: currentData.totalDuration || "",
    paymentType: currentData.paymentType || "",
    requestType: currentData.requestType || "",
    passengerRating: currentData?.passengerRating || null,
    driverRating: currentData?.driverRating || null,
    driverReview: currentData?.driverReview || "",
    passengerReview: currentData?.passengerReview || "",
    driver: currentData?.driverInfo || {},
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
      const { data } = await axios.get(endpoints.packages.allPackages);
      const passengers = await getAllPassengers();
      const drivers = await getAllOnlineDrivers();
      setPackages(data);
      setDrivers(drivers);
      setPassengers(passengers);
    } catch (err) {
      console.log("Error in pre fertching packages and passegers");
    } finally {
      setLoading(false);
    }
  };

  const selectedTime = watch("bookingTime");
  const bookingDate = new Date(watch("bookingDate"));

  const padZero = (num) => (num < 10 ? "0" + num : num);

  const year = bookingDate?.getFullYear();
  const month = padZero(bookingDate?.getMonth() + 1);
  const day = padZero(bookingDate?.getDate());

  const [hours, minutes] = selectedTime?.split(":");
  bookingDate.setHours(hours);
  bookingDate.setMinutes(minutes);
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:59.999999999Z`;

  console.log("Current Data:", currentData);
  useEffect(() => {
    (async () => {
      if (values?.startAddress || values.destinationAddress) {
        console.log("Triggred condition", values);
        try {
          const data = await calculateTotalDistance(
            {
              startAddress: values?.startAddress,
              stoppages,
              destinationAddress: values.destinationAddress,
            },
            formattedDateTime
          );
          console.log("Resposne", data);
          if (data?.totalDistance && data?.totalDuration) {
            setValue("totalDistance", data?.totalDistance);
            setValue("totalDuration", data?.totalDuration);
          }
        } catch (err) {
          console.log("Error in fetching totalDistance totalDuration", err);
        }
      }
    })();
  }, [
    values?.startAddress?.description,
    ...stoppages?.map((stopage) => stopage?.description),
    values?.destinationAddress?.description,
    values?.bookingTime,
    values?.bookingDate,
  ]);

  useEffect(() => {
    fetch();
  }, []);

  const addInputField = () => {
    setInputFields([...inputFields, ""]);
  };

  const removeInputField = (index) => {
    const newInputFields = inputFields.filter((_, i) => i !== index);
    setInputFields(newInputFields);
    setStopages(stoppages?.filter((_, i) => i !== index));
  };

  const handleSameClientChecked = (isChecked) => {
    setSameClient(isChecked);
    if (isChecked && values?.passenger) {
      setValue(
        "clientName",
        `${values?.passenger?.firstName}  ${values?.passenger?.lastName}`
      );
      setValue("clientEmail", `${values?.passenger?.emailAddress}`);
      setValue("clientPhone", `${values?.passenger?.phone_number}`);
    } else {
      setValue("clientName", "");
      setValue("clientEmail", "");
      setValue("clientPhone", "");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const [totalBill, discountAmount] = calculatePrice(
      values?.totalDistance,
      values?.totalDuration,
      values?.couponDiscount,
      values?.package
    );
    const bookingRequestData = {
      ...values,
      stoppages: stoppages,
      totalBill: Number(totalBill.toFixed(2)),
      totalDistance: Number(values?.totalDistance),
      totalDuration: Number(values?.totalDuration),
      passengerId: values?.passenger?.id,
      packageId: values?.package?.id,
      driverId: values?.driver?.id,
      requestId: currentData.requestId,
      discountAmount: Number(discountAmount) || 0,
      couponPercentage: values.couponDiscount || 0,
      id: currentData?.id,
      bookingDate: formattedDateTime,
    };

    delete bookingRequestData?.passenger;
    delete bookingRequestData?.package;
    delete bookingRequestData?.driver;
    delete bookingRequestData?.couponDiscount;
    console.log("Booking Request Data", bookingRequestData);

    if (socket) {
      socket?.once("edit-booking-error", (data) => {
        setIsSubmitting(false);
        enqueueSnackbar(data.message, { variant: "error" });
      });

      socket?.once("edit-booking-successfully", (data) => {
        enqueueSnackbar(data.message);
        setIsSubmitting(false);
      });
      socket.emit("edit-booking", bookingRequestData);
    }
  });

  const onApplyCoupon = async () => {
    if (values.couponCode) {
      setCouponLoading(true);
      try {
        const response = await getCoupon(values.couponCode);
        const { statusCode, message, data } = response || {};
        if (statusCode === 404 || statusCode === 400 || !data) {
          setCouponError(message);
        } else {
          setValue("couponCode", data?.coupon);
          setValue("couponDiscount", data?.discount);
          setValue("couponExpiryDate", data?.expiry?.toISOString());
        }
      } catch (err) {
        enqueueSnackbar(err.message, { variant: "error" });
      } finally {
        setCouponLoading(false);
      }
    }
  };

  const onRemoveCoupon = async () => {
    setValue("couponCode", "");
    setValue("couponDiscount", null);
    setValue("couponExpiryDate", null);
  };

  if (loading) {
    return <LoadingScreen />;
  } else {
    return (
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3} justifyContent={"center"}>
          <Grid xs={12} md={10}>
            <Card sx={{ p: 3 }}>
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
                  Journey Details
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
                  <Box>
                    <LocationInput
                      onPlaceSelect={(placeDetails) => {
                        setValue("startAddress", placeDetails);
                      }}
                      disabled={isDateInThePast(bookingDate)}
                      defaultValue={values?.startAddress || ""}
                      label={"Pickup Location"}
                    />
                    {errors?.startAddress && (
                      <Typography variant="caption" color="red">
                        Pickup Location is required
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <LocationInput
                      label={"Drop Of Location"}
                      onPlaceSelect={(placeDetails) => {
                        setValue("destinationAddress", placeDetails);
                      }}
                      defaultValue={values?.destinationAddress || ""}
                      disabled={isDateInThePast(bookingDate)}
                    />
                    {errors?.destinationAddress && (
                      <Typography variant="caption" color="red">
                        Drop Of Location is required
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box
                  rowGap={3}
                  columnGap={1}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(1, 1fr)",
                  }}
                >
                  {inputFields.map((_, index) => (
                    <div className="!flex !flex-row" key={index}>
                      <LocationInput
                        key={index}
                        onPlaceSelect={(placeDetails) => {
                          setStopages((prevData) => {
                            prevData[index] = placeDetails;
                            return [...prevData];
                          });
                        }}
                        defaultValue={stoppages[index] || ""}
                        label={`Additional Stopage  ${index}`}
                        disabled={isDateInThePast(bookingDate)}
                      />
                      <LoadingButton
                        type="button"
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => removeInputField(index)}
                      >
                        Remove.
                      </LoadingButton>
                    </div>
                  ))}
                  <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                    <LoadingButton variant="contained" onClick={addInputField}>
                      Add stoppages
                    </LoadingButton>
                  </Stack>
                </Box>

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
                  Package & Persons
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
                    name="package"
                    label="Packages"
                    options={packages.map((option) => option)}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        <Box sx={{ mr: 2 }}>
                          <AwsImageRender
                            placeHolderImage={
                              "/webAssets/images/placeholder/car.png"
                            }
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
                      type={"number"}
                      name="totalLuggage"
                      label={"Total Luggage"}
                    />
                    <RHFTextField
                      type={"number"}
                      name="totalPersons"
                      label={"Total Persons"}
                    />
                  </Box>
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
                    Passengers & Driver
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
                      name="passenger"
                      label="Passenger"
                      options={passengers.map((option) => option)}
                      getOptionLabel={(option) =>
                        `${option?.firstName} ${option?.lastName}`
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option}>
                          <Box sx={{ mr: 1 }}>
                            <AwsImageAvatar
                              alt={option?.firstName}
                              imageKey={option?.coverImage}
                            />
                          </Box>
                          <Box>
                            <ListItemText
                              primary={
                                option?.firstName + "" + option?.lastName
                              }
                              secondary={option?.emailAddress}
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
                  </Box>
                  <div className="flex">
                    <Checkbox
                      value="samePassenger"
                      checked={sameClient}
                      onChange={(event) =>
                        handleSameClientChecked(event.target.checked)
                      }
                    />{" "}
                    <Label
                      onClick={(event) => handleSameClientChecked(!sameClient)}
                      className="cursor-pointer"
                    >
                      {" "}
                      Book for passenger
                    </Label>
                  </div>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(3, 1fr)",
                    }}
                  >
                    <RHFTextField
                      InputLabelProps={{ shrink: true }}
                      name="clientName"
                      label={"Client Name"}
                    />
                    <RHFTextField
                      InputLabelProps={{ shrink: true }}
                      name="clientPhone"
                      label={"Client Phone"}
                    />
                    <RHFTextField
                      InputLabelProps={{ shrink: true }}
                      name="clientEmail"
                      type="email"
                      label={"Client Email"}
                    />
                  </Box>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(3, 1fr)",
                    }}
                  >
                    <RHFSelect name="status" label="Status">
                      {statusOptions?.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                    <RHFSelect name="paymentType" label="Payment Type">
                      {paymentType?.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                    <RHFSelect name="requestType" label="Request Type">
                      {requestType?.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Box>

                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(1, 1fr)",
                    }}
                  >
                    <RHFTextField
                      multiline
                      name="notes"
                      label={"notes"}
                      rows={5}
                    />
                  </Box>
                </Box>
              </Box>

              <Stack
                spacing={2}
                alignItems="flex-end"
                sx={{ mt: 3, textAlign: "right", typography: "body2" }}
              >
                <Stack direction="row" gap={2} alignItems={"center"}>
                  <RHFTextField
                    InputLabelProps={{ shrink: true }}
                    name="couponCode"
                    size="small"
                    label={"Discount Coupon"}
                  />
                  {values.couponDiscount ? (
                    <LoadingButton
                      variant="contained"
                      loading={couponLoading}
                      color="error"
                      type="button"
                      onClick={onRemoveCoupon}
                    >
                      Remove
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      variant="contained"
                      loading={couponLoading}
                      color="success"
                      type="button"
                      onClick={onApplyCoupon}
                    >
                      Apply
                    </LoadingButton>
                  )}
                </Stack>

                <Stack direction="row">
                  <Box sx={{ color: "text.secondary" }}>Discount Amount</Box>
                  <Box sx={{ width: 160, typography: "subtitle2" }}>
                    £{" "}
                    {calculatePrice(
                      values?.totalDistance,
                      values?.totalDuration,
                      values?.couponDiscount,
                      values?.package
                    )[1]?.toFixed(2)}
                  </Box>
                </Stack>

                <Stack direction="row">
                  <Box sx={{ color: "text.secondary" }}>Total Distance</Box>
                  <Box sx={{ width: 160, typography: "subtitle2" }}>
                    {values?.totalDistance
                      ? values?.totalDistance?.toFixed(2) + " miles."
                      : "-"}
                  </Box>
                </Stack>

                <Stack direction="row">
                  <Box sx={{ color: "text.secondary" }}>Total Time</Box>
                  <Box
                    sx={{
                      width: 160,
                      ...(values.totalDuration && { color: "error.main" }),
                    }}
                  >
                    {values?.totalDuration
                      ? values?.totalDuration + " min."
                      : "-"}
                  </Box>
                </Stack>

                <Stack direction="row" sx={{ typography: "subtitle1" }}>
                  <Box>Total</Box>
                  <Box sx={{ width: 160 }}>
                    £
                    {calculatePrice(
                      values?.totalDistance,
                      values?.totalDuration,
                      values?.couponDiscount,
                      values?.package
                    )[0]?.toFixed(2)}
                  </Box>
                </Stack>
              </Stack>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
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
  currentData: PropTypes.object,
};
