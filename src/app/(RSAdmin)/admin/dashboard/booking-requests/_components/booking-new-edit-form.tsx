import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";

import { Grid, ListItemText, Typography } from "@mui/material";
import { calculateTotalDistance } from "@/lib/utils/GoogleMapsApi";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import LocationInput from "../../bookings/_components/LocationInput";
import { calculatePrice } from "@/lib/calculatePrice";
import { formatDistance, formatDuration } from "@/lib/utils";
import { LoadingScreen } from "../../../common/loading-screen";
import { usePassengersQuery } from "@/hooks/Users";
import {
  BookingRequestForm,
  BookingRequestSchema,
  DefaultRequestValues,
} from "@/lib/validators/yup-validators";
import { usePackagesQuery } from "@/hooks/Packages";
import { DiscountCoupons, Package } from "@/lib/types";
import { formatNumber, parseValidDate } from "@/lib/helper-function";
import { IRequestType, IUser } from "@/types/type";
import { apiClient } from "@/lib/ApiClient";
import Iconify from "@/components/iconify/iconify";

// Smart defaults: today's date, next rounded hour
function getDefaultDate() {
  return new Date().toISOString();
}
function getDefaultTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export default function BookingNewEditForm() {
  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  type PlaceDetails = {
    description?: string;
    [key: string]: any;
  };
  const [stoppages, setStopages] = useState<PlaceDetails[]>([]);
  const [inputFields, setInputFields] = useState<string[]>([]);
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
  const { data: packages = [], isPending: isLoadingPackages } =
    usePackagesQuery();

  const methods = useForm<BookingRequestForm>({
    resolver: yupResolver(BookingRequestSchema),
    defaultValues: {
      ...DefaultRequestValues,
      bookingDate: getDefaultDate(),
      bookingTime: getDefaultTime(),
    },
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

  // Auto-fill client info when passenger is selected
  useEffect(() => {
    const passengerId = values.passengerId;
    if (!passengerId) return;
    const passenger = passengers.find((p) => p.id === passengerId);
    if (passenger) {
      setValue("clientName", `${passenger.firstName} ${passenger.lastName}`);
      setValue("clientEmail", passenger.emailAddress || "");
      setValue("clientPhone", passenger.phone_number ?? "");
    }
  }, [values.passengerId, passengers, setValue]);

  useEffect(() => {
    (async () => {
      if (values.startFrom?.description && values.destination?.description) {
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
          useAdmin: true,
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
        setValue("couponCode", "");
        setValue("couponPercentage", 0);
      } else {
        setValue("couponCode", couponResponse.data.coupon);
        setValue("couponPercentage", couponResponse.data.discount);
        setValue("couponExpiryDate", couponResponse.data.expiry);
        enqueueSnackbar(couponResponse.message);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply coupon";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setCouponLoading(false);
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
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 340px" } }}>
        {/* ═══════ Left Column — Form ═══════ */}
        <Stack spacing={3}>
          {/* 1. Passenger */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="solar:user-bold-duotone" width={22} color={theme.palette.primary.main} />
              Passenger
            </Typography>
            <RHFAutocomplete
              name="passenger"
              label="Select Passenger"
              placeholder="Search by name…"
              options={passengers.map((option) => option)}
              isOptionEqualToValue={(option, value) =>
                option.id === value.id
              }
              getOptionLabel={(option) =>
                `${option?.firstName} ${option?.lastName}`
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <ListItemText
                      primary={`${option?.firstName} ${option?.lastName}`}
                      secondary={`${option?.emailAddress} • ${option?.phone_number || ""}`}
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
            {values.passengerId && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Client details (auto-filled, editable)
                </Typography>
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }} gap={1.5}>
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientName" label="Client Name" size="small" />
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientPhone" label="Client Phone" size="small" />
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientEmail" type="email" label="Client Email" size="small" />
                </Box>
              </Box>
            )}
            {!values.passengerId && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, mb: 1 }}>
                  Or enter client details manually:
                </Typography>
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }} gap={2}>
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientName" label="Client Name" />
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientPhone" label="Client Phone" />
                  <RHFTextField InputLabelProps={{ shrink: true }} name="clientEmail" type="email" label="Client Email" />
                </Box>
              </>
            )}
          </Card>

          {/* 2. Journey */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="solar:route-bold-duotone" width={22} color={theme.palette.info.main} />
              Journey Details
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Box>
                <LocationInput name="startFrom" label="Pickup Location" />
                {errors?.startFrom && (
                  <Typography variant="caption" color="error.main">Pickup Location is required</Typography>
                )}
              </Box>
              <Box>
                <LocationInput name="destination" label="Drop Off Location" />
                {errors?.destination && (
                  <Typography variant="caption" color="error.main">Drop Off Location is required</Typography>
                )}
              </Box>
            </Box>

            {inputFields.map((_, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LocationInput
                    name={`stoppages.${index}`}
                    label={`Stoppage ${index + 1}`}
                  />
                </Box>
                <LoadingButton
                  type="button"
                  variant="soft"
                  color="error"
                  size="small"
                  onClick={() => removeInputField(index)}
                  sx={{ alignSelf: "center", minWidth: 36, px: 1 }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </LoadingButton>
              </Stack>
            ))}

            <LoadingButton
              variant="soft"
              size="small"
              onClick={addInputField}
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
              sx={{ mt: 2 }}
            >
              Add Stoppage
            </LoadingButton>
          </Card>

          {/* 3. Date, Time, Package */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="solar:calendar-bold-duotone" width={22} color={theme.palette.warning.main} />
              Schedule & Package
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Controller
                name="bookingDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Booking Date"
                    disablePast
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? newValue.toISOString() : null);
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
                  const timeValue = field.value
                    ? new Date(`1970-01-01T${field.value}:00`)
                    : null;

                  return (
                    <TimePicker
                      label="Booking Time"
                      value={timeValue}
                      ampm={false}
                      onChange={(newValue) => {
                        if (!newValue) {
                          field.onChange(null);
                        } else {
                          const h = newValue.getHours().toString().padStart(2, "0");
                          const m = newValue.getMinutes().toString().padStart(2, "0");
                          field.onChange(`${h}:${m}`);
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

            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }} gap={2} sx={{ mt: 2 }}>
              <RHFAutocomplete
                name="package"
                label="Package"
                placeholder="Select Package"
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
                    <Box sx={{ mr: 2 }}>
                      <AwsImageRender
                        placeHolderImage="/webAssets/images/placeholder/car.png"
                        height={40}
                        width={40}
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
                )}
                onChange={(
                  _: React.SyntheticEvent<Element, Event>,
                  newValue: Package
                ) => setValue("packageId", newValue?.id || "")}
                value={
                  packages.find((pkg) => pkg.id === watch("packageId")) ||
                  null
                }
              />
              <RHFTextField type="number" name="totalPersons" label="Persons" />
              <RHFTextField type="number" name="totalLuggage" label="Luggage" />
            </Box>
          </Card>

          {/* 4. Notes */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="solar:notes-bold-duotone" width={22} color={theme.palette.secondary.main} />
              Notes
            </Typography>
            <RHFTextField multiline name="notes" label="Notes" rows={3} />
          </Card>
        </Stack>

        {/* ═══════ Right Column — Price Summary (sticky) ═══════ */}
        <Box>
          <Card sx={{ p: 3, position: "sticky", top: 80 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="solar:tag-price-bold-duotone" width={22} color={theme.palette.success.main} />
              Price Summary
            </Typography>

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Distance</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {values?.totalDistance ? formatDistance(values.totalDistance) : "—"}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Duration</Typography>
                <Typography variant="body2" fontWeight={600} color={values.totalDuration ? "warning.main" : "text.secondary"}>
                  {values?.totalDuration ? formatDuration(values.totalDuration) : "—"}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Service Fee</Typography>
                <Typography variant="body2" fontWeight={600}>
                  £{priceDetails.serviceFee.toFixed(2)}
                </Typography>
              </Stack>

              {priceDetails.discountAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="success.main">Discount</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    -£{priceDetails.discountAmount.toFixed(2)}
                  </Typography>
                </Stack>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  £{priceDetails.totalFare.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Coupon */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Discount Coupon
            </Typography>
            <Stack direction="row" spacing={1}>
              <RHFTextField
                InputLabelProps={{ shrink: true }}
                name="couponCode"
                size="small"
                placeholder="Enter code"
              />
              <LoadingButton
                variant="contained"
                loading={couponLoading}
                color="success"
                type="button"
                onClick={onApplyCoupon}
                sx={{ minWidth: 70 }}
              >
                Apply
              </LoadingButton>
            </Stack>

            <LoadingButton
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              startIcon={<Iconify icon="solar:check-circle-bold" width={22} />}
              sx={{ mt: 3 }}
            >
              Create Booking
            </LoadingButton>
          </Card>
        </Box>
      </Box>
    </FormProvider>
  );
}
