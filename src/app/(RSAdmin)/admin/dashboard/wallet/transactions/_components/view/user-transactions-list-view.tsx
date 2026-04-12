"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import TransactionsTableToolbar from "../transactions-table-toolbar";
import TransactionsTableFiltersResult from "../transactions-filters-result";
import TransactionTableRow from "../transactions-table-row";
import { Tab, Tabs, Typography, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { useUserTransactionsQuery } from "@/hooks/Transaction";
import { ITransaction } from "@/types/type";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "type", label: "Transaction Type" },
  { id: "amount", label: "Amount", width: 150 },
  { id: "senderInfo", label: "Sender Info", width: 120 },
  { id: "stripeId", label: "Stripe Id", width: 150 },
  { id: "receiverInfo", label: "Receiver Info", width: 150 },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "TOPUP", label: "Top Up" },
  { value: "EXPENSE", label: "Booking Expense" },
  { value: "WITHDRAW", label: "Withdraw" },
  { value: "P2P_WALLET", label: "P2P Wallet" },
  { value: "COMMISSION", label: "Commission" },
  { value: "REQUEST", label: "Payment Request" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "REFUND", label: "Refund Booking" },
  { value: "BOOKING_INCOME", label: "Booking Income" },
  { value: "CANCELLATION_FEE", label: "Cancellation Fee" },
  { value: "ADMIN_COMMISSION", label: "Commission" },
  { value: "ADMIN_CHARGE", label: "Other Charges" },
  { value: "ADMIN_FUND", label: "Admin Fund" },
];

const defaultFilters = {
  search: "",
  type: "all",
};

// ----------------------------------------------------------------------

export default function UserTransactionsListView({
  userId,
}: {
  userId: string;
}) {
  const table = useTable();

  const confirm = useBoolean();
  // const { enqueueSnackbar } = useSnackbar();

  const { data: tableData = [], isPending: loading } =
    useUserTransactionsQuery(userId);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterType = useCallback(
    (event: any, newValue: string) => {
      handleFilters("type", newValue);
    },
    [handleFilters]
  );

  console.log("User Transactions+++++++++++", tableData);
  

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          <Typography
            variant="h4"
            className="flex justify-center items-center p-4"
          >
            Transactions History
          </Typography>

          <Card>
            <Tabs
              value={filters.type}
              onChange={handleFilterType}
              sx={{
                px: 2.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === "all" || tab.value === filters.type) &&
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
                      {tab.value !== "all" &&
                        tableData?.filter(
                          (transaction) => transaction.type === tab.value
                        ).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <TransactionsTableToolbar
              filters={filters}
              onFilters={handleFilters}
            />

            {canReset && (
              <TransactionsTableFiltersResult
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
                    .map((row: any) => (
                      <TransactionTableRow key={row.id} row={row} />
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
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
type Filters = {
  search?: string;
  type?: string | string[];
};

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: ITransaction[];
  comparator: (a: ITransaction, b: ITransaction) => number;
  filters: Filters;
}) {
  const { search = "", type } = filters;

  const stabilized = inputData
    .map((el, index) => [el, index] as [ITransaction, number])
    .sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order !== 0 ? order : a[1] - b[1];
    })
    .map((el) => el[0]);

  let filtered = [...stabilized];

  if (search) {
    const lowerSearch = search.toLowerCase();

    filtered = filtered.filter((transaction) => {
      const fieldsToSearch = [
        transaction?.receiverInfo?.firstName,
        transaction?.receiverInfo?.lastName,
        transaction?.receiverInfo?.emailAddress,
        transaction?.senderInfo?.firstName,
        transaction?.senderInfo?.lastName,
        transaction?.senderInfo?.emailAddress,
        transaction.stripeId,
      ];

      return fieldsToSearch.some((field) =>
        field?.toLowerCase().includes(lowerSearch)
      );
    });
  }

  // Apply type filter
  if (type && type !== "all") {
    const typeList = Array.isArray(type) ? type : [type];
    filtered = filtered.filter((data) => typeList.includes(data.type));
  }

  return filtered;
}
