"use client";

import isEqual from "lodash/isEqual";
import { useCallback, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
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
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import PassengersTableToolbar from "../passengers-table-toolbar";
import PassengersTableFiltersResult from "../passengers-table-filters-result";
import PassengersTableRow from "../passengers-table-row";
import { changeStatus, promoteUserToAdmin } from "@/server/Passenger";
import { alpha, Tab } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import Tabs from "@mui/material/Tabs";
import { useUsersQuery } from "@/hooks/Users";
import { UserStatus } from "@/types/prisma-types";
import { IUser } from "@/types/type";

const PASSENGER_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "ONHOLD", label: "In Active" },
  { value: "SUSPEND", label: "Suspend" },
];

const TABLE_HEAD = [
  { id: "firstName", label: "Name" },
  { id: "phone_number", label: "Phone Number", width: 180 },
  { id: "emailAddress", label: "Email Address", width: 220 },
  { id: "totalBookings", label: "Bookings", width: 100 },
  { id: "status", label: "Status", width: 100 },
  { id: "", label: "Action", width: 88 },
];

const defaultFilters = {
  search: "",
  status: "",
  role: [],
};

interface UserStatuses extends Record<UserStatus, number> {
  ALL: number;
  PENDING: number;
}

export default function PassengersListView() {
  const table = useTable();

  const router = useRouter();

  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1); // MUI pagination starts from 0, but your API likely uses 1
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState("");

  const queryParams = Object.fromEntries(
    Object.entries({
      page,
      count,
      status,
      sort: "asc",
    }).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  const [filters, setFilters] = useState(defaultFilters);
  const { data: response = { list: [], total: 0 }, isLoading } = useUsersQuery(
    queryParams,
    {
      changeFlag,
    }
  );

  const rawTableData: IUser[] = response?.list;
  const totalUsers = response?.total;

  const tableData = rawTableData.map((user) => ({
    ...user,
    id: user?.id,
    status: user?.status,
    emailAddress: user?.emailAddress,
    totalBookings: user?.bookings?.length || 0,
  }));

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered;

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

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
      router.push(paths.dashboard.passengers.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await changeStatus(id, "SUSPEND");
      if (response?.statusCode == 400) {
        enqueueSnackbar(response.message, { variant: "error" });
      } else {
        enqueueSnackbar("User suspend successfully");
      }
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setChangeFlag(!changeFlag);
      setLoading(false);
    }
  }, []);

  const handlePromoteRow = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await promoteUserToAdmin(id);
        if (response?.statusCode === 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("User suspend successfully");
          router.push(paths.dashboard.user.root);
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setChangeFlag(!changeFlag);
        setLoading(false);
      }
    },
    [dataInPage?.length, table, tableData]
  );

  const handleActiveUser = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await changeStatus(id, "ACTIVE");
        if (response?.statusCode == 400) {
          enqueueSnackbar(response.message, { variant: "error" });
        } else {
          enqueueSnackbar("User active successfully");
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setChangeFlag(!changeFlag);
        setLoading(false);
      }
    },
    [dataInPage?.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.passengers.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterStatus = useCallback(
    (event: React.ChangeEvent<{}>, newValue: any) => {
      setPage(1); // Reset to first page when filter changes
      setStatus(newValue);
    },
    []
  );

  const statusCounts = useMemo(() => {
    const counts: UserStatuses = {
      ALL: totalUsers,
      ACTIVE: 0,
      ONHOLD: 0,
      SUSPEND: 0,
      PENDING: 0,
    };
    rawTableData.forEach((user) => {
      counts[user.status] = (counts[user.status] || 0) + 1;
    });
    return counts;
  }, [rawTableData]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Container>
            <CustomBreadcrumbs
              heading="Passengers List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Passengers", href: paths.dashboard.passengers.root },
                { name: "List" },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card>
              <Tabs
                value={status}
                onChange={handleFilterStatus}
                sx={{
                  px: 2.5,
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                {PASSENGER_STATUS_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                    icon={
                      <Label
                        variant={(tab.value === status && "filled") || "soft"}
                        color={
                          (tab.value === "ACTIVE" && "success") ||
                          (tab.value === "ONHOLD" && "warning") ||
                          (tab.value === "SUSPEND" && "error") ||
                          "default"
                        }
                      >
                        {tab.value === ""
                          ? statusCounts.ALL
                          : statusCounts[tab.value as UserStatus]}
                      </Label>
                    }
                  />
                ))}
              </Tabs>
              <PassengersTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <PassengersTableFiltersResult
                  filters={filters}
                  onFilters={handleFilters}
                  onResetFilters={handleResetFilters}
                  //
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

                {/* <Scrollbar> */}
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
                    {dataFiltered.map((row) => (
                      <PassengersTableRow
                        key={row.id}
                        row={row}
                        deleteConfirm={confirm}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onActiveUser={() => handleActiveUser(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onPromoteToAdminRow={() => handlePromoteRow(row.id)}
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
                {/* </Scrollbar> */}
              </TableContainer>

              <TablePaginationCustom
                count={totalUsers}
                page={page - 1}
                rowsPerPage={count}
                onPageChange={(_, newPage) => setPage(newPage + 1)} // Adjust for 1-based API
                onRowsPerPageChange={(e) => {
                  setCount(parseInt(e.target.value, 10));
                  setPage(1); // Reset to first page when count changes
                }}
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
  inputData: IUser[];
  comparator: any;
  filters: any;
}) {
  const { search, status } = filters;

  const stabilizedThis = inputData?.map((el: IUser, index: number) => [
    el,
    index,
  ]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return Number(a[1]) - Number(b[1]);
  });

  let filteredData: IUser[] = stabilizedThis?.map<IUser>((el: any) => el[0]);

  if (search) {
    filteredData = filteredData?.filter((user: IUser) => {
      return (
        user.firstName.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        user.emailAddress.toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    });
  }
  if (status) {
    filteredData = filteredData.filter((user) => user.status === status);
  }

  return filteredData;
}
