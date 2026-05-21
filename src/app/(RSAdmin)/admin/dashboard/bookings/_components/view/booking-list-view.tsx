"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback } from "react";
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
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
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
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { useSnackbar } from "notistack";
import BookingsTableToolbar from "../bookings-table-toolbar";
import BookingsTableFiltersResult from "../bookings-table-filters-result";
import BookingsTableRow from "../bookings-table-row";
import { Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { allowGenerateInvoice } from "@/server/Passenger";
import { useAdminBookingsQuery } from "@/hooks/Bookings";
import { IBookingType } from "@/types/type";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "bookingDate", label: "Date" },
  { id: "name", label: "Booker Name" },
  { id: "driverInfo", label: "Driver Name" },
  { id: "startAddress", label: "Start From", width: 200 },
  { id: "destination", label: "Destination", width: 200 },
  { id: "totalBill", label: "Total Bill", width: 140 },
  { id: "waitingFee", label: "Waiting", width: 110 },
  { id: "tipAmount", label: "Tip", width: 90 },
  { id: "finalBill", label: "Final Bill", width: 130 },
  { id: "cashCollected", label: "Cash", width: 110 },
  { id: "totalDistance", label: "Total Distance", width: 160 },
  { id: "phone_number", label: "Phone Number", width: 180 },
  { id: "status", label: "Status", width: 140 },
  { id: "", label: "Action", width: 88 },
];

const defaultFilters = {
  search: "",
  status: "all",
};

const BOOKING_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "WAY_TO_PICKUP", label: "Way to Pickup" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "WAY_TO_DESTINATION", label: "Way to Destination" },
  { value: "COMPLETED", label: "Completed" },
];

// ----------------------------------------------------------------------

export default function BookingListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const { data: tableData = [], isPending, refetch } = useAdminBookingsQuery();
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered: IBookingType[] = applyFilter({
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

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.bookings.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {},
    [dataInPage.length, table, tableData]
  );

  interface StatusTabChangeEvent extends React.SyntheticEvent<Element, Event> {}

  const handleFilterStatus = useCallback(
    (event: StatusTabChangeEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      (row) => !table.selected.includes(row.id)
    );
    refetch();

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

  interface AllowGenerateInvoiceResponse {
    statusCode: number;
    message: string;
    [key: string]: any;
  }

  const handleAllowGenerateInvoice = useCallback(
    async (id: string, status: boolean): Promise<void> => {
      setLoading(true);
      try {
        const response: AllowGenerateInvoiceResponse =
          await allowGenerateInvoice(id, status);
        if (response.statusCode == 200) {
          enqueueSnackbar("Status updated successfully");
          setChangeFlag(!changeFlag);
        } else {
          enqueueSnackbar(response.message, { variant: "error" });
        }
      } catch (err) {
        console.log("Error in giving permission to user :", err);
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, changeFlag]
  );

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Bookings List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Bookings", href: paths.dashboard.bookings.root },
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
                {BOOKING_STATUS_OPTIONS.map((tab) => (
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
                          (tab.value === "COMPLETED" && "success") ||
                          (tab.value === "ACCEPTED" && "success") ||
                          (tab.value === "PENDING" && "warning") ||
                          (tab.value === "CANCELLED" && "error") ||
                          (tab.value === "REJECTED" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === "all" && tableData?.length}
                        {tab.value === "COMPLETED" &&
                          tableData?.filter(
                            (booking) => booking.status === "COMPLETED"
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
                        {tab.value === "WAY_TO_PICKUP" &&
                          tableData?.filter(
                            (booking) => booking.status === "WAY_TO_PICKUP"
                          ).length}
                        {tab.value === "ARRIVED" &&
                          tableData?.filter(
                            (booking) => booking.status === "ARRIVED"
                          ).length}
                        {tab.value === "PICKED_UP" &&
                          tableData?.filter(
                            (booking) => booking.status === "PICKED_UP"
                          ).length}
                        {tab.value === "WAY_TO_DESTINATION" &&
                          tableData?.filter(
                            (booking) => booking.status === "WAY_TO_DESTINATION"
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
                  //
                  onResetFilters={handleResetFilters}
                  //
                  results={dataFiltered.length}
                  sx={{ p: 2.5, pt: 0 }}
                />
              )}

              <TableContainer sx={{ position: "relative", overflow: "auto" }}>
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
                Are you sure you want to delete
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

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IBookingType[];
  comparator: (a: IBookingType, b: IBookingType) => number;
  filters: {
    search: string;
    status: string;
  };
}) {
  const { search, status } = filters;
  // Ensure it's always an array
  const safeData = Array.isArray(inputData) ? inputData : [];

  const stabilizedThis = safeData.map(
    (el, index) => [el, index] as [IBookingType, number]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (search) {
    filteredData = filteredData?.filter((booking) => {
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
    if (status == "all") {
      inputData = inputData;
    } else {
      inputData = inputData.filter((booking) =>
        status.includes(booking.status)
      );
    }
  }

  return inputData;
}
