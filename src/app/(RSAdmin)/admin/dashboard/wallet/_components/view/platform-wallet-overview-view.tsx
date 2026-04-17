"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import { alpha, useTheme } from "@mui/material/styles";
import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useAdminTransactionsQuery, useUsersTransactionsQuery, useWithdrawalRequestsQuery } from "@/hooks/Transaction";
import axiosInstance from "@/lib/admin-axios";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function StatCard({
  title,
  value,
  icon,
  color,
  helper,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  helper?: string;
}) {
  return (
    <Card
      sx={{
        p: 2.5,
        height: "100%",
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: "none",
        transition: "all 0.2s",
        "&:hover": { borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.02) },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1.4 }}>{title}</Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.12),
            color,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
      </Stack>
      <Typography variant="h5" sx={{ mb: 0.5 }}>{value}</Typography>
      {!!helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
    </Card>
  );
}

export default function PlatformWalletOverviewView() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { data: adminTransactions = [], isPending: adminPending } = useAdminTransactionsQuery();
  const { data: userTransactions = [], isPending: usersPending } = useUsersTransactionsQuery();
  const { data: withdrawalRequests = [], isPending: withdrawalPending } = useWithdrawalRequestsQuery();

  const [shareData, setShareData] = useState<any>(null);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [sharesPending, setSharesPending] = useState(true);

  // Valuation adjustment form state
  const [valForm, setValForm] = useState({ assetValue: "", earningsValue: "", futureValue: "" });
  const [valSaving, setValSaving] = useState(false);

  // Expenses & outside earnings
  const [expenses, setExpenses] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [expForm, setExpForm] = useState({ description: "", amount: "", category: "General" });
  const [earnForm, setEarnForm] = useState({ description: "", amount: "", category: "General" });
  const [expSaving, setExpSaving] = useState(false);
  const [earnSaving, setEarnSaving] = useState(false);

  // Shareholders search & pagination
  const [shSearch, setShSearch] = useState("");
  const [shPage, setShPage] = useState(0);
  const [shRowsPerPage, setShRowsPerPage] = useState(10);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/company-shares").then((res) => res.data?.data || res.data).catch(() => null),
      axiosInstance.get("/company-shares/holdings").then((res) => res.data?.data || res.data || []).catch(() => []),
      axiosInstance.get("/company-shares/expenses").then((res) => res.data?.data || res.data || []).catch(() => []),
      axiosInstance.get("/company-shares/earnings").then((res) => res.data?.data || res.data || []).catch(() => []),
    ]).then(async ([share, holders, exps, earns]) => {
      setShareData(share);
      setExpenses(Array.isArray(exps) ? exps : []);
      setEarnings(Array.isArray(earns) ? earns : []);

      // If dedicated holdings endpoint returned data, use it; otherwise fall back to passengers list
      let finalHolders = Array.isArray(holders) ? holders : [];
      if (finalHolders.length === 0) {
        try {
          const passRes = await axiosInstance.get("/admin/passengers/all");
          const allPassengers = passRes.data?.data || passRes.data || [];
          finalHolders = allPassengers
            .filter((p: any) => p.shareHoldings?.some((h: any) => h.quantity > 0))
            .map((p: any) => {
              const holding = p.shareHoldings.find((h: any) => h.quantity > 0);
              return {
                id: holding?.id || p.id,
                userId: p.id,
                quantity: holding?.quantity || 0,
                user: { id: p.id, firstName: p.firstName, lastName: p.lastName, emailAddress: p.emailAddress, phone_number: p.phone_number },
              };
            });
        } catch {}
      }
      setShareholders(finalHolders);
      setSharesPending(false);
    });
  }, []);

  // Sync form with loaded share data
  useEffect(() => {
    if (shareData) {
      setValForm({
        assetValue: String(shareData.assetValue ?? ""),
        earningsValue: String(shareData.earningsValue ?? ""),
        futureValue: String(shareData.futureValue ?? ""),
      });
    }
  }, [shareData]);

  const handleValuationSave = async () => {
    setValSaving(true);
    try {
      const payload = {
        assetValue: Number(valForm.assetValue) || 0,
        earningsValue: Number(valForm.earningsValue) || 0,
        futureValue: Number(valForm.futureValue) || 0,
      };
      const res = await axiosInstance.patch("/company-shares/valuation", payload);
      const updated = res.data?.data || res.data;
      if (updated) setShareData(updated);
      enqueueSnackbar("Valuation updated successfully");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to update valuation", { variant: "error" });
    } finally {
      setValSaving(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expForm.description || !expForm.amount) return;
    setExpSaving(true);
    try {
      const res = await axiosInstance.post("/company-shares/expenses", {
        description: expForm.description,
        amount: Number(expForm.amount),
        category: expForm.category,
      });
      const created = res.data?.data || res.data;
      setExpenses((prev) => [created, ...prev]);
      setExpForm({ description: "", amount: "", category: "General" });
      enqueueSnackbar("Expense added");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to add expense", { variant: "error" });
    } finally {
      setExpSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await axiosInstance.delete(`/company-shares/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      enqueueSnackbar("Expense removed");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to delete", { variant: "error" });
    }
  };

  const handleAddEarning = async () => {
    if (!earnForm.description || !earnForm.amount) return;
    setEarnSaving(true);
    try {
      const res = await axiosInstance.post("/company-shares/earnings", {
        description: earnForm.description,
        amount: Number(earnForm.amount),
        category: earnForm.category,
      });
      const created = res.data?.data || res.data;
      setEarnings((prev) => [created, ...prev]);
      setEarnForm({ description: "", amount: "", category: "General" });
      enqueueSnackbar("Earning added");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to add earning", { variant: "error" });
    } finally {
      setEarnSaving(false);
    }
  };

  const handleDeleteEarning = async (id: string) => {
    try {
      await axiosInstance.delete(`/company-shares/earnings/${id}`);
      setEarnings((prev) => prev.filter((e) => e.id !== id));
      enqueueSnackbar("Earning removed");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to delete", { variant: "error" });
    }
  };

  const isLoading = adminPending || usersPending || withdrawalPending || sharesPending;

  const metrics = useMemo(() => {
    const totalTopUps = userTransactions
      .filter((t: any) => t?.type === "TOPUP" || t?.type === "DEPOSIT")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const totalWithdrawn = withdrawalRequests
      .filter((r: any) => r?.status === "PROCESSED")
      .reduce((sum: number, r: any) => sum + Math.abs(Number(r?.amount || 0)), 0);

    const platformBalance = totalTopUps - totalWithdrawn;

    const bookingCommission = [
      ...userTransactions.filter((t: any) => t?.type === "COMMISSION"),
      ...adminTransactions.filter((t: any) => t?.type === "COMMISSION"),
    ].reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const cancellationFees = userTransactions
      .filter((t: any) => t?.type === "CANCELLATION_FEE")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const adminCharges = userTransactions
      .filter((t: any) => t?.type === "ADMIN_CHARGE")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const totalCommission = bookingCommission + cancellationFees + adminCharges;

    const totalExpenses = userTransactions
      .filter((t: any) => t?.type === "EXPENSE")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const pendingWithdrawals = withdrawalRequests
      .filter((r: any) => r?.status === "PENDING")
      .reduce((sum: number, r: any) => sum + Math.abs(Number(r?.amount || 0)), 0);

    const availableBalance = totalTopUps - totalWithdrawn - pendingWithdrawals;

    const sharesSold = shareData ? (shareData.totalShares - 10000) : 0;
    const sharePrice = shareData?.price || 0;
    const sharesRevenue = sharesSold * sharePrice;
    const shareSpreadProfit = sharesRevenue * 0.10;

    const companyExpenses = expenses.reduce((sum: number, e: any) => sum + Math.abs(Number(e?.amount || 0)), 0);
    const outsideEarnings = earnings.reduce((sum: number, e: any) => sum + Math.abs(Number(e?.amount || 0)), 0);

    const grossRevenue = totalCommission + shareSpreadProfit + outsideEarnings;
    const netProfit = grossRevenue - companyExpenses;

    return {
      platformBalance,
      totalTopUps,
      totalWithdrawn,
      totalCommission,
      bookingCommission,
      cancellationFees,
      adminCharges,
      totalExpenses,
      pendingWithdrawals,
      availableBalance,
      txCount: userTransactions.length + adminTransactions.length,
      sharesSold,
      sharePrice,
      sharesRevenue,
      shareSpreadProfit,
      companyValuation: shareData?.finalValuation || 0,
      totalSharesIssued: shareData?.totalShares || 10000,
      assetValue: shareData?.assetValue || 0,
      earningsValue: shareData?.earningsValue || 0,
      futureValue: shareData?.futureValue || 0,
      sellPrice: shareData?.sellPrice || 0,
      companyExpenses,
      outsideEarnings,
      grossRevenue,
      netProfit,
    };
  }, [adminTransactions, userTransactions, withdrawalRequests, shareData, expenses, earnings]);

  if (isLoading) return <LoadingScreen />;

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Financial Overview"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Finances", href: paths.dashboard.wallet.root },
          { name: "Overview" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* ═══════ Platform Wallet ═══════ */}
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon="solar:wallet-bold-duotone" width={22} />
        Platform Wallet
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 4 }}>
        <StatCard title="Platform Balance" value={formatGBP(metrics.platformBalance)} icon="solar:wallet-money-bold-duotone" color={theme.palette.primary.main} helper="Total received minus total dispensed" />
        <StatCard title="Total Received" value={formatGBP(metrics.totalTopUps)} icon="solar:card-recive-bold-duotone" color={theme.palette.success.main} helper="Top-ups & deposits into the platform" />
        <StatCard title="Total Dispensed" value={formatGBP(metrics.totalWithdrawn)} icon="solar:card-send-bold-duotone" color={theme.palette.error.main} helper="Processed withdrawal payouts" />
        <StatCard title="Available Balance" value={formatGBP(metrics.availableBalance)} icon="solar:safe-circle-bold-duotone" color={theme.palette.info.main} helper="After pending withdrawals" />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ═══════ Company Profit ═══════ */}
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon="solar:chart-bold-duotone" width={22} />
        Company Profit
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 2 }}>
        <StatCard title="Net Profit" value={formatGBP(metrics.netProfit)} icon="solar:dollar-minimalistic-bold-duotone" color={metrics.netProfit >= 0 ? theme.palette.success.dark : theme.palette.error.main} helper="Gross revenue minus company expenses" />
        <StatCard title="Gross Revenue" value={formatGBP(metrics.grossRevenue)} icon="solar:chart-bold-duotone" color={theme.palette.success.main} helper="Commission + share margin + outside earnings" />
        <StatCard title="Company Expenses" value={formatGBP(metrics.companyExpenses)} icon="solar:bill-list-bold-duotone" color={theme.palette.error.main} helper="All recorded company expenses" />
        <StatCard title="Outside Earnings" value={formatGBP(metrics.outsideEarnings)} icon="solar:hand-money-bold-duotone" color={theme.palette.info.main} helper="Revenue from non-platform sources" />
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 4 }}>
        <StatCard title="Booking Commission" value={formatGBP(metrics.bookingCommission)} icon="solar:ticket-bold-duotone" color={theme.palette.warning.main} helper="Commission from ride bookings" />
        <StatCard title="Cancellation Fees" value={formatGBP(metrics.cancellationFees)} icon="solar:close-circle-bold-duotone" color={theme.palette.error.light} helper="Fees collected from cancellations" />
        <StatCard title="Share Spread Margin" value={formatGBP(metrics.shareSpreadProfit)} icon="solar:graph-up-bold-duotone" color={theme.palette.secondary.main} helper="10% margin on share sell-backs" />
        <StatCard title="Admin Charges" value={formatGBP(metrics.adminCharges)} icon="solar:shield-user-bold-duotone" color={theme.palette.primary.main} helper="Manual admin charges to users" />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ═══════ Shares & Valuation ═══════ */}
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon="solar:graph-up-bold-duotone" width={22} />
        Shares & Valuation
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 2 }}>
        <StatCard title="Share Price" value={formatGBP(metrics.sharePrice)} icon="solar:tag-price-bold-duotone" color={theme.palette.primary.main} helper={`Sell price: ${formatGBP(metrics.sellPrice)}`} />
        <StatCard title="Total Shares" value={metrics.totalSharesIssued.toLocaleString()} icon="solar:users-group-rounded-bold-duotone" color={theme.palette.info.main} helper="All shares belong to a holder" />
        <StatCard title="Shares Revenue" value={formatGBP(metrics.sharesRevenue)} icon="solar:card-recive-bold-duotone" color={theme.palette.success.main} helper="Total revenue from shares sold" />
        <StatCard title="Company Valuation" value={formatGBP(metrics.companyValuation)} icon="solar:buildings-bold-duotone" color={theme.palette.warning.dark} helper="Based on share valuation model" />
      </Box>

      <Card sx={{ p: 2.5, mb: 4, border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`, boxShadow: "none" }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Valuation Breakdown</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Asset Value</Typography>
            <Typography variant="h6">{formatGBP(metrics.assetValue)}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Earnings Value</Typography>
            <Typography variant="h6">{formatGBP(metrics.earningsValue)}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Future Value</Typography>
            <Typography variant="h6">{formatGBP(metrics.futureValue)}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Final Valuation</Typography>
            <Typography variant="h6" sx={{ color: "success.main" }}>{formatGBP(metrics.companyValuation)}</Typography>
            <Typography variant="caption" color="text.secondary">(Asset + Earnings + Future) / 3</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Valuation Adjustment Form */}
      <Card sx={{ p: 2.5, mb: 4, border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`, boxShadow: "none" }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Adjust Valuation Inputs</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
          <TextField
            label="Asset Value"
            type="number"
            size="small"
            value={valForm.assetValue}
            onChange={(e) => setValForm((f) => ({ ...f, assetValue: e.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Earnings Value"
            type="number"
            size="small"
            value={valForm.earningsValue}
            onChange={(e) => setValForm((f) => ({ ...f, earningsValue: e.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Future Value"
            type="number"
            size="small"
            value={valForm.futureValue}
            onChange={(e) => setValForm((f) => ({ ...f, futureValue: e.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleValuationSave}
            disabled={valSaving}
            startIcon={valSaving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:pen-bold" width={18} />}
            sx={{ minWidth: 140, height: 40 }}
          >
            {valSaving ? "Saving…" : "Update"}
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Final valuation = (Asset + Earnings + Future) / 3. This recalculates share prices automatically.
        </Typography>
      </Card>

      {/* Shareholders table */}
      {shareholders.length > 0 && (() => {
        const q = shSearch.toLowerCase().trim();
        const filtered = q
          ? shareholders.filter((h: any) => {
              const u = h.user || {};
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ").toLowerCase();
              return name.includes(q) || (u.emailAddress || "").toLowerCase().includes(q) || (u.phone_number || "").includes(q);
            })
          : shareholders;
        const paged = filtered.slice(shPage * shRowsPerPage, shPage * shRowsPerPage + shRowsPerPage);
        return (
        <Card sx={{ mb: 4, border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`, boxShadow: "none", overflow: "hidden" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Shareholders
            </Typography>
            <Chip label={`${filtered.length} holders`} size="small" color="primary" variant="outlined" />
          </Stack>

          <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name, email or phone…"
              value={shSearch}
              onChange={(e) => { setShSearch(e.target.value); setShPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer sx={{ px: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Shares</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((h: any) => {
                  const user = h.user || {};
                  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
                  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  const holdingValue = (h.quantity || 0) * (metrics.sharePrice || 0);
                  return (
                    <TableRow key={h.id || h.userId} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}>
                            {initials}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>{name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{user.emailAddress || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{user.phone_number || "-"}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{(h.quantity || 0).toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{formatGBP(holdingValue)}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filtered.length}
            page={shPage}
            onPageChange={(_, p) => setShPage(p)}
            rowsPerPage={shRowsPerPage}
            onRowsPerPageChange={(e) => { setShRowsPerPage(parseInt(e.target.value, 10)); setShPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Card>
        );
      })()}

      <Divider sx={{ mb: 4 }} />

      {/* ═══════ Company Expenses & Outside Earnings ═══════ */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mb: 4 }}>

        {/* ── Expenses ── */}
        <Card sx={{ border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`, boxShadow: "none", overflow: "hidden" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ mr: 1, verticalAlign: "text-bottom", color: "error.main" }} />
              Company Expenses
            </Typography>
            <Chip label={formatGBP(metrics.companyExpenses)} size="small" color="error" variant="outlined" />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ px: 2.5, pb: 2 }}>
            <TextField size="small" placeholder="Description" value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))} sx={{ flex: 2 }} />
            <TextField size="small" placeholder="Amount" type="number" value={expForm.amount} onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }} sx={{ flex: 1 }} />
            <TextField size="small" select value={expForm.category} onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value }))} sx={{ flex: 1, minWidth: 120 }}>
              {["General", "Web Development", "Marketing", "Office", "Salary", "Legal", "Insurance", "Other"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <Button variant="contained" color="error" onClick={handleAddExpense} disabled={expSaving} sx={{ minWidth: 80 }}>
              {expSaving ? <CircularProgress size={18} color="inherit" /> : "Add"}
            </Button>
          </Stack>

          {expenses.length > 0 && (
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, width: 50 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e: any) => (
                    <TableRow key={e.id} hover>
                      <TableCell><Typography variant="body2">{e.description}</Typography></TableCell>
                      <TableCell><Chip label={e.category} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={600} color="error.main">{formatGBP(e.amount)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="caption" color="text.secondary">{new Date(e.date || e.createdAt).toLocaleDateString("en-GB")}</Typography></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleDeleteExpense(e.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* ── Outside Earnings ── */}
        <Card sx={{ border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`, boxShadow: "none", overflow: "hidden" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              <Iconify icon="solar:hand-money-bold-duotone" width={20} sx={{ mr: 1, verticalAlign: "text-bottom", color: "info.main" }} />
              Outside Earnings
            </Typography>
            <Chip label={formatGBP(metrics.outsideEarnings)} size="small" color="info" variant="outlined" />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ px: 2.5, pb: 2 }}>
            <TextField size="small" placeholder="Description" value={earnForm.description} onChange={(e) => setEarnForm((f) => ({ ...f, description: e.target.value }))} sx={{ flex: 2 }} />
            <TextField size="small" placeholder="Amount" type="number" value={earnForm.amount} onChange={(e) => setEarnForm((f) => ({ ...f, amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }} sx={{ flex: 1 }} />
            <TextField size="small" select value={earnForm.category} onChange={(e) => setEarnForm((f) => ({ ...f, category: e.target.value }))} sx={{ flex: 1, minWidth: 120 }}>
              {["General", "Consulting", "Partnership", "Investment", "Sponsorship", "Other"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <Button variant="contained" color="info" onClick={handleAddEarning} disabled={earnSaving} sx={{ minWidth: 80 }}>
              {earnSaving ? <CircularProgress size={18} color="inherit" /> : "Add"}
            </Button>
          </Stack>

          {earnings.length > 0 && (
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, width: 50 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {earnings.map((e: any) => (
                    <TableRow key={e.id} hover>
                      <TableCell><Typography variant="body2">{e.description}</Typography></TableCell>
                      <TableCell><Chip label={e.category} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={600} color="info.main">{formatGBP(e.amount)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="caption" color="text.secondary">{new Date(e.date || e.createdAt).toLocaleDateString("en-GB")}</Typography></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleDeleteEarning(e.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ═══════ Operations ═══════ */}
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon="solar:clipboard-text-bold-duotone" width={22} />
        Operations
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}>
        <StatCard title="User Expenses" value={formatGBP(metrics.totalExpenses)} icon="solar:cart-large-minimalistic-bold-duotone" color={theme.palette.warning.main} helper="Booking payments & charges" />
        <StatCard title="Pending Withdrawals" value={formatGBP(metrics.pendingWithdrawals)} icon="solar:hourglass-bold-duotone" color={theme.palette.warning.dark} helper="Awaiting admin action" />
        <StatCard title="Admin Charges" value={formatGBP(metrics.adminCharges)} icon="solar:shield-user-bold-duotone" color={theme.palette.secondary.main} helper="Manual admin charges to users" />
        <StatCard title="Total Transactions" value={metrics.txCount.toLocaleString()} icon="solar:bill-list-bold-duotone" color={theme.palette.info.dark} helper="All recorded transactions" />
      </Box>
    </Container>
  );
}
