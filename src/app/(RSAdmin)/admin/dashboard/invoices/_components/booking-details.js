"use client";
import React from "react";
import { useBookingQuery } from "@/hooks/Bookings";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingScreen } from "../../../common/loading-screen";
import moment from "moment/moment";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { Container } from "@mui/system";
import CustomBreadcrumbs from "../../../common/custom-breadcrumbs";
import { paths } from "../../../routes/paths";
import { useSettingsContext } from "../../../common/settings";
import Label from "../../../common/label";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusColor(status) {
  if (status === "COMPLETED" || status === "ACCEPTED") return "success";
  if (status === "CANCELLED" || status === "REJECTED") return "error";
  if (status === "WAY_TO_PICKUP" || status === "WAY_TO_DESTINATION") return "info";
  if (status === "ARRIVED" || status === "PICKED_UP" || status === "PENDING") return "warning";
  return "default";
}

function formatStatus(status) {
  const map = {
    WAY_TO_PICKUP: "Way to Pickup",
    WAY_TO_DESTINATION: "Way to Destination",
    PICKED_UP: "Picked Up",
  };
  return map[status] ?? status ?? "—";
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function StarRating({ value }) {
  const stars = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Typography
          key={i}
          component="span"
          sx={{ fontSize: 18, color: i <= stars ? "warning.main" : "text.disabled", lineHeight: 1 }}
        >
          ★
        </Typography>
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
        {value ?? "N/A"}
      </Typography>
    </Stack>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const BookingDetails = ({ id }) => {
  const { data, isPending: isLoading } = useBookingQuery(id);
  const settings = useSettingsContext();

  if (isLoading) return <LoadingScreen />;

  const netTotal = (Number(data?.totalBill) || 0) - (Number(data?.discountAmount) || 0);
  const hasRatings = data?.passengerRating || data?.driverRating;

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="Invoice Detail"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Invoices", href: paths?.dashboard?.invoices?.root },
          { name: "Detail" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* ── Passenger card ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Passenger" />
            <Divider />
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2.5}>
                <AwsImageAvatar
                  imageKey={data?.riderInfo?.coverImage}
                  alt="passenger"
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {data?.riderInfo?.firstName} {data?.riderInfo?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data?.riderInfo?.emailAddress}
                  </Typography>
                </Box>
              </Stack>
              <InfoItem label="Phone" value={data?.riderInfo?.phone_number} />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Driver card ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Driver" />
            <Divider />
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2.5}>
                <AwsImageAvatar
                  imageKey={
                    data?.driverInfo?.userInfo?.coverImage ||
                    data?.driverInfo?.userInfo?.profileImageUrl
                  }
                  alt="driver"
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {data?.driverInfo?.userInfo?.firstName}{" "}
                    {data?.driverInfo?.userInfo?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data?.driverInfo?.userInfo?.emailAddress}
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={2}>
                {data?.commission && (
                  <InfoItem label="Commission" value={data.commission} />
                )}
                {data?.nationalInsuranceNumber && (
                  <InfoItem label="NI Number" value={data.nationalInsuranceNumber} />
                )}
                {data?.selfAssessmentTaxId && (
                  <InfoItem label="Self-Assessment Tax ID" value={data.selfAssessmentTaxId} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Booking overview card ── */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Booking Overview"
              action={
                data?.status ? (
                  <Label variant="filled" color={getStatusColor(data.status)}>
                    {formatStatus(data.status)}
                  </Label>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Booking Date"
                    value={data?.bookingDate ? moment(data.bookingDate).format("DD MMM YYYY") : "—"}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Package" value={data?.packageInfo?.name} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Start From" value={data?.startFrom?.name || data?.startFrom?.description} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Destination" value={data?.destination?.name || data?.destination?.description} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Persons" value={data?.totalPersons ?? "—"} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Luggage" value={data?.totalLuggage ?? "—"} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Total Distance"
                    value={data?.totalDistance ? `${Number(data.totalDistance).toFixed(2)} km` : "—"}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Total Duration"
                    value={data?.totalDuration ? `${Math.round(Number(data.totalDuration))} min` : "—"}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Stops" value={data?.stoppages?.length ?? 0} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Ratings card (conditional) ── */}
        {hasRatings && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Ratings & Reviews" />
              <Divider />
              <CardContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 0.75 }}
                    >
                      Passenger Rating
                    </Typography>
                    <StarRating value={data?.passengerRating} />
                    {data?.passengerReview && (
                      <Typography variant="body2" color="text.secondary" mt={0.75}>
                        &quot;{data.passengerReview}&quot;
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 0.75 }}
                    >
                      Driver Rating
                    </Typography>
                    <StarRating value={data?.driverRating} />
                    {data?.driverReview && (
                      <Typography variant="body2" color="text.secondary" mt={0.75}>
                        &quot;{data.driverReview}&quot;
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ── Billing card ── */}
        <Grid item xs={12} md={hasRatings ? 6 : 12}>
          <Card>
            <CardHeader title="Billing Summary" />
            <Divider />
            <CardContent>
              <Stack spacing={1.5} sx={{ maxWidth: 400 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Total Bill</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    £{Number(data?.totalBill ?? 0).toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    − £{Number(data?.discountAmount ?? 0).toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {data?.paymentType ?? "—"}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Net Total</Typography>
                  <Typography variant="subtitle2" color="primary.main">
                    £{netTotal.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingDetails;
