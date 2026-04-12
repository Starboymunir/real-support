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
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import { _userList, _roles } from "@/_mock";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
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
//
import UserTableRow from "../user-table-row";
import UserTableToolbar from "../user-table-toolbar";
import UserTableFiltersResult from "../user-table-filters-result";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import { changeAdminStatus } from "@/server/Admin";
import { useAdminUsersQuery } from "@/hooks/Admin";
import { IAdmin } from "@/types/type";

const TABLE_HEAD = [
  { id: "firstName", label: "Name" },
  { id: "phone_number", label: "Phone Number", width: 180 },
  { id: "email", label: "Email Address", width: 220 },
  { id: "role", label: "Role", width: 180 },
  { id: "createdAt", label: "Created At", width: 180 },
  { id: "status", label: "Status", width: 180 },
  { id: "", label: "Action", width: 88 },
];

const defaultFilters = {
  search: "",
  role: [],
};

export default function UserListView() {
  const { data: tableData = [], isLoading, refetch } = useAdminUsersQuery();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [changeFlag, setChangeFlag] = useState(true);

  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

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
    (name: "search" | "role", value: string | string[]) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleChangeStatus = useCallback(
    async (id: string, status: any) => {
      setLoading(true);
      try {
        const { statusCode, message } = await changeAdminStatus(id, status);
        if (statusCode !== 200) {
          enqueueSnackbar(message, { variant: "error" });
          return;
        }
        enqueueSnackbar(
          `User ${status ? "activated" : "deactivated"} successfully`
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        refetch();
      }
    },
    [dataInPage.length, table, tableData]
  );

  const loadingScreen = loading || isLoading;

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Container>
          <CustomBreadcrumbs
            heading="List"
            links={[
              { name: "Dashboard", href: paths.dashboard.root },
              { name: "Admin Users", href: paths.dashboard.user.root },
              { name: "List" },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.user.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New User
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <UserTableToolbar
              filters={filters}
              onFilters={handleFilters}
              roleOptions={_roles}
            />

            {canReset && (
              <UserTableFiltersResult
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
                    .map((row: IAdmin) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        deleteConfirm={confirm}
                        handleChangeStatus={handleChangeStatus}
                        selected={table.selected.includes(row.id)}
                        setLoading={setLoading}
                        onEditRow={() => handleEditRow(row.id)}
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
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}
    </>
  );
}

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IAdmin[];
  comparator: any;
  filters: any;
}) {
  const { search, role } = filters;

  // Stabilize sorting with index
  const stabilizedThis = inputData.map(
    (el, index) => [el, index] as [IAdmin, number]
  );

  // Sort by comparator
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  // Map back to IAdmin[] after sorting
  let filteredData = stabilizedThis.map((el) => el[0]);

  // Filter by search on filteredData
  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter((user) => {
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone_number?.toString().includes(search)
      );
    });
  }

  // Filter by role on filteredData
  if (role.length) {
    filteredData = filteredData.filter((user) => role.includes(user.role));
  }

  return filteredData;
}
