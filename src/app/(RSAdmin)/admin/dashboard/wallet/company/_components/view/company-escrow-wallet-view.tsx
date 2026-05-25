"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { alpha } from "@mui/material/styles";

import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import axiosInstance from "@/lib/admin-axios";

type Direction = "CREDIT" | "DEBIT";
type TxType = "INCOME" | "EXPENSE" | "COMMISSION";

interface WalletSummary {
  id: string;
  balance: number;
  totalInflow: number;
  totalOutflow: number;
  totalCommission: number;
  transactionCount: number;
  updatedAt?: string;
}

interface AdminTxn {
  id: string;
  amount: number;
  type: TxType;
  narration?: string | null;
  createdAt: string;
  userInfo?: {
    id: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    role?: string;
  } | null;
}

const TYPE_TABS: { value: "all" | TxType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "INCOME", label: "Inflow" },
  { value: "EXPENSE", label: "Outflow" },
  { value: "COMMISSION", label: "Commission" },
];

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data) as T;
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <Card
      sx={{
        p: 2.5,
        flex: 1,
        minWidth: 200,
        border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
        boxShadow: "none",
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
      </Stack>
      <Typography variant="h5">{value}</Typography>
    </Card>
  );
}

export default function CompanyEscrowWalletView() {
  const { enqueueSnackbar } = useSnackbar();

  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [txns, setTxns] = useState<AdminTxn[]>([]);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnLoading, setTxnLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");

  const [openAdjust, setOpenAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState<{
    amount: string;
    direction: Direction;
    narration: string;
  }>({ amount: "", direction: "CREDIT", narration: "" });
  const [adjustSaving, setAdjustSaving] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await axiosInstance.get("/super-admin/company-wallet");
      setSummary(unwrap<WalletSummary>(res));
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to load wallet", { variant: "error" });
    } finally {
      setSummaryLoading(false);
    }
  }, [enqueueSnackbar]);

  const loadTxns = useCallback(async () => {
    try {
      setTxnLoading(true);
      const params: any = { page: page + 1, count: rowsPerPage };
      if (typeFilter !== "all") params.type = typeFilter;
      const res = await axiosInstance.get("/super-admin/company-wallet/transactions", { params });
      const payload = unwrap<{ items: AdminTxn[]; pagination: { total: number } }>(res);
      setTxns(payload?.items || []);
      setTxnTotal(payload?.pagination?.total || 0);
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to load transactions", { variant: "error" });
    } finally {
      setTxnLoading(false);
    }
  }, [enqueueSnackbar, page, rowsPerPage, typeFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTxns();
  }, [loadTxns]);

  const handleAdjust = useCallback(async () => {
    const amount = parseFloat(adjustForm.amount);
    if (!amount || amount <= 0) {
      enqueueSnackbar("Amount must be greater than 0", { variant: "warning" });
      return;
    }
    if (!adjustForm.narration.trim() || adjustForm.narration.trim().length < 3) {
      enqueueSnackbar("Please provide a reason (min 3 chars)", { variant: "warning" });
      return;
    }
    try {
      setAdjustSaving(true);
      await axiosInstance.post("/super-admin/company-wallet/adjust", {
        amount,
        direction: adjustForm.direction,
        narration: adjustForm.narration.trim(),
      });
      enqueueSnackbar("Adjustment saved", { variant: "success" });
      setOpenAdjust(false);
      setAdjustForm({ amount: "", direction: "CREDIT", narration: "" });
      await Promise.all([loadSummary(), loadTxns()]);
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to adjust wallet", { variant: "error" });
    } finally {
      setAdjustSaving(false);
    }
  }, [adjustForm, enqueueSnackbar, loadSummary, loadTxns]);

  const typeChipColor = useMemo(
    () => ({
      INCOME: "success",
      EXPENSE: "error",
      COMMISSION: "warning",
    }) as const,
    [],
  );

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Company Escrow Wallet"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Wallet", href: paths.dashboard.wallet.root },
          { name: "Company Escrow" },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={() => {
                loadSummary();
                loadTxns();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setOpenAdjust(true)}
            >
              Adjust
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Balance hero */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)}, ${alpha(
              t.palette.primary.main,
              0.04,
            )})`,
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
          boxShadow: "none",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                color: "primary.main",
              }}
            >
              <Iconify icon="solar:wallet-money-bold-duotone" width={32} />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Escrow Balance
              </Typography>
              {summaryLoading ? (
                <CircularProgress size={22} sx={{ mt: 0.5 }} />
              ) : (
                <Typography variant="h3">{formatGBP(summary?.balance ?? 0)}</Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Funds held between rider payment and driver payout
              </Typography>
            </Box>
          </Stack>
          {summary?.updatedAt && (
            <Typography variant="caption" color="text.secondary">
              Last updated {new Date(summary.updatedAt).toLocaleString()}
            </Typography>
          )}
        </Stack>
      </Card>

      {/* Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatCard
          title="Total Inflow (rider payments)"
          value={formatGBP(summary?.totalInflow ?? 0)}
          icon="solar:arrow-down-bold"
          color="#22c55e"
        />
        <StatCard
          title="Total Outflow (payouts & refunds)"
          value={formatGBP(summary?.totalOutflow ?? 0)}
          icon="solar:arrow-up-bold"
          color="#ef4444"
        />
        <StatCard
          title="Commission Earned"
          value={formatGBP(summary?.totalCommission ?? 0)}
          icon="solar:graph-up-bold"
          color="#f59e0b"
        />
        <StatCard
          title="Transactions"
          value={String(summary?.transactionCount ?? 0)}
          icon="solar:document-text-bold"
          color="#3b82f6"
        />
      </Stack>

      {/* Transactions */}
      <Card>
        <Tabs
          value={typeFilter}
          onChange={(_, v) => {
            setPage(0);
            setTypeFilter(v);
          }}
          sx={{
            px: 2.5,
            boxShadow: (t) => `inset 0 -2px 0 0 ${alpha(t.palette.grey[500], 0.08)}`,
          }}
        >
          {TYPE_TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>

        <TableContainer sx={{ position: "relative" }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Counterparty</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Narration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txnLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : txns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No transactions
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                txns.map((tx) => {
                  const name = tx.userInfo
                    ? `${tx.userInfo.firstName || ""} ${tx.userInfo.lastName || ""}`.trim() ||
                      tx.userInfo.emailAddress ||
                      "—"
                    : "—";
                  return (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{name}</Typography>
                        {tx.userInfo?.emailAddress && (
                          <Typography variant="caption" color="text.secondary">
                            {tx.userInfo.emailAddress}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          color={typeChipColor[tx.type] || "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          color={tx.type === "EXPENSE" ? "error.main" : "success.main"}
                        >
                          {tx.type === "EXPENSE" ? "−" : "+"}
                          {formatGBP(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 420 }}>
                          {tx.narration || "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        <TablePagination
          component="div"
          count={txnTotal}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Adjust dialog */}
      <Dialog open={openAdjust} onClose={() => setOpenAdjust(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Escrow Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Use this for manual reconciliation. Every adjustment is logged with your admin
              identity in the escrow ledger.
            </Typography>
            <TextField
              select
              label="Direction"
              value={adjustForm.direction}
              onChange={(e) =>
                setAdjustForm((f) => ({ ...f, direction: e.target.value as Direction }))
              }
              fullWidth
            >
              <MenuItem value="CREDIT">Credit (add funds)</MenuItem>
              <MenuItem value="DEBIT">Debit (remove funds)</MenuItem>
            </TextField>
            <TextField
              label="Amount (GBP)"
              type="number"
              value={adjustForm.amount}
              onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))}
              fullWidth
              inputProps={{ step: "0.01", min: "0.01" }}
            />
            <TextField
              label="Reason / narration"
              value={adjustForm.narration}
              onChange={(e) => setAdjustForm((f) => ({ ...f, narration: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpenAdjust(false)} disabled={adjustSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdjust}
            disabled={adjustSaving}
            startIcon={adjustSaving ? <CircularProgress size={16} /> : undefined}
          >
            Save Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
