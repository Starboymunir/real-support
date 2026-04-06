"use client";

import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import WithDrawalTableToolbar from "../with-drawal-table-toolbar";
import WithDrawalTableFiltersResult from "../with-drawal-table-filters-result";
import WithDrawalTableRow from "../with-drawal-table-row";
import {
  getAllWithdrawalRequests,
  processWithdrawalRequest,
  rejectWithdrawalRequest,
} from "@/server/Wallet";
import { alpha, Tab, Tabs } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/providers/SocketProvider";
import { useWithdrawalRequestsQuery } from "@/hooks/Transaction";
import { IWithdrawals } from "@/types/type";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "userId", label: "User Info" },
  { id: "totalTopUp", label: "Total Deposited" },
  { id: "totalWithdraw", label: "Total Withdrawn" },
  { id: "currentBalance", label: "Current Balance" },
  { id: "amount", label: "Request Amount" },
  { id: "createdAt", label: "Requested At" },
  { id: "updatedAt", label: "Updated At" },
  { id: "proceededBy", label: "Processed By" },
  { id: "status", label: "Status" },
  { id: "", label: "Action" },
];

const WITHDRAW_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PROCESSED", label: "Processed" },
];

const defaultFilters = {
  search: "",
  status: "PENDING",
};

// ----------------------------------------------------------------------

export default function WithDrawalListView() {
  const { socket } = useSocket();
  const table = useTable();

  const settings = useSettingsContext();
  const { admin } = useAuth();

  const router = useRouter();

  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: tableData = [],
    isPending,
    refetch,
  } = useWithdrawalRequestsQuery();
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered: IWithdrawals[] = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: string) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleRejcetRequest = useCallback(
    async (row: IWithdrawals) => {
      const { id } = row;
      setLoading(true);
      try {
        const { statusCode, message } = await rejectWithdrawalRequest(
          id,
          admin?.id ?? ""
        );
        if (statusCode == 200) {
          enqueueSnackbar(message);
          setChangeFlag((prev) => !prev);
          refetch();
          socket?.emit("admin-process-withdrawal-request", row);
        } else {
          enqueueSnackbar(message, { variant: "error" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData, refetch]
  );

  const handleProcessRequest = useCallback(
    async (row: IWithdrawals) => {
      const { id } = row;
      setLoading(true);
      try {
        const { statusCode, message } = await processWithdrawalRequest(
          id,
          admin?.id ?? ""
        );
        if (statusCode == 200) {
          enqueueSnackbar(message);
          setChangeFlag((prev) => !prev);
          refetch();
          socket?.emit("admin-process-withdrawal-request", row);
        } else {
          enqueueSnackbar(message, { variant: "error" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData, refetch]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    if (socket) {
      const getData = () => {
        refetch();
      };

      socket.on("withdrawal-request-sent", getData);

      return () => {
        socket.off("withdrawal-request-sent", getData);
      };
    }
  }, [socket]);

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Withdrawal Requests"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                {
                  name: "Withdrawal Requests",
                  href: paths.dashboard.wallet.withDrawalRequests.root,
                },
                { name: "List" },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card>
              <Tabs
                value={filters.status}
                onChange={handleFilterStatus}
                sx={{
                  px: 2.5,
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                {WITHDRAW_STATUS_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                    icon={
                      <Label
                        variant={
                          ((tab.value === "all" ||
                            tab.value === filters.status) &&
                            "filled") ||
                          "soft"
                        }
                        color={
                          (tab.value === "PROCESSED" && "success") ||
                          (tab.value === "PENDING" && "warning") ||
                          (tab.value === "REJECTED" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === "all" && tableData?.length}
                        {tab.value === "PENDING" &&
                          tableData?.filter(
                            (request) => request.status === "PENDING"
                          ).length}
                        {tab.value === "PROCESSED" &&
                          tableData?.filter(
                            (request) => request.status === "PROCESSED"
                          ).length}
                        {tab.value === "REJECTED" &&
                          tableData?.filter(
                            (request) => request.status === "REJECTED"
                          ).length}
                      </Label>
                    }
                  />
                ))}
              </Tabs>
              <WithDrawalTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <WithDrawalTableFiltersResult
                  filters={filters}
                  onFilters={handleFilters}
                  onResetFilters={handleResetFilters}
                  results={dataFiltered.length}
                  sx={{ p: 2.5, pt: 0 }}
                />
              )}

              <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={tableData.length}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  action={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  }
                />

                <Scrollbar>
                  <Table
                    size={table.dense ? "small" : "medium"}
                    sx={{ minWidth: 960 }}
                  >
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={tableData.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          tableData.map((row) => row.id)
                        )
                      }
                    />

                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <WithDrawalTableRow
                            key={row.id}
                            row={row}
                            onAcceptRequest={() => handleProcessRequest(row)}
                            onRejectRequest={() => handleRejcetRequest(row)}
                          />
                        ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(
                          table.page,
                          table.rowsPerPage,
                          tableData.length
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
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IWithdrawals[];
  comparator: (a: IWithdrawals, b: IWithdrawals) => number;
  filters: {
    search: string;
    status: string;
  };
}) {
  const { search, status } = filters;

  const safeData = Array.isArray(inputData) ? inputData : [];

  const stabilizedThis = safeData.map(
    (el, index) => [el, index] as [IWithdrawals, number]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData?.filter((request) => {
      const user = request?.userInfo;
      return (
        user?.firstName.toLowerCase().includes(lowerSearch) ||
        user?.lastName.toLowerCase().includes(lowerSearch) ||
        user?.emailAddress.toLowerCase().includes(lowerSearch) ||
        String(user?.phone_number || "")
          .toLowerCase()
          .includes(lowerSearch)
      );
    });
  }

  if (status && status !== "all") {
    filteredData = filteredData?.filter((request) => request.status === status);
  }

  return filteredData;
}
