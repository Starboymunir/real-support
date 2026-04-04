"use client";

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
import BookingsTableFiltersResult from "../../../bookings/_components/bookings-table-filters-result";
import BookingsTableRow from "../booking-request-table-row";
import { Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { IRequestType } from "@/types/type";
import { useAdminRequestsQuery } from "@/hooks/Requests";
import RequestsTableToolbar from "../table-toolbar";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "bookingDate", label: "Date" },
  { id: "passengerName", label: "Passenger Name" },
  { id: "packageName", label: "Package Details" },
  { id: "startAddress", label: "Start From", width: 200 },
  { id: "destinationAddress", label: "Destination", width: 200 },
  { id: "totalDistance", label: "Total Distance", width: 200 },
  { id: "totalDuration", label: "Total Duration", width: 200 },
  { id: "totalBill", label: "Total Bill", width: 200 },
  { id: "phone_number", label: "Phone Number", width: 180 },
  { id: "status", label: "Status", width: 120 },
  { id: "", width: 88 },
];

const defaultFilters = {
  search: "",
  status: "PENDING",
};

const BOOKING_REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ----------------------------------------------------------------------

export default function RequestsListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const { data: tableData = [], isPending, refetch } = useAdminRequestsQuery();
  const [changeFlag, setChangeFlag] = useState(true);

  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    refetch(); // This ensures fresh data every time the page mounts
  }, []);

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
    (name: string, value: string) => {
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
      router.push(paths.dashboard.requests.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {},
    [dataInPage.length, table, tableData]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.requests.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Bookings Requests List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Requests", href: paths.dashboard.requests.root },
                { name: "List" },
              ]}
              action={
                <Button
                  href={paths.dashboard.requests.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Create Request
                </Button>
              }
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
                {BOOKING_REQUEST_STATUS_OPTIONS.map((tab) => (
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
                          (tab.value === "ACCEPTED" && "success") ||
                          (tab.value === "PENDING" && "warning") ||
                          (tab.value === "CANCELLED" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === "all" && tableData?.length}
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
                      </Label>
                    }
                  />
                ))}
              </Tabs>
              <RequestsTableToolbar
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
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
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

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IRequestType[];
  comparator: (a: IRequestType, b: IRequestType) => number;
  filters: {
    search: string;
    status: string;
  };
}) {
  const { search, status } = filters;

  const stabilizedThis = inputData.map(
    (el, index) => [el, index] as [IRequestType, number]
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
      const rider = request?.riderInfo;
      return (
        rider?.firstName?.toLowerCase().includes(lowerSearch) ||
        rider?.lastName?.toLowerCase().includes(lowerSearch) ||
        rider?.emailAddress?.toLowerCase().includes(lowerSearch) ||
        String(rider?.phone_number || "")
          .toLowerCase()
          .includes(lowerSearch) ||
        request?.destination?.description
          ?.toLowerCase()
          .includes(lowerSearch) ||
        request?.startFrom?.description?.toLowerCase().includes(lowerSearch)
      );
    });
  }

  if (status && status !== "all") {
    filteredData = filteredData.filter((booking) => booking.status === status);
  }

  return filteredData;
}
