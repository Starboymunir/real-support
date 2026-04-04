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

import {
  Checkbox,
  Grid,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import { calculateTotalDistance } from "@/lib/utils/GoogleMapsApi";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import LocationInput from "../../bookings/_components/LocationInput";
import { calculatePrice } from "@/lib/calculatePrice";
import Label from "../../../common/label";
import { formatDistance, formatDuration, isDateInThePast } from "@/lib/utils";
import { LoadingScreen } from "../../../common/loading-screen";
import { IRequestType, IUser } from "@/types/type";
import {
  BookingRequestForm,
  BookingRequestSchema,
} from "@/lib/validators/yup-validators";
import { apiClient } from "@/lib/ApiClient";
import { DiscountCoupons } from "@/lib/types";
import { usePackagesQuery } from "@/hooks/Packages";
import { usePassengersQuery } from "@/hooks/Users";
import { useDriversQuery } from "@/hooks/Drivers";
import { formattedDateTime, getChangedFields } from "@/lib/helper-function";

const statusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "ACCEPTED", label: "ACCEPTED" },
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

export default function BookingNewEditForm({
  currentData,
}: {
  currentData: IRequestType;
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: packages = [], isPending: isLoadingPackages } =
    usePackagesQuery();
  const { data: passengers = [], isPending: isLoadingPassengers } =
    usePassengersQuery();
  const { data: allDrivers = [], isPending: isLoadingDrivers } =
    useDriversQuery();
  const drivers = allDrivers.filter((d: any) => d.status === 'ACTIVE');
  const [stoppages, setStopages] = useState(currentData?.stoppages || []);
  const [inputFields, setInputFields] = useState(
    currentData?.stoppages ? currentData?.stoppages?.map(() => " ") : []
  );
  const [sameClient, setSameClient] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const defaultValues = {
    bookingDate:
      typeof currentData.bookingDate === "string"
        ? currentData.bookingDate
        : currentData.bookingDate
        ? currentData.bookingDate.toISOString()
        : "",
    bookingTime: currentData.bookingTime || "",
    totalLuggage: currentData.totalLuggage || 0,
    totalPersons: currentData.totalPersons || 0,
    notes: currentData.notes || "",
    startFrom: currentData.startFrom ?? {}, // 🔥 keep object
    destination: currentData.destination ?? {}, // 🔥 keep object
    packageId: currentData.packageId || "",
    passengerId: currentData.riderInfo?.id || "",
    stoppages: currentData.stoppages || [],
    couponCode: currentData.couponCode || "",
    couponPercentage: currentData.couponPercentage || 0,
    couponExpiryDate: currentData.couponExpiryDate || null,
    status: currentData.status || "",
    clientName: currentData.clientName || "",
    clientPhone: currentData.clientPhone || "",
    clientEmail: currentData.clientEmail || "",
    totalBill: currentData.totalBill || 0,
    discountAmount: currentData.discountAmount || 0,
    totalDistance: currentData.totalDistance || 0,
    totalDuration: currentData.totalDuration || 0,
    paymentType: currentData.paymentType || "",
    requestType: currentData.requestType || "",
    serviceCharge: currentData.serviceCharge || 0,
  };

  const methods = useForm<BookingRequestForm>({
    resolver: yupResolver(BookingRequestSchema),
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
  const selectedTime = watch("bookingTime");
  const bookingDate = new Date(watch("bookingDate"));
  const dateTime = formattedDateTime(bookingDate, selectedTime);

  useEffect(() => {
    if (!dateTime || isDateInThePast(dateTime)) return;

    const fetchDistance = async () => {
      if (!values?.startFrom || !values.destination) return;

      try {
        const data = await calculateTotalDistance(
          {
            startAddress: values.startFrom,
            stoppages,
            destinationAddress: values.destination,
          },
          dateTime
        );

        setValue("totalDistance", data?.totalDistance ?? 0);
        setValue("totalDuration", data?.totalDuration ?? 0);
      } catch (err) {
        console.error("Error fetching totalDistance/totalDuration:", err);
      }
    };

    fetchDistance();
  }, [
    dateTime,
    values?.startFrom,
    values?.destination,
    ...stoppages, // no need for map, just include stoppages array
  ]);

  useEffect(() => {
    void recalculatePrice(); // 👈 use your function instead of local fetch
  }, [
    values?.totalDistance,
    values?.totalDuration,
    values?.couponCode,
    values?.packageId,
  ]);

  const addInputField = () => {
    setInputFields([...inputFields, ""]);
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

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await recalculatePrice();
      const latestValues = methods.getValues();
      const changedFields = getChangedFields(latestValues, currentData as any);
      console.log("Changed fields:", changedFields);

      const response = await apiClient.patch<IRequestType>(
        `/requests/${currentData?.id}`,
        changedFields
      );

      if (response.success) {
        enqueueSnackbar("Booking request updated successfully", {
          variant: "success",
        });
        router.push("/admin/dashboard/booking-requests");
      } else {
        enqueueSnackbar(response.message, { variant: "error" });
      }
    } catch (error) {
      console.error("Error creating booking request:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

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
        setValue("couponExpiryDate", null);
        await recalculatePrice();
      } else {
        // Set coupon values
        setValue("couponCode", couponResponse.data.coupon);
        setValue("couponPercentage", couponResponse.data.discount);
        setValue("couponExpiryDate", couponResponse.data.expiry);
        await recalculatePrice();
        enqueueSnackbar(couponResponse.message);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply coupon";
      enqueueSnackbar(errorMessage, { variant: "error" });
      await recalculatePrice(); // ✅ recalc after clearing coupon
    } finally {
      setCouponLoading(false);
    }
  };

  const recalculatePrice = async () => {
    if (!values?.totalDistance || !values?.totalDuration || !values?.packageId)
      return;

    try {
      const result = await calculatePrice({
        distance: values.totalDistance,
        time: values.totalDuration,
        couponDiscount: values.couponPercentage ?? 0,
        packageId: values.packageId,
      });
      setValue("discountAmount", result?.discountAmount ?? 0, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("serviceCharge", result?.serviceFee ?? 0, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("totalBill", result?.price ?? 0, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const onRemoveCoupon = async () => {
    setValue("couponCode", "", { shouldValidate: true, shouldDirty: true });
    setValue("couponExpiryDate", null, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("couponPercentage", 0, {
      shouldValidate: true,
      shouldDirty: true,
    });

    await recalculatePrice();
  };

  if (loading) return <LoadingScreen />;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid spacing={3} justifyContent={"center"}>
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
                  <LocationInput name="destination" label="Drop Of Location" />
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
                  <div className="!flex !flex-row" key={index}>
                    <LocationInput
                      name={`stoppages.${index}`}
                      label={`Additional Stoppage ${index + 1}`}
                      disabled={isDateInThePast(bookingDate)}
                    />

                    <LoadingButton
                      type="button"
                      variant="contained"
                      color="error"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        // Remove field from RHF
                        const updatedStoppages = [...(values.stoppages ?? [])];
                        updatedStoppages.splice(index, 1);
                        setValue("stoppages", updatedStoppages);
                        // Remove from inputFields for rendering
                        const updatedFields = [...inputFields];
                        updatedFields.splice(index, 1);
                        setInputFields(updatedFields);
                      }}
                    >
                      Remove
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
                        field.onChange(newValue?.toISOString());
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
                  options={packages}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
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
                  )}
                  onChange={(
                    _: React.SyntheticEvent<Element, Event>,
                    newValue: Package | null
                  ) => setValue("packageId", newValue?.id || "")}
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
                    options={passengers.map((option) => option)}
                    getOptionLabel={(option) =>
                      `${option?.firstName} ${option?.lastName}`
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <ListItemText
                            primary={option?.firstName + "" + option?.lastName}
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
                {values.couponCode ? (
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
                  -£ {(values.discountAmount ?? 0).toFixed(2)}
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
                <Box sx={{ width: 160 }}>£ {values.totalBill.toFixed(2)}</Box>
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
