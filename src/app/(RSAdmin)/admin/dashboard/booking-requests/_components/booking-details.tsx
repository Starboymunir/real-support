"use client";

import React from "react";
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
import CustomBreadcrumbs from "../../../common/custom-breadcrumbs/custom-breadcrumbs";
import { Container } from "@mui/system";
import { paths } from "../../../routes/paths";
import { useRequestQuery } from "@/hooks/Requests";
import { formatDistance, formatDuration } from "@/lib/helper-function";
import Label from "../../../common/label";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(status: string): "success" | "warning" | "error" | "default" {
  if (status === "ACCEPTED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED") return "error";
  return "default";
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  WALLET: "Wallet",
  CASHANDWALLET: "Cash & Wallet",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  INVOICE: "Invoice",
};

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
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

// ── Component ─────────────────────────────────────────────────────────────────

const BookingRequestDetails = ({ id }: { id: string }) => {
  const { data, isPending } = useRequestQuery(id);

  if (isPending) return <LoadingScreen />;

  const netTotal = (data?.totalBill ?? 0) - (data?.discountAmount ?? 0);

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Booking Request Detail"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Requests", href: paths.dashboard.requests.root },
          { name: "Detail" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* ── Passenger card ── */}
        <Grid item xs={12} md={4}>
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

              <Stack spacing={2}>
                <InfoItem
                  label="Phone"
                  value={data?.clientNumber || data?.riderInfo?.phone_number}
                />
                {data?.clientName && (
                  <InfoItem label="Client Name" value={data.clientName} />
                )}
                {data?.clientEmail && (
                  <InfoItem label="Client Email" value={data.clientEmail} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Booking overview card ── */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Booking Overview"
              action={
                data?.status ? (
                  <Label variant="filled" color={getStatusColor(data.status)}>
                    {data.status}
                  </Label>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    label="Booking Date"
                    value={moment(data?.bookingDate).format("DD MMM YYYY")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Package" value={data?.packageInfo?.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Request Type" value={data?.requestType} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Stops" value={data?.stoppages?.length ?? 0} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Persons" value={data?.totalPersons ?? 0} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Luggage" value={data?.totalLuggage ?? 0} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Journey details card ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Journey Details" />
            <Divider />
            <CardContent>
              <Stack spacing={2.5}>
                <InfoItem
                  label="Start From"
                  value={
                    data?.startFrom?.description ||
                    data?.startFrom?.name ||
                    data?.startFrom?.formatted_address
                  }
                />
                <InfoItem
                  label="Destination"
                  value={
                    data?.destination?.description ||
                    data?.destination?.name ||
                    data?.destination?.formatted_address
                  }
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InfoItem
                      label="Total Distance"
                      value={formatDistance(data?.totalDistance ?? 0)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoItem
                      label="Total Duration"
                      value={formatDuration(data?.totalDuration ?? 0)}
                    />
                  </Grid>
                </Grid>

                {Array.isArray(data?.stoppages) && data.stoppages.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 1 }}
                    >
                      Stoppages
                    </Typography>
                    <Stack spacing={0.5}>
                      {data.stoppages.map((stop: any, idx: number) => (
                        <Typography key={idx} variant="body2">
                          {idx + 1}.{" "}
                          {stop?.name || stop?.description || stop?.formatted_address || JSON.stringify(stop)}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Billing summary card ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Billing Summary" />
            <Divider />
            <CardContent>
              <Stack spacing={1.5}>
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

                {data?.couponCode && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Coupon</Typography>
                    <Typography variant="body2" fontWeight={500}>{data.couponCode}</Typography>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {PAYMENT_LABELS[data?.paymentType] ?? data?.paymentType ?? "—"}
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

export default BookingRequestDetails;
