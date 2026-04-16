"use client";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import PassengerProfileCover from "../passengers-profile-cover";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import PassengerBookingListView from "../../../bookings/_components/view/passenger-booking-list-view";
import UserTransactionsListView from "../../../wallet/transactions/_components/view/user-transactions-list-view";
import { useUserByIdQuery } from "@/hooks/Users";
import Iconify from "@/components/iconify/iconify";

function InfoItem({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor: (theme) => alpha(color || theme.palette.primary.main, 0.1),
          color: color || "primary.main",
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function PassengerProfileView({ id }: { id: string }) {
  const theme = useTheme();
  const { data: passenger, isPending } = useUserByIdQuery(id);

  const shareHoldings = passenger?.shareHoldings || [];
  const totalShares = shareHoldings.reduce((sum: number, h: any) => sum + (h.quantity || 0), 0);
  const totalInvested = shareHoldings.reduce((sum: number, h: any) => sum + (h.totalCost || 0), 0);
  const currentValue = shareHoldings.reduce(
    (sum: number, h: any) => sum + ((h.quantity || 0) * (h.currentPrice || h.purchasePrice || 0)),
    0
  );

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container>
            <CustomBreadcrumbs
              heading="Passenger details"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Passenger", href: paths.dashboard.passengers.root },
                { name: passenger?.firstName + " " + passenger?.lastName },
              ]}
              sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card sx={{ mb: 3, height: { xs: 230, md: 170 } }}>
              <PassengerProfileCover
                role={passenger?.emailAddress || ""}
                avatarUrl={passenger?.coverImage || ""}
                name={passenger?.firstName + " " + passenger?.lastName}
                phone_number={`${passenger?.phone_number}`}
                ratings={passenger?.ratings || 5}
              />
            </Card>

            {/* Passenger Information */}
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Passenger Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:user-bold-duotone" label="Full Name" value={`${passenger?.firstName || ""} ${passenger?.lastName || ""}`} color={theme.palette.primary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:letter-bold-duotone" label="Email" value={passenger?.emailAddress || "-"} color={theme.palette.info.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:phone-bold-duotone" label="Phone" value={passenger?.phone_number || "-"} color={theme.palette.success.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:star-bold-duotone" label="Rating" value={passenger?.ratings ? `${passenger.ratings} / 5` : "-"} color={theme.palette.warning.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:wallet-bold-duotone" label="Wallet Balance" value={passenger?.wallet?.balance != null ? `£${Number(passenger.wallet.balance).toFixed(2)}` : "-"} color={theme.palette.success.dark} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon="solar:calendar-bold-duotone" label="Registered" value={passenger?.createdAt ? new Date(passenger.createdAt).toLocaleDateString() : "-"} color={theme.palette.secondary.main} />
                </Grid>
              </Grid>
            </Card>

            {/* Shares Information */}
            {shareHoldings.length > 0 && (
              <Card sx={{ mb: 3, p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Share Holdings
                  </Typography>
                  <Chip
                    label={`${totalShares} shares`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                      <Typography variant="caption" color="text.secondary">Total Shares</Typography>
                      <Typography variant="h5">{totalShares.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.06) }}>
                      <Typography variant="caption" color="text.secondary">Total Invested</Typography>
                      <Typography variant="h5">£{totalInvested.toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06) }}>
                      <Typography variant="caption" color="text.secondary">Current Value</Typography>
                      <Typography variant="h5">£{currentValue.toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                {/* Individual holdings */}
                <Stack spacing={1.5}>
                  {shareHoldings.map((holding: any, index: number) => (
                    <Stack
                      key={holding.id || index}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                          }}
                        >
                          <Iconify icon="solar:graph-up-bold-duotone" width={18} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {holding.quantity} shares
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Bought @ £{Number(holding.purchasePrice || 0).toFixed(4)} each
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" fontWeight={600}>
                          £{Number(holding.totalCost || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {holding.createdAt ? new Date(holding.createdAt).toLocaleDateString() : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}

            <Card sx={{ mb: 3 }}>
              <PassengerBookingListView passengerId={id} />
            </Card>

            <Card>
              <UserTransactionsListView userId={id} />
            </Card>
          </Container>
        </>
      )}
    </>
  );
}
