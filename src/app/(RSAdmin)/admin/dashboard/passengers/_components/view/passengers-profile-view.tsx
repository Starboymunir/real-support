"use client";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { alpha, useTheme } from "@mui/material/styles";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import PassengerBookingListView from "../../../bookings/_components/view/passenger-booking-list-view";
import UserTransactionsListView from "../../../wallet/transactions/_components/view/user-transactions-list-view";
import { useUserByIdQuery } from "@/hooks/Users";
import Iconify from "@/components/iconify/iconify";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value || 0);
}

function MiniStat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: alpha(color, 0.12), color, flexShrink: 0 }}>
        <Iconify icon={icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>{label}</Typography>
        <Typography variant="subtitle2" fontWeight={600} noWrap>{value}</Typography>
      </Box>
    </Stack>
  );
}

export default function PassengerProfileView({ id }: { id: string }) {
  const theme = useTheme();
  const { data: passenger, isPending } = useUserByIdQuery(id);

  if (isPending) return <LoadingScreen />;

  const name = `${passenger?.firstName || ""} ${passenger?.lastName || ""}`.trim() || "Unknown";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Compute share data from transactions (where the actual price info lives)
  const shareTransactions = passenger?.shareTransactions || [];
  const shareHoldings = passenger?.shareHoldings || [];
  const totalShares = shareHoldings.reduce((sum: number, h: any) => sum + (h.quantity || 0), 0);
  const buyTransactions = shareTransactions.filter((t: any) => t.type === "BUY");
  const totalInvested = buyTransactions.reduce((sum: number, t: any) => sum + Math.abs(Number(t.total || 0)), 0);
  const avgPricePerShare = totalShares > 0 ? totalInvested / totalShares : 0;

  const statusColor = passenger?.status === "ACTIVE" ? "success" : passenger?.status === "SUSPEND" ? "error" : "warning";

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Passenger Details"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Users", href: paths.dashboard.passengers.root },
          { name },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      {/* ═══════ Profile Hero Card — Horizontal ═══════ */}
      <Card sx={{ mb: 3, p: { xs: 2.5, md: 3.5 }, border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`, boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
          {/* Avatar + Name Block */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
            <AwsImageAvatar
              imageKey={passenger?.coverImage || ""}
              alt={name}
              sx={{ width: 72, height: 72, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
            >
              {!passenger?.coverImage && (
                <Typography variant="h5" color="primary">{initials}</Typography>
              )}
            </AwsImageAvatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">{name}</Typography>
                <Chip label={passenger?.status || "UNKNOWN"} size="small" color={statusColor as any} variant="outlined" sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{passenger?.emailAddress || "-"}</Typography>
              <Typography variant="caption" color="text.disabled">Joined {passenger?.createdAt ? new Date(passenger.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</Typography>
            </Box>
          </Stack>

          {/* Vertical Divider on desktop */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
          <Divider sx={{ display: { xs: "block", md: "none" } }} />

          {/* Quick Stats Row */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 2.5, flex: 1 }}>
            <MiniStat icon="solar:phone-bold-duotone" label="Phone" value={passenger?.phone_number || "-"} color={theme.palette.success.main} />
            <MiniStat icon="solar:star-bold-duotone" label="Rating" value={passenger?.ratings ? `${passenger.ratings} / 5` : "5 / 5"} color={theme.palette.warning.main} />
            <MiniStat icon="solar:wallet-bold-duotone" label="Wallet" value={formatGBP(Number(passenger?.wallet?.balance || 0))} color={theme.palette.info.main} />
            <MiniStat icon="solar:calendar-mark-bold-duotone" label="Bookings" value={String(passenger?.bookings?.length || 0)} color={theme.palette.secondary.main} />
          </Box>
        </Stack>
      </Card>

      {/* ═══════ Share Holdings ═══════ */}
      {(totalShares > 0 || shareTransactions.length > 0) && (
        <Card sx={{ mb: 3, border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`, boxShadow: "none", overflow: "hidden" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3, pb: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 36, height: 36, borderRadius: 1, display: "grid", placeItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
                <Iconify icon="solar:graph-up-bold-duotone" width={20} />
              </Box>
              <Typography variant="h6">Share Holdings</Typography>
            </Stack>
            <Chip label={`${totalShares} shares`} size="small" color="primary" variant="soft" />
          </Stack>

          {/* Summary Row */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={0} divider={<Divider orientation="vertical" flexItem />} sx={{ px: 3, py: 2.5 }}>
            <Box sx={{ flex: 1, textAlign: "center", py: { xs: 1, sm: 0 } }}>
              <Typography variant="caption" color="text.secondary">Total Shares</Typography>
              <Typography variant="h5">{totalShares.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center", py: { xs: 1, sm: 0 } }}>
              <Typography variant="caption" color="text.secondary">Total Invested</Typography>
              <Typography variant="h5">{formatGBP(totalInvested)}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center", py: { xs: 1, sm: 0 } }}>
              <Typography variant="caption" color="text.secondary">Avg. Price / Share</Typography>
              <Typography variant="h5">{formatGBP(avgPricePerShare)}</Typography>
            </Box>
          </Stack>

          {/* Transaction History Table */}
          {shareTransactions.length > 0 && (
            <>
              <Divider />
              <Box sx={{ px: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pt: 2, pb: 1 }}>Transaction History</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price Each</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shareTransactions.map((tx: any) => (
                        <TableRow key={tx.id} hover>
                          <TableCell>
                            <Chip
                              label={tx.type}
                              size="small"
                              color={tx.type === "BUY" ? "success" : "error"}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: 11, height: 22, minWidth: 48 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>{tx.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{formatGBP(tx.price)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>{formatGBP(Math.abs(tx.total))}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Card>
      )}

      {/* ═══════ Bookings ═══════ */}
      <Card sx={{ mb: 3 }}>
        <PassengerBookingListView passengerId={id} />
      </Card>

      {/* ═══════ Transactions ═══════ */}
      <Card>
        <UserTransactionsListView userId={id} />
      </Card>
    </Container>
  );
}
