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
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
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
import DriverSummaryTableToolbar from "../work-summary-table-toolbar";
import DriverSummaryTableFiltersResult from "../work-summary-table-filters-result";
import DriverSummaryTableRow from "../work-summary-table-row";
import { getDriverStats } from "@/server/Driver";
import {
  getBookingsByDriverId,
  getCompleteBookingCountsForTodayThisMonthThisYear,
  getCompleteBookingCountsForTodayThisMonthThisYearForDriver,
} from "@/server/Bookings";
import { Grid, Typography } from "@mui/material";
import AppWidgetSummary from "../work-summary-widget";
import BookingsTableRow from "../driver-work-summary-row";
import { allowGenerateInvoice } from "@/server/Passenger";
import { useRouter } from "next/navigation";
import { maxWidth } from "@mui/system";

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: "bookingDate", label: "Date" },
  { id: "bookingTime", label: "Booking Time" },
  { id: "packageId", label: "Package info" },
  { id: "startAddress", label: "Start From" },
  { id: "destination", label: "Destination" },
  { id: "totalDistance", label: "Total Distance" },
  { id: "totalWaitingTime", label: "Total Waiting Time" },

  { id: "notes", label: "Notes" },
  { id: "name", label: "Client Name" },
  { id: "phone_number", label: "Phone Number" },
  { id: "passengerRating", label: "Passenger Rating" },
  { id: "passengerReview", label: "Passenger Review" },

  { id: "totalBill", label: "Total Bill" },
  { id: "cashCollected", label: "Cash Collected" },
  { id: "cardCollected", label: "Card Collected" },
  { id: "bankTransferCollected", label: "Bank Transfer Collected" },
  { id: "walletCollected", label: "Wallet Collected" },
  { id: "discountAmount", label: "Discount Amount" },
  { id: "couponCode", label: "Coupon Code" },

  { id: "commission", label: "Commission" },

  { id: "paymentType", label: "Payment Type" },
  { id: "driverRating", label: "Driver Rating" },
  { id: "driverReview", label: "Driver Review" },
  // { id: "", width: 88 },
];

const defaultFilters = {
  search: "",
  role: [],
};

// ----------------------------------------------------------------------

export default function DriverSummaryListView({ driverId }) {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [yearCount, setYearCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const router = useRouter();

  const dataFiltered = applyFilter({
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

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getBookingsByDriverId(driverId, null, null, null);
      console.log("Booking Data:", data);
      setTableData(data);
      const { today, week, month, year } =
        await getCompleteBookingCountsForTodayThisMonthThisYearForDriver(
          driverId
        );
      setTodayCount(today);
      setMonthCount(month);
      setYearCount(year);
      setWeekCount(week);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [changeFlag]);

  const onFilterByDate = async () => {
    setLoading(true);
    try {
      const { data } = await getBookingsByDriverId(
        driverId,
        startDate,
        endDate,
        null
      );
      setTableData(data);
    } catch (err) {
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const onFilterByMaster = async (filter) => {
    setLoading(true);
    try {
      const { data } = await getBookingsByDriverId(
        driverId,
        null,
        null,
        filter
      );
      setTableData(data);
    } catch (err) {
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bookings.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id) => {},
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bookings.edit(id));
    },
    [router]
  );

  const handleAllowGenerateInvoice = useCallback(async (id, status) => {
    setLoading(true);
    try {
      const response = await allowGenerateInvoice(id, status);
      if (response.statusCode == 200) {
        enqueueSnackbar("update status successfully");
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

  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Grid container my={1}>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            sx={{ maxWidth: "99%", marginBottom: 1 }}
            onClick={() => onFilterByMaster("today")}
            title={"Today"}
            total={todayCount}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            sx={{ maxWidth: "99%", marginBottom: 1 }}
            onClick={() => onFilterByMaster("weekly")}
            title={"Week"}
            total={weekCount}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            sx={{ maxWidth: "99%", marginBottom: 1 }}
            onClick={() => onFilterByMaster("monthly")}
            title={"Month"}
            total={monthCount}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            sx={{ maxWidth: "99%", marginBottom: 1 }}
            onClick={() => onFilterByMaster("yearly")}
            title={"Tax Year"}
            total={yearCount}
          />
        </Grid>
      </Grid>
      <Card>
        <DriverSummaryTableToolbar
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          loading={loading}
          onSave={onFilterByDate}
        />

        {canReset && (
          <DriverSummaryTableFiltersResult
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
                      setChangeFlag={setChangeFlag}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onAllowGenerateInvoice={() =>
                        handleAllowGenerateInvoice(row.id, true)
                      }
                      onDisAllowGenerateInvoice={() =>
                        handleAllowGenerateInvoice(row.id, false)
                      }
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
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  return inputData;
}
