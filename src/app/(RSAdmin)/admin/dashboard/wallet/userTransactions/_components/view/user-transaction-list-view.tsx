"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
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
import TransactionsTableToolbar from "../../../transactions/_components/transactions-table-toolbar";
import TransactionsTableFiltersResult from "../../../transactions/_components/transactions-filters-result";
import TransactionTableRow from "../transaction-table-row";
import { Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useUsersTransactionsQuery } from "@/hooks/Transaction";
import { ITransaction } from "@/types/type";
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "userId", label: "User Info" },
  { id: "senderId", label: "Sender Info", width: 120 },
  { id: "receiverInfo", label: "Receiver Info", width: 150 },
  { id: "stripeId", label: "Stripe Id", width: 150 },
  { id: "type", label: "Transaction Type" },
  { id: "amount", label: "Amount", width: 150 },
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

export default function UserTransactionsListView() {
  const table = useTable();

  const confirm = useBoolean();
  const { data: tableData = [], isPending } = useUsersTransactionsQuery();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered: ITransaction[] = applyFilter({
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

  interface FilterState {
    search: string;
    type: string;
  }

  type HandleFilters = (name: string, value: string) => void;

  const handleFilters: HandleFilters = useCallback(
    (name, value) => {
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

  interface FilterTypeEvent extends React.SyntheticEvent<Element, Event> {}

  const handleFilterType = useCallback(
    (event: FilterTypeEvent, newValue: string) => {
      handleFilters("type", newValue);
    },
    [handleFilters]
  );

  return (
    <div className="mt-10">
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="User Transactions History"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                {
                  name: "User Transactions",
                  href: paths.dashboard.wallet.userTransaction.root,
                },
                { name: "List" },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card>
              <Tabs
                value={filters.type}
                onChange={handleFilterType}
                sx={{
                  px: 1.2,
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
                          ((tab.value === "all" ||
                            tab.value === filters.type) &&
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
                            (request) => request.type === tab.value
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
                      .map((row) => (
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
          </Container>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: ITransaction[];
  comparator: (a: ITransaction, b: ITransaction) => number;
  filters: { search: string; type: string };
}) {
  const { search, type } = filters;

  // Ensure it's always an array
  const safeData = Array.isArray(inputData) ? inputData : [];

  const stabilizedThis = safeData.map(
    (el, index) => [el, index] as [ITransaction, number]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (search) {
    filteredData = filteredData?.filter((data) => {
      return (
        data?.receiverInfo?.firstName
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.receiverInfo?.lastName
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.receiverInfo?.emailAddress
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.senderInfo?.firstName
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.senderInfo?.lastName
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.senderInfo?.emailAddress
          .toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        data?.stripeId?.toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    });
  }

  if (type) {
    if (type == "all") {
      inputData = inputData;
    } else {
      inputData = inputData.filter((data) => type.includes(data.type));
    }
  }

  return inputData;
}
