"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useEffect, SyntheticEvent } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
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
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import BookingsTableToolbar from "../bookings-table-toolbar";
import BookingsTableFiltersResult from "../bookings-table-filters-result";
import BookingsTableRow from "../bookings-table-row";
import axiosInstance from "@/lib/admin-axios";
import { Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { allowGenerateInvoice } from "@/server/Passenger";
import { BookingStatus } from "@/types/prisma-types";

const TABLE_HEAD = [
  { id: "bookingDate", label: "Date" },
  { id: "bookingTime", label: "Time" },
  { id: "name", label: "Client Name" },
  { id: "driverInfo", label: "Driver Name" },
  { id: "startAddress", label: "Start From" },
  { id: "destination", label: "Destination" },
  { id: "totalBill", label: "Total Bill" },
  { id: "totalDistance", label: "Total Distance" },
  { id: "phone_number", label: "Contact Number" },
  { id: "", label: "", width: 88 },
];

type BookingRow = {
  id: string;
  status: string;
  riderInfo?: {
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: string | null;
    phone_number?: string | null;
  } | null;
  driverInfo?: {
    userInfo?: {
      firstName?: string | null;
      lastName?: string | null;
      emailAddress?: string | null;
      phone_number?: string | null;
    } | null;
  } | null;
  requestInfo?: {
    destination?: { name?: string | null; city?: string | null } | null;
    startFrom?: { name?: string | null; city?: string | null } | null;
  } | null;
  [key: string]: any;
};

type Filters = {
  search: string;
  status: BookingStatus | "ALL";
};

const defaultFilters: Filters = {
  search: "",
  status: "ALL",
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];

export default function InvoiceListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState<BookingRow[]>([]);
  const [changeFlag, setChangeFlag] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy) as (
      a: BookingRow,
      b: BookingRow
    ) => number,
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
    (name: keyof Filters, value: string) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value as any }));
    },
    [table]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.bookings.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (_id: string) => {},
    [dataInPage.length, table, tableData]
  );

  const handleFilterStatus = useCallback(
    (_event: SyntheticEvent, newValue: BookingStatus) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      (row) => !table.selected.includes(row.id)
    );
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.bookings.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const fetch = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, status }: { data: { data?: BookingRow[] } | BookingRow[]; status: number } =
        await axiosInstance.get(`/admin/bookings`);
      if (status === 200) {
        const rows = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];
        setTableData(rows);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAllowGenerateInvoice = useCallback(
    async (id: string, status: boolean) => {
      setLoading(true);
      try {
        const response = await allowGenerateInvoice(id, status);
        if (response.statusCode === 200) {
          enqueueSnackbar("update status successfully");
          setChangeFlag((prev) => !prev);
        } else {
          enqueueSnackbar(response.message, { variant: "error" });
        }
      } catch (err) {
        console.log("Error in giving permsiion to user :", err);
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    fetch();
  }, [changeFlag]);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Invoices List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "invoices", href: paths.dashboard.invoices.root },
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
                {STATUS_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                    icon={
                      <Label
                        variant={
                          ((tab.value === "ALL" ||
                            tab.value === filters.status) &&
                            "filled") ||
                          "soft"
                        }
                        color={
                          (tab.value === "COMPLETED" && "success") ||
                          (tab.value === "ACCEPTED" && "success") ||
                          (tab.value === "PENDING" && "warning") ||
                          (tab.value === "CANCELLED" && "error") ||
                          (tab.value === "REJECTED" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === "ALL" && tableData?.length}
                        {tab.value === "COMPLETED" &&
                          tableData?.filter(
                            (booking) => booking.status === "COMPLETED"
                          ).length}

                        {tab.value === "PENDING" &&
                          tableData?.filter(
                            (booking) => booking.status === "PENDING"
                          ).length}
                        {tab.value === "ACCEPTED" &&
                          tableData?.filter(
                            (booking) => booking.status === "ACCEPTED"
                          ).length}
                        {tab.value === "CANCELLED" &&
                          tableData?.filter(
                            (booking) => booking.status === "CANCELLED"
                          ).length}
                        {tab.value === "REJECTED" &&
                          tableData?.filter(
                            (booking) => booking.status === "REJECTED"
                          ).length}
                      </Label>
                    }
                  />
                ))}
              </Tabs>
              <BookingsTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <BookingsTableFiltersResult
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
                          <BookingsTableRow
                            key={row.id}
                            row={row}
                            deleteConfirm={confirm}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
                            onAllowGenerateInvoice={() =>
                              handleAllowGenerateInvoice(row.id, true)
                            }
                            onDisAllowGenerateInvoice={() =>
                              handleAllowGenerateInvoice(row.id, false)
                            }
                            setChangeFlag={setChangeFlag}
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
                //
                dense={table.dense}
                onChangeDense={table.onChangeDense}
              />
            </Card>
          </Container>

          <ConfirmDialog
            open={confirm.value}
            onClose={confirm.onFalse}
            title="Delete"
            content={
              <>
                Are you sure want to delete
                <strong> {table.selected.length} </strong> items?
              </>
            }
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDeleteRows();
                  confirm.onFalse();
                }}
              >
                Delete
              </Button>
            }
          />
        </>
      )}
    </>
  );
}

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: BookingRow[];
  comparator: (a: BookingRow, b: BookingRow) => number;
  filters: Filters;
}) {
  const { search, status } = filters;

  const stabilizedThis: [BookingRow, number][] = inputData.map(
    (el, index): [BookingRow, number] => [el, index]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (search) {
    inputData = inputData?.filter((booking) => {
      return (
        booking?.riderInfo?.firstName
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.riderInfo?.lastName
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.riderInfo?.emailAddress
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.riderInfo?.phone_number
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.requestInfo?.destination?.name
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.requestInfo?.startFrom?.name
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.requestInfo?.startFrom?.city
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.requestInfo?.destination?.city
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.driverInfo?.userInfo?.firstName
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.driverInfo?.userInfo?.lastName
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.driverInfo?.userInfo?.emailAddress
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1 ||
        booking?.driverInfo?.userInfo?.phone_number
          ?.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1
      );
    });
  }

  if (status) {
    if (status === "ALL") {
      inputData = inputData;
    } else {
      inputData = inputData.filter((booking) => booking.status === status);
    }
  }

  return inputData;
}
