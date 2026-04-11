"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
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
import TransactionTableRow from "../admin-transactions-table-row";
import TransactionsTableFiltersResult from "../transactions-filters-result";
import { useAdminTransactionsQuery } from "@/hooks/Transaction";
import { IAdminTransaction } from "@/types/type";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { Tabs, Tab, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name" },
  { id: "type", label: "Type", width: 150 },
  { id: "amount", label: "Amount", width: 120 },
  { id: "narration", label: "Narration" },
];

const ADMIN_TRANSACTION_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "INCOME", label: "Payment In" },
  { value: "EXPENSE", label: "Payment Out" },
  { value: "COMMISSION", label: "Commission" },
];

const defaultFilters = {
  search: "",
  type: "all",
};

// ----------------------------------------------------------------------

export default function AdminTransactionsListView() {
  const table = useTable();

  const confirm = useBoolean();
  const {
    data: tableData = [],
    isPending,
    refetch,
  } = useAdminTransactionsQuery();
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered: IAdminTransaction[] = applyFilter({
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
    (name: string, value: string | string[]) => {
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
    (event: any, newValue: string | string[]) => {
      handleFilters("type", newValue);
    },
    [handleFilters]
  );

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Admin Transactions List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                {
                  name: "Admin Transactions",
                  href: paths.dashboard.wallet.adminTransaction.list,
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
                  px: 2.5,
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                {ADMIN_TRANSACTION_STATUS_OPTIONS.map((tab) => (
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
                          (tab.value === "COMMISSION" && "success") ||
                          (tab.value === "INCOME" && "warning") ||
                          (tab.value === "EXPENSE" && "error") ||
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
    </>
  );
}

// ----------------------------------------------------------------------
type Filters = {
  search?: string;
  type?: string;
};

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IAdminTransaction[];
  comparator: (a: IAdminTransaction, b: IAdminTransaction) => number;
  filters: Filters;
}) {
  const { search = "", type } = filters;

  const stabilizedThis = inputData
    .map((el, index) => [el, index] as [IAdminTransaction, number])
    .sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order !== 0 ? order : a[1] - b[1];
    })
    .map((el) => el[0]);

  let filtered = [...stabilizedThis];

  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter((data) => {
      const fieldsToSearch = [
        data?.userInfo?.firstName,
        data?.userInfo?.lastName,
        data?.userInfo?.emailAddress,
        data?.userInfo?.phone_number,
        data?.type,
        data?.narration,
        data?.amount != null ? String(data.amount) : null, // convert to string
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
