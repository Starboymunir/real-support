"use client";

import { useMemo } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useAdminTransactionsQuery, useUsersTransactionsQuery, useWithdrawalRequestsQuery } from "@/hooks/Transaction";

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function statCard(
  title: string,
  value: string,
  icon: string,
  color: string,
  helper?: string,
) {
  return (
    <Card
      sx={{
        p: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: "none",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
      </Stack>
      <Typography variant="h5" sx={{ mb: 0.5 }}>{value}</Typography>
      {!!helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
    </Card>
  );
}

export default function PlatformWalletOverviewView() {
  const theme = useTheme();
  const { data: adminTransactions = [], isPending: adminPending } = useAdminTransactionsQuery();
  const { data: userTransactions = [], isPending: usersPending } = useUsersTransactionsQuery();
  const { data: withdrawalRequests = [], isPending: withdrawalPending } = useWithdrawalRequestsQuery();

  const isLoading = adminPending || usersPending || withdrawalPending;

  const metrics = useMemo(() => {
    const adminIncome = adminTransactions
      .filter((t: any) => t?.type === "INCOME" || t?.type === "COMMISSION")
      .reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0);

    const adminExpense = adminTransactions
      .filter((t: any) => t?.type === "EXPENSE")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const platformNet = adminIncome - adminExpense;

    const totalTopUps = userTransactions
      .filter((t: any) => t?.type === "TOPUP")
      .reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0);

    const totalWithdrawn = userTransactions
      .filter((t: any) => t?.type === "WITHDRAW")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t?.amount || 0)), 0);

    const totalCommissionFromUsers = userTransactions
      .filter((t: any) => t?.type === "COMMISSION" || t?.type === "ADMIN_COMMISSION")
      .reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0);

    const pendingWithdrawals = withdrawalRequests
      .filter((r: any) => r?.status === "PENDING")
      .reduce((sum: number, r: any) => sum + Number(r?.amount || 0), 0);

    const processedWithdrawals = withdrawalRequests
      .filter((r: any) => r?.status === "PROCESSED")
      .reduce((sum: number, r: any) => sum + Number(r?.amount || 0), 0);

    return {
      adminIncome,
      adminExpense,
      platformNet,
      totalTopUps,
      totalWithdrawn,
      totalCommissionFromUsers,
      pendingWithdrawals,
      processedWithdrawals,
      adminTxCount: adminTransactions.length,
      userTxCount: userTransactions.length,
    };
  }, [adminTransactions, userTransactions, withdrawalRequests]);

  if (isLoading) return <LoadingScreen />;

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Platform Wallet"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Wallet", href: paths.dashboard.wallet.root },
          { name: "Overview" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <Box>
          {statCard(
            "Platform Balance",
            formatGBP(metrics.platformNet),
            "solar:wallet-money-bold-duotone",
            theme.palette.primary.main,
            "Admin income minus admin expenses",
          )}
        </Box>
        <Box>
          {statCard(
            "Admin Income",
            formatGBP(metrics.adminIncome),
            "solar:arrow-down-bold-duotone",
            theme.palette.success.main,
            `${metrics.adminTxCount} admin transactions`,
          )}
        </Box>
        <Box>
          {statCard(
            "Admin Expenses",
            formatGBP(metrics.adminExpense),
            "solar:arrow-up-bold-duotone",
            theme.palette.error.main,
            "Outgoing payments from platform wallet",
          )}
        </Box>
        <Box>
          {statCard(
            "Commission Collected",
            formatGBP(metrics.totalCommissionFromUsers),
            "solar:chart-square-bold-duotone",
            theme.palette.warning.main,
            "From user transaction stream",
          )}
        </Box>

        <Box>
          {statCard(
            "User Top-Ups",
            formatGBP(metrics.totalTopUps),
            "solar:card-recive-bold-duotone",
            theme.palette.info.main,
            `${metrics.userTxCount} user transactions`,
          )}
        </Box>
        <Box>
          {statCard(
            "User Withdrawals",
            formatGBP(metrics.totalWithdrawn),
            "solar:card-send-bold-duotone",
            theme.palette.secondary.main,
            "Processed withdraw transactions",
          )}
        </Box>
        <Box>
          {statCard(
            "Pending Withdraw Requests",
            formatGBP(metrics.pendingWithdrawals),
            "solar:clock-circle-bold-duotone",
            theme.palette.warning.main,
            "Awaiting admin action",
          )}
        </Box>
        <Box>
          {statCard(
            "Processed Withdraw Requests",
            formatGBP(metrics.processedWithdrawals),
            "solar:check-circle-bold-duotone",
            theme.palette.success.main,
            "Already handled",
          )}
        </Box>
      </Box>
    </Container>
  );
}
