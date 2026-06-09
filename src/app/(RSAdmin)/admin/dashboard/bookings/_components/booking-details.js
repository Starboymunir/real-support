'use client'
import React from 'react'
import { useBookingQuery } from '@/hooks/Bookings'
import { Box, Card, CardContent, CardHeader, Divider, Grid, Stack, Typography } from '@mui/material'
import { LoadingScreen } from '../../../common/loading-screen'
import moment from 'moment/moment'
import AwsImageAvatar from '../../../common/aws-image-avatar/Avatar'
import { Container } from '@mui/system'
import CustomBreadcrumbs from '../../../common/custom-breadcrumbs'
import { paths } from '../../../routes/paths'
import { useSettingsContext } from '../../../common/settings'
import Label from '../../../common/label'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusColor(status) {
  if (status === 'COMPLETED' || status === 'ACCEPTED') return 'success'
  if (status === 'CANCELLED' || status === 'REJECTED') return 'error'
  if (status === 'WAY_TO_PICKUP' || status === 'WAY_TO_DESTINATION') return 'info'
  if (status === 'ARRIVED' || status === 'PICKED_UP' || status === 'PENDING') return 'warning'
  return 'default'
}

function formatStatus(status) {
  const map = {
    WAY_TO_PICKUP: 'Way to Pickup',
    WAY_TO_DESTINATION: 'Way to Destination',
    PICKED_UP: 'Picked Up',
  }
  return map[status] ?? status ?? '—'
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

function StarRating({ value }) {
  const stars = Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Typography
          key={i}
          component="span"
          sx={{ fontSize: 18, color: i <= stars ? 'warning.main' : 'text.disabled', lineHeight: 1 }}
        >
          ★
        </Typography>
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
        {value ?? 'N/A'}
      </Typography>
    </Stack>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

const BookingDetails = ({ id }) => {
  const { data, isPending: isLoading } = useBookingQuery(id)
  const settings = useSettingsContext()

  if (isLoading) return <LoadingScreen />

  const netTotal = (Number(data?.totalBill) || 0) - (Number(data?.discountAmount) || 0)
  const hasRatings = data?.passengerRating || data?.driverRating

  console.log('Booking Details Data:', data)

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Booking Detail"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Bookings', href: paths?.dashboard?.bookings?.root },
          { name: 'Detail' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} width={'100%'}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems="stretch"
            sx={{ width: '100%' }}
          >
            {/* ── Passenger card ── */}
            <Card sx={{ flex: 1, width: '100%' }}>
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
            {/* ── Driver card ── */}
            <Card sx={{ flex: 1, width: '100%' }}>
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
                      {data?.driverInfo?.userInfo?.firstName} {data?.driverInfo?.userInfo?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data?.driverInfo?.userInfo?.emailAddress}
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={2}>
                  {data?.commissionPercentage && <InfoItem label="Commission Percentage" value={data.commissionPercentage} />}
                  {data?.nationalInsuranceNumber && (
                    <InfoItem label="NI Number" value={data.nationalInsuranceNumber} />
                  )}
                  {data?.selfAssessmentTaxId && (
                    <InfoItem label="Self-Assessment Tax ID" value={data.selfAssessmentTaxId} />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
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
                    value={data?.bookingDate ? moment(data.bookingDate).format('DD MMM YYYY') : '—'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Package" value={data?.packageInfo?.name} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Start From"
                    value={data?.startFrom?.name || data?.startFrom?.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Destination"
                    value={data?.destination?.name || data?.destination?.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Persons" value={data?.totalPersons ?? 0} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Luggage" value={data?.totalLuggage ?? 0} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Total Distance"
                    value={
                      data?.totalDistance ? `${Number(data.totalDistance).toFixed(2)} km` : '—'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Total Duration"
                    value={
                      data?.totalDuration ? `${Math.round(Number(data.totalDuration))} min` : '—'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Stops" value={data?.stoppages?.length ?? 0} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Billing card - Ratings ── */}
        <Grid item sx={12} width={'100%'}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems="stretch"
            sx={{ width: '100%' }}
          >
            {/* Billing Summary */}
            <Card sx={{ flex: 1, width: '100%' }}>
              <CardHeader title="Billing Summary" />
              <Divider />

              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Bill
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      £{Number(data?.totalBill ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>

                  {Number(data?.waitingFee ?? 0) > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Waiting Fee ({Number(data?.totalWaitingTime ?? 0)} min)
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        £{Number(data?.waitingFee ?? 0).toFixed(2)}
                      </Typography>
                    </Stack>
                  )}

                  {Number(data?.tipAmount ?? 0) > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Tip to Driver
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="success.main">
                        £{Number(data?.tipAmount ?? 0).toFixed(2)}
                      </Typography>
                    </Stack>
                  )}

                  {Number(data?.cashCollected ?? 0) > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Cash Collected
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        £{Number(data?.cashCollected ?? 0).toFixed(2)}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      − £{Number(data?.discountAmount ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Commission
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      £{Number(data?.commission ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Final Bill
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      £{Number(data?.finalBill ?? data?.totalBill ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {data?.paymentType ?? '—'}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Net Total</Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      £{netTotal.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Ratings */}
            {hasRatings && (
              <Card sx={{ flex: 1, width: '100%' }}>
                <CardHeader title="Ratings & Reviews" />
                <Divider />

                <CardContent>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          display: 'block',
                          mb: 0.75,
                        }}
                      >
                        Passenger Rating
                      </Typography>

                      <StarRating value={data?.passengerRating} />

                      {data?.passengerReview && (
                        <Typography variant="body2" color="text.secondary" mt={0.75}>
                          “{data.passengerReview}”
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          display: 'block',
                          mb: 0.75,
                        }}
                      >
                        Driver Rating
                      </Typography>

                      <StarRating value={data?.driverRating} />

                      {data?.driverReview && (
                        <Typography variant="body2" color="text.secondary" mt={0.75}>
                          “{data.driverReview}”
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

export default BookingDetails
