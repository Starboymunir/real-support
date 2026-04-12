"use client";

import { useState, useCallback, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import { alpha, Tab, Tabs } from "@mui/material";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import Label from "@/app/(RSAdmin)/admin/common/label";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import BankAccountsTableRow from "../bank-accounts-table-row";
import axiosInstance from "@/lib/admin-axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "user", label: "User" },
  { id: "bankName", label: "Bank Name" },
  { id: "accountName", label: "Account Name" },
  { id: "accountNumber", label: "Account No." },
  { id: "sortCode", label: "Sort Code" },
  { id: "isDefault", label: "Default" },
  { id: "status", label: "Status" },
  { id: "createdAt", label: "Created" },
  { id: "", label: "" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

// ----------------------------------------------------------------------

export default function BankAccountsListView() {
  const table = useTable({ defaultOrderBy: "createdAt" });
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const { data: allAccounts = [], isPending } = useQuery<any[]>({
    queryKey: ["admin-bank-accounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/accounts");
      return res.data?.data || [];
    },
  });

  const dataFiltered =
    statusFilter === "all"
      ? allAccounts
      : allAccounts.filter((a: any) => a.status === statusFilter);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;
  const notFound = !dataFiltered.length;

  const handleChangeStatus = useCallback(
    async (id: string, status: "ACTIVE" | "REJECTED") => {
      try {
        await axiosInstance.patch(`/accounts/${id}`, { status });
        enqueueSnackbar(
          status === "ACTIVE"
            ? "Bank account approved"
            : "Bank account rejected"
        );
        queryClient.invalidateQueries({ queryKey: ["admin-bank-accounts"] });
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to update status", {
          variant: "error",
        });
      }
    },
    [enqueueSnackbar, queryClient]
  );

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth="xl">
          <CustomBreadcrumbs
            heading="Bank Accounts"
            links={[
              { name: "Dashboard", href: paths.dashboard.root },
              { name: "Wallet", href: paths.dashboard.wallet.root },
              { name: "Bank Accounts" },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <Tabs
              value={statusFilter}
              onChange={(_, val) => {
                setStatusFilter(val);
                table.onResetPage();
              }}
              sx={{
                px: 2.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  iconPosition="end"
                  icon={
                    <Label
                      variant={
                        (tab.value === "all" || tab.value === statusFilter)
                          ? "filled"
                          : "soft"
                      }
                      color={
                        (tab.value === "ACTIVE" && "success") ||
                        (tab.value === "PENDING" && "warning") ||
                        (tab.value === "REJECTED" && "error") ||
                        "default"
                      }
                    >
                      {tab.value === "all"
                        ? allAccounts.length
                        : allAccounts.filter((a: any) => a.status === tab.value)
                            .length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <TableContainer sx={{ position: "relative", overflow: "unset" }}>
              <Scrollbar>
                <Table
                  size={table.dense ? "small" : "medium"}
                  sx={{ minWidth: 1100 }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={0}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataInPage.map((row: any) => (
                      <BankAccountsTableRow
                        key={row.id}
                        row={row}
                        onApprove={() =>
                          handleChangeStatus(row.id, "ACTIVE")
                        }
                        onReject={() =>
                          handleChangeStatus(row.id, "REJECTED")
                        }
                      />
                    ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(
                        table.page,
                        table.rowsPerPage,
                        dataFiltered.length
                      )}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}
    </>
  );
}
