import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";

import { Checkbox, Grid, ListItemText, Typography } from "@mui/material";
import { calculateTotalDistance } from "@/lib/utils/GoogleMapsApi";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import LocationInput from "../../bookings/_components/LocationInput";
import { calculatePrice } from "@/lib/calculatePrice";
import Label from "../../../common/label";
import { formatDistance, formatDuration } from "@/lib/utils";
import { LoadingScreen } from "../../../common/loading-screen";
import { usePassengersQuery } from "@/hooks/Users";
import {
  BookingRequestForm,
  BookingRequestSchema,
  DefaultRequestValues,
} from "@/lib/validators/yup-validators";
// import { useDriversQuery } from "@/hooks/Drivers";
import { usePackagesQuery } from "@/hooks/Packages";
import { DiscountCoupons, Package } from "@/lib/types";
import { formatNumber, parseValidDate } from "@/lib/helper-function";
import { IRequestType, IUser } from "@/types/type";
import { apiClient } from "@/lib/ApiClient";

export default function BookingNewEditForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  type PlaceDetails = {
    description?: string;
    [key: string]: any;
  };
  const [stoppages, setStopages] = useState<PlaceDetails[]>([]);
  const [inputFields, setInputFields] = useState<string[]>([]);
  const [sameClient, setSameClient] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [priceDetails, setPriceDetails] = useState<{
    serviceFee: number;
    discountAmount: number;
    totalFare: number;
  }>({
    serviceFee: 0,
    discountAmount: 0,
    totalFare: 0,
  });

  const { data: passengers = [], isPending: isLoadingPassengers } =
    usePassengersQuery();
  // const { data: drivers = [], isPending: isLoadingDrivers } = useDriversQuery();
  const { data: packages = [], isPending: isLoadingPackages } =
    usePackagesQuery();

  const methods = useForm<BookingRequestForm>({
    resolver: yupResolver(BookingRequestSchema),
    defaultValues: DefaultRequestValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const values = watch();
  const selectedTime = watch("bookingTime");
  const bookingDate = new Date(watch("bookingDate"));
  const padZero = (num: number) => (num < 10 ? "0" + num : num);

  const year = bookingDate?.getFullYear();
  const month = padZero(bookingDate?.getMonth() + 1);
  const day = padZero(bookingDate?.getDate());

  const [hours, minutes] = selectedTime?.split(":");
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:59.999999999Z`;

  useEffect(() => {
    (async () => {
      if (values.startFrom || values.destination) {
        try {
          const data = await calculateTotalDistance(
            {
              startAddress: values?.startFrom,
              stoppages,
              destinationAddress: values.destination,
            },
            formattedDateTime
          );
          setValue("totalDistance", data?.totalDistance ?? 0);
          setValue("totalDuration", data?.totalDuration ?? 0);
        } catch (err) {
          console.log("Error in fetching totalDistance totalDuration", err);
        }
      }
    })();
  }, [
    values?.startFrom?.description,
    ...stoppages?.map((stopage) => stopage?.description),
    values?.destination?.description,
    values?.bookingTime,
    values?.bookingDate,
  ]);

  useEffect(() => {
    const fetchPrice = async () => {
      if (
        !values?.totalDistance ||
        !values?.totalDuration ||
        !values?.packageId
      )
        return;

      try {
        const result = await calculatePrice({
          distance: values.totalDistance,
          time: values.totalDuration,
          couponDiscount: values.couponPercentage ?? 0,
          packageId: values.packageId,
        });

        setPriceDetails({
          serviceFee: result.serviceFee ?? 0,
          discountAmount: result.discountAmount ?? 0,
          totalFare: result.price ?? 0,
        });
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    };

    fetchPrice();
  }, [
    values?.totalDistance,
    values?.totalDuration,
    values?.couponPercentage,
    values?.packageId,
  ]);

  const addInputField = () => {
    setInputFields([...inputFields, ""]);
  };

  const removeInputField = (index: number) => {
    const newInputFields = inputFields.filter((_, i) => i !== index);
    setInputFields(newInputFields);
    setStopages(stoppages?.filter((_, i) => i !== index));
  };

  const handleSameClientChecked = (isChecked: boolean) => {
    setSameClient(isChecked);
    const passengerId = methods.getValues("passengerId"); // latest value
    const passenger = passengers.find((p) => p.id === passengerId);

    setValue(
      "clientName",
      isChecked && passenger
        ? `${passenger.firstName} ${passenger.lastName}`
        : ""
    );
    setValue(
      "clientEmail",
      isChecked && passenger ? passenger.emailAddress : ""
    );
    setValue(
      "clientPhone",
      isChecked && passenger ? passenger.phone_number ?? "" : ""
    );
  };

  const onApplyCoupon = async () => {
    const couponCode = values.couponCode?.trim().toUpperCase();
    if (!couponCode) return;

    setCouponLoading(true);
    try {
      const couponResponse = await apiClient.post<DiscountCoupons>(
        "/coupons/apply/admin",
        {
          coupon: couponCode,
          id: values.passengerId,
        }
      );

      if (!couponResponse.success) {
        enqueueSnackbar(couponResponse.message, { variant: "error" });
        // Clear coupon values
        setValue("couponCode", "");
        setValue("couponPercentage", 0);
        await recalcPrice(); // ✅ recalc after clearing coupon
      } else {
        // Set coupon values
        setValue("couponCode", couponResponse.data.coupon);
        setValue("couponPercentage", couponResponse.data.discount);
        setValue("couponExpiryDate", couponResponse.data.expiry);
        enqueueSnackbar(couponResponse.message);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply coupon";
      enqueueSnackbar(errorMessage, { variant: "error" });
      await recalcPrice(); // ✅ recalc after clearing coupon
    } finally {
      setCouponLoading(false);
    }
  };

  const recalcPrice = async () => {
    if (!values?.totalDistance || !values?.totalDuration || !values?.packageId)
      return;

    try {
      const result = await calculatePrice({
        distance: values.totalDistance,
        time: values.totalDuration,
        couponDiscount: values.couponPercentage ?? 0,
        packageId: values.packageId,
      });
      setPriceDetails({
        serviceFee: result.serviceFee ?? 0,
        discountAmount: result.discountAmount ?? 0,
        totalFare: result.price ?? 0,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const bookingRequestData = {
        ...values,
        stoppages,
        totalBill: formatNumber(priceDetails.totalFare),
        totalDistance: formatNumber(values.totalDistance),
        totalDuration: formatNumber(values.totalDuration),
        requestType: "FIXED",
        paymentType: "CASH",
        couponExpiryDate: parseValidDate(values.couponExpiryDate),
        discountAmount: formatNumber(priceDetails.discountAmount),
        couponPercentage: Number(values.couponPercentage ?? 0),
        cashCollected: formatNumber(values.cashCollected),
        walletCollected: formatNumber(values.walletCollected),
        serviceCharge: formatNumber(priceDetails.serviceFee),
      };

      const requestResponse = await apiClient.post<IRequestType>(
        "/requests/admin",
        bookingRequestData
      );

      if (!requestResponse.success) {
        enqueueSnackbar(requestResponse.message || "Failed to create request", {
          variant: "error",
        });
      }
      enqueueSnackbar(
        requestResponse.message || "Request created successfully"
      );
      router.push("/admin/dashboard/booking-requests");
      reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || "Unexpected error";

      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  });

  const loading = isLoadingPassengers || isLoadingPackages;

  if (loading) {
    return <LoadingScreen />;
  } else {
    return (
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid spacing={3}>
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
                    <LocationInput name="startFrom" label="Pickup Location" />

                    {errors?.startFrom && (
                      <Typography variant="caption" color="red">
                        Pickup Location is required
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <LocationInput
                      name="destination"
                      label="Drop Of Location"
                    />
                    {errors?.destination && (
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
                    <div className="!flex !flex-row w-full" key={index}>
                      <LocationInput
                        name={`stoppages.${index}`}
                        label={`Additional Stoppage ${index + 1}`}
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
                        disablePast
                        value={field.value ? new Date(field.value) : null}
                        onChange={(newValue) => {
                          field.onChange(
                            newValue ? newValue.toISOString() : null
                          );
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
                    render={({ field, fieldState: { error } }) => {
                      // Convert stored "HH:mm" string to a Date object for the picker
                      const timeValue = field.value
                        ? new Date(`1970-01-01T${field.value}:00`)
                        : null;

                      return (
                        <TimePicker
                          label="Booking Time"
                          value={timeValue}
                          ampm={false} // ✅ 24-hour format
                          onChange={(newValue) => {
                            if (!newValue) {
                              field.onChange(null);
                            } else {
                              const hours = newValue
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                              const minutes = newValue
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              field.onChange(`${hours}:${minutes}`);
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!error,
                              helperText: error?.message,
                            },
                          }}
                        />
                      );
                    }}
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
                    placeholder="Select Package"
                    options={packages}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => {
                      return (
                        <Box
                          component="li"
                          {...props}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          {" "}
                          {/* ✅ unique key */}
                          <Box sx={{ mr: 2 }}>
                            <AwsImageRender
                              placeHolderImage="/webAssets/images/placeholder/car.png"
                              height={50}
                              width={50}
                              alt={option.name}
                              imageKey={option.coverImage}
                            />
                          </Box>
                          <Box>
                            <ListItemText
                              primary={option.name}
                              secondary={option.summary}
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
                      newValue: Package
                    ) => setValue("packageId", newValue?.id || "")} // store id only
                    value={
                      packages.find((pkg) => pkg.id === watch("packageId")) ||
                      null
                    }
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
                    Passenger Info
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
                      placeholder="Select Rider"
                      options={passengers.map((option) => option)}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        `${option?.firstName} ${option?.lastName}`
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {/* <Box sx={{ mr: 1 }}>
                            <AwsImageAvatar
                              alt={option?.firstName}
                              imageKey={option?.coverImage}
                            />
                          </Box> */}
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
                      onChange={(
                        _: React.SyntheticEvent<Element, Event>,
                        newValue: IUser
                      ) => {
                        setValue("passengerId", newValue?.id || "");
                      }}
                      value={
                        passengers.find((p) => p.id === watch("passengerId")) ||
                        null
                      }
                    />
                    {/* <RHFAutocomplete
                      name="driver"
                      label="Driver"
                      options={drivers.map((option) => option)}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        `${option?.userInfo?.firstName} ${option?.userInfo?.lastName}`
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
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
                      onChange={(
                        _: React.SyntheticEvent<Element, Event>,
                        newValue: IDriver
                      ) => setValue("driverId", newValue?.id || "")} // store id only
                      value={
                        drivers.find((d) => d.id === watch("driverId")) || null
                      }
                    /> */}
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
                  <LoadingButton
                    variant="contained"
                    loading={couponLoading}
                    color="success"
                    type="button"
                    onClick={onApplyCoupon}
                  >
                    Apply
                  </LoadingButton>
                </Stack>

                <Stack direction="row">
                  <Box sx={{ color: "text.secondary" }}>Discount Amount</Box>
                  <Box sx={{ width: 160, typography: "subtitle2" }}>
                    -£ {priceDetails.discountAmount.toFixed(2)}
                  </Box>
                </Stack>

                <Stack direction="row">
                  <Box sx={{ color: "text.secondary" }}>Total Distance</Box>
                  <Box sx={{ width: 160, typography: "subtitle2" }}>
                    {values?.totalDistance
                      ? formatDistance(values?.totalDistance)
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
                      ? formatDuration(values?.totalDuration)
                      : "-"}
                  </Box>
                </Stack>

                <Stack direction="row" sx={{ typography: "subtitle1" }}>
                  <Box>Total</Box>
                  <Box sx={{ width: 160 }}>
                    £ {priceDetails.totalFare.toFixed(2)}
                  </Box>
                </Stack>
              </Stack>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Create Booking
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    );
  }
}
