"use client";
import sumBy from "lodash/sumBy";
import isEqual from "lodash/isEqual";
import { useState, useCallback, useEffect } from "react";
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
import PasssengerBookingTableRow from "../passenger-booking-table-row";
import axios from "axios";
import { endpoints } from "@/lib/utils/axios";
import { Divider, Stack, Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { getBookingByPassenger } from "@/server/Bookings";
import RideAnalytic from "@/app/(RSAdmin)/admin/common/InvoiceAnalytics";
import { useTheme } from "@mui/material/styles";
import { allowGenerateInvoice } from "@/server/Passenger";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "bookingDate", label: "Date" },
  { id: "name", label: "Booker Name" },
  { id: "driverInfo", label: "Driver Name" },
  { id: "startAddress", label: "Start From", width: 200 },
  { id: "destination", label: "Destination", width: 200 },
  { id: "totalBill", label: "Total Bill", width: 200 },
  { id: "totalDistance", label: "Total Distance", width: 200 },
  { id: "phone_number", label: "Phone Number", width: 180 },
  {
    id: "isAllowGenerateInvoice",
    label: "Is Allow Generate Invoice",
    width: 180,
  },
  { id: "", width: 88 },
];

const defaultFilters = {
  search: "",
  status: "all",
};

const BOOKING_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];

// ----------------------------------------------------------------------

export default function PassengerBookingListView({ passengerId }) {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const { enqueueSnackbar } = useSnackbar();

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleAllowGenerateInvoice = useCallback(async (id, status) => {
    setLoading(true);
    try {
      const response = await allowGenerateInvoice(id, status);
      if (response.statusCode == 200) {
        enqueueSnackbar("Status updated successfully");
        setChangeFlag(!changeFlag);
      } else {
        enqueueSnackbar(response.message, { variant: "error" });
      }
    } catch (err) {
      console.log("Error in giving permsiion to user :", err);
    } finally {
      setLoading(false);
    }
  });

  const fetch = async () => {
    try {
      setLoading(true);
      const { data, statusCode } = await getBookingByPassenger(passengerId);
      if (statusCode === 200) {
        setTableData(data);
        console.log(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [changeFlag]);

  const getInvoiceLength = (status) =>
    tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      "totalBill"
    );

  const getPercentByStatus = (status) =>
    (getInvoiceLength(status) / tableData.length) * 100;

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth={settings.themeStretch ? false : "xl"}>
            <Card
              sx={{
                my: { xs: 3, md: 5 },
              }}
            >
              <Scrollbar>
                <Stack
                  direction="row"
                  divider={
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderStyle: "dashed" }}
                    />
                  }
                  sx={{ py: 2 }}
                >
                  <RideAnalytic
                    title="Total"
                    total={tableData.length}
                    percent={100}
                    price={sumBy(tableData, "totalBill")}
                    icon="solar:bill-list-bold-duotone"
                    color={theme.palette.info.main}
                  />

                  <RideAnalytic
                    title="Completed"
                    total={
                      tableData?.filter(
                        (booking) => booking.status === "COMPLETED"
                      ).length
                    }
                    percent={getPercentByStatus("COMPLETED")}
                    price={getTotalAmount("COMPLETED")}
                    icon="solar:file-check-bold-duotone"
                    color={theme.palette.success.main}
                  />

                  <RideAnalytic
                    title="Pending"
                    total={
                      tableData?.filter(
                        (booking) => booking.status === "PENDING"
                      ).length
                    }
                    percent={getPercentByStatus("PENDING")}
                    price={getTotalAmount("PENDING")}
                    icon="solar:sort-by-time-bold-duotone"
                    color={theme.palette.warning.main}
                  />

                  <RideAnalytic
                    title="Cancelled"
                    total={
                      tableData?.filter(
                        (booking) => booking.status === "CANCELLED"
                      ).length
                    }
                    percent={getPercentByStatus("CANCELLED")}
                    price={getTotalAmount("CANCELLED")}
                    icon="solar:file-corrupted-bold-duotone"
                    color={theme.palette.error.main}
                  />
                </Stack>
              </Scrollbar>
            </Card>
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
                          <PasssengerBookingTableRow
                            key={row.id}
                            row={row}
                            deleteConfirm={confirm}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
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
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { search, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

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
