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
import { getCompleteBookingCountsForTodayThisMonthThisYear } from "@/server/Bookings";
import { Grid, Typography } from "@mui/material";
import AppWidgetSummary from "../work-summary-widget";
import { useRouter } from "next/navigation";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "driver.id", label: "Driver Name" },
  { id: "totalJobs", label: "Total Jobs", width: 120 },
  { id: "totalValue", label: "Total Value", width: 150 },
  { id: "cardPay", label: "Wallet/Card Pay", width: 180 },
  { id: "cashPay", label: "Cash Pay", width: 150 },
  { id: "tip", label: "Tip", width: 90 },
  { id: "commission", label: "Commision", width: 90 },
  { id: "totalAfterCommission", label: "Total After Commision", width: 90 },
  { id: "", width: 50 },
];

const defaultFilters = {
  search: "",
  role: [],
};

// ----------------------------------------------------------------------

export default function DriverSummaryListView() {
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
      const { data } = await getDriverStats(null, null);
      setTableData(data);
      const { today, month, year } =
        await getCompleteBookingCountsForTodayThisMonthThisYear();
      setTodayCount(today);
      setMonthCount(month);
      setYearCount(year);
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
      const { data } = await getDriverStats(startDate, endDate);
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
      const { data } = await getDriverStats(null, null, filter);
      setTableData(data);
    } catch (err) {
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Typography variant="h4" my={2}>
        Work Summary
      </Typography>
      <Grid container my={2} gap={1}>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            onClick={() => onFilterByMaster("today")}
            title={"Today"}
            total={todayCount}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            onClick={() => onFilterByMaster("monthly")}
            title={"Month"}
            total={monthCount}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            onClick={() => onFilterByMaster("yearly")}
            title={"Year"}
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
                    <DriverSummaryTableRow
                      key={row.id}
                      row={row}
                      deleteConfirm={confirm}
                      selected={table.selected.includes(row.driverId)}
                      onSelectRow={() => table.onSelectRow(row.driverId)}
                      setChangeFlag={setChangeFlag}
                      onViewRow={() =>
                        router.push(
                          paths.dashboard.workSummary.view(row.driverId)
                        )
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
  const { search } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (search) {
    inputData = inputData?.filter((packages) => {
      console.log(packages);
      return (
        packages.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        packages.description.toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    });
  }

  if (status) {
    inputData = inputData.filter((user) => status.includes(user.status));
  }

  return inputData;
}
