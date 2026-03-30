"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useMemo } from "react";
import { alpha } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import Label from "@/app/(RSAdmin)/admin/common/label";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
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
import DriversTableToolbar from "../drivers-table-toolbar";
import DriversTableFiltersResult from "../drivers-table-filters-result";
import DriversTableRow from "../drivers-table-row";
import { changeStatusDriver } from "@/server/Driver";
import { useDriversQuery } from "@/hooks/Drivers";
import { IDriver } from "@/types/type";

// ----------------------------------------------------------------------

const DRIVER_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "ONHOLD", label: "On hold" },
  { value: "SUSPEND", label: "Suspend" },
];

const TABLE_HEAD = [
  { id: "firstName", label: "Driver" },
  { id: "phone_number", label: "Contact", width: 200 },
  { id: "cars", label: "Vehicles", width: 100 },
  { id: "subscription", label: "Subscription", width: 130 },
  { id: "ratings", label: "Rating", width: 100 },
  { id: "status", label: "Status", width: 120 },
  { id: "", label: "", width: 72 },
];

const defaultFilters = {
  search: "",
  status: "all",
  role: [],
};

export default function DriversListView() {
  const table = useTable();

  const router = useRouter();

  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(defaultFilters);

  const { data: tableData = [], isPending, refetch } = useDriversQuery();

  const stats = useMemo(() => {
    const active = tableData.filter((d) => d.status === "ACTIVE").length;
    const pending = tableData.filter((d) => d.status === "PENDING").length;
    const onhold = tableData.filter((d) => d.status === "ONHOLD").length;
    const suspended = tableData.filter((d) => d.status === "SUSPEND").length;
    return { total: tableData.length, active, pending, onhold, suspended };
  }, [tableData]);

  const dataFiltered: IDriver[] = applyFilter({
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
    (
      name: string,
      value: string | number | boolean | (string | number | boolean)[]
    ) => {
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
      router.push(paths.dashboard.drivers.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await changeStatusDriver(id, "SUSPEND");
        if (response?.statusCode == 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("Driver suspend successfully");
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        refetch();
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      setLoading(true);
      router.push(paths.dashboard.drivers.edit(id));
      setLoading(false);
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleActiveDriver = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await changeStatusDriver(id, "ACTIVE");
        if (response?.statusCode == 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("Driver active successfully");
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        refetch();
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleHoldDriver = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await changeStatusDriver(id, "ONHOLD");
        if (response?.statusCode == 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("Driver hold successfully");
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        refetch();
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handlePendingDriver = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await changeStatusDriver(id, "PENDING");
        if (response?.statusCode == 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("Driver pending successfully");
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        refetch();
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Drivers"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Drivers", href: paths.dashboard.drivers.root },
                { name: "List" },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            {/* Stats Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                { label: "Total Drivers", value: stats.total, color: "primary", icon: "mdi:account-group" },
                { label: "Active", value: stats.active, color: "success", icon: "mdi:account-check" },
                { label: "Pending", value: stats.pending, color: "warning", icon: "mdi:account-clock" },
                { label: "On Hold", value: stats.onhold, color: "info", icon: "mdi:account-pause" },
                { label: "Suspended", value: stats.suspended, color: "error", icon: "mdi:account-off" },
              ].map((stat) => (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={stat.label}>
                  <Card
                    sx={{
                      p: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderLeft: 3,
                      borderColor: `${stat.color}.main`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: (theme) =>
                          alpha(
                            (theme.palette as any)[stat.color]?.main || theme.palette.primary.main,
                            0.12
                          ),
                        color: `${stat.color}.main`,
                      }}
                    >
                      <Iconify icon={stat.icon} width={24} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ lineHeight: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", mt: 0.25, display: "block" }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

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
                {DRIVER_STATUS_OPTIONS.map((tab) => (
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
                          (tab.value === "ACTIVE" && "success") ||
                          (tab.value === "PENDING" && "warning") ||
                          (tab.value === "ONHOLD" && "default") ||
                          (tab.value === "SUSPEND" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === "all" && tableData?.length}
                        {tab.value === "ACTIVE" &&
                          tableData?.filter((user) => user.status === "ACTIVE")
                            .length}

                        {tab.value === "PENDING" &&
                          tableData?.filter((user) => user.status === "PENDING")
                            .length}
                        {tab.value === "ONHOLD" &&
                          tableData?.filter((user) => user.status === "ONHOLD")
                            .length}
                        {tab.value === "SUSPEND" &&
                          tableData?.filter((user) => user.status === "SUSPEND")
                            .length}
                      </Label>
                    }
                  />
                ))}
              </Tabs>

              <DriversTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <DriversTableFiltersResult
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
                          <DriversTableRow
                            key={row.id}
                            row={row}
                            deleteConfirm={confirm}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            onActiveDriver={() => handleActiveDriver(row.id)}
                            onHoldDriver={() => handleHoldDriver(row.id)}
                            onPendingDriver={() => handlePendingDriver(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
                            refetch={refetch}
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
  inputData: IDriver[];
  comparator: (a: IDriver, b: IDriver) => number;
  filters: {
    search: string;
    status: string;
  };
}) {
  const { search, status } = filters;

  const stabilizedThis = inputData.map(
    (el: IDriver, index: number) => [el, index] as [IDriver, number]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return (a[1]) - (b[1]);
  });

  let filteredData: IDriver[] = stabilizedThis.map<IDriver>((el) => el[0]);

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData?.filter((driver) => {
      const user = driver?.userInfo;
      return (
        user?.firstName?.toLowerCase().includes(lowerSearch) ||
        user?.lastName?.toLowerCase().includes(lowerSearch) ||
        user?.emailAddress?.toLowerCase().includes(lowerSearch) ||
        String(user?.phone_number || "")
          .toLowerCase()
          .includes(lowerSearch)
      );
    });
  }

  // Apply status filter
  if (status && status !== "all") {
    filteredData = filteredData.filter((driver) => driver.status === status);
  }

  return filteredData;
}
