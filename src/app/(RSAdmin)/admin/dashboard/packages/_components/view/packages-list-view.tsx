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
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
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
import Button from "@mui/material/Button";
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import PackagesTableToolbar from "../packages-table-toolbar";
import PackagesTableFiltersResult from "../packages-table-filters-result";
import PackagesTableRow from "../packages-table-row";
import { activatePackage, deactivatePackage } from "@/server/Package";
import { useAdminPackagesQuery } from "@/hooks/Packages";
import Iconify from "@/components/iconify/iconify";
import { AdminPackage } from "@/types/package";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name" },
  { id: "pricePerMilage", label: "Price/Mileage", width: 150 },
  { id: "serviceFee", label: "Service Fee", width: 120 },
  { id: "drivingProMin", label: "Driving Rate/Min", width: 150 },
  { id: "waitingProMin", label: "Waiting Rate/Min", width: 150 },
  { id: "status", label: "Status", width: 90 },
  { id: "", label: "Actions", width: 50 },
];

const defaultFilters = {
  search: "",
  role: [],
};

// ----------------------------------------------------------------------

export const PackagesListView = () => {
  const table = useTable();

  const router = useRouter();

  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const { data: tableData = [], isLoading, refetch } = useAdminPackagesQuery();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

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

  interface FilterState {
    search: string;
    role: string[];
  }

  type HandleFilters = (
    name: keyof FilterState,
    value: string | string[]
  ) => void;

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

  interface HandleDeleteRow {
    (id: string): Promise<void>;
  }

  const handleInActivePackage: HandleDeleteRow = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        await deactivatePackage(id);
        enqueueSnackbar("Package deactivated successfully");
        refetch();
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [refetch, enqueueSnackbar]
  );

  interface HandleActivePackage {
    (id: string): Promise<void>;
  }

  const handleActivePacakge: HandleActivePackage = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      try {
        await activatePackage(id);
        enqueueSnackbar("Package activated successfully");
        refetch();
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [refetch, enqueueSnackbar]
  );

  interface HandleEditRow {
    (id: string): void;
  }

  const handleEditRow: HandleEditRow = useCallback(
    (id: string): void => {
      setLoading(true);
      router.push(paths.dashboard.packages.edit(id));
      setLoading(false);
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      {loading || isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Container>
            <CustomBreadcrumbs
              heading="Packages List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Packages", href: paths.dashboard.packages.root },
                { name: "List" },
              ]}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.packages.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  New Package
                </Button>
              }
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card>
              <PackagesTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <PackagesTableFiltersResult
                  filters={filters}
                  onFilters={handleFilters}
                  //
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
                  onSelectAllRows={(checked: boolean) =>
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
                  sx={{}}
                />
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
                    {dataInPage.map((row) => (
                      <PackagesTableRow
                        key={row.id}
                        row={row}
                        handleInActivePackage={() =>
                          handleInActivePackage(row.id)
                        }
                        // onDeleteRow={() => handleDeleteRow(row.id)}
                        onActivePackage={() => handleActivePacakge(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
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
              </TableContainer>

              <TablePaginationCustom
                count={dataFiltered.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                dense={table.dense}
                onChangeDense={table.onChangeDense}
                sx={{}} // Added empty sx prop to satisfy type requirements
              />
            </Card>
          </Container>
        </>
      )}
    </>
  );
};

export default PackagesListView;

// ----------------------------------------------------------------------
function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: AdminPackage[];
  comparator: (a: AdminPackage, b: AdminPackage) => number;
  filters: { search: string };
}) {
  // Make sure we have an array
  const safeData = Array.isArray(inputData) ? inputData : [];

  // 1️⃣ Sort the data
  const stabilized = safeData.map(
    (el, index) => [el, index] as [AdminPackage, number]
  );
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  let filteredData = stabilized.map((el) => el[0]);

  // 2️⃣ Apply search filter
  const { search } = filters;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower)
    );
  }

  // 3️⃣ Future filters can be added here easily, e.g. status, role, etc.

  return filteredData; // ✅ Always return the processed array
}

// function applyFilter({
//   inputData,
//   comparator,
//   filters,
// }: {
//   inputData: Package[];
//   comparator: (a: Package, b: Package) => number;
//   filters: { search: string };
// }) {
//   const { search } = filters;

//   // Ensure it's always an array
//   const safeData = Array.isArray(inputData) ? inputData : [];

//   const stabilizedThis = safeData.map(
//     (el, index) => [el, index] as [Package, number]
//   );

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   let filteredData = stabilizedThis.map((el) => el[0]);

//   if (search) {
//     filteredData = filteredData.filter((packages) => {
//       return (
//         packages.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
//         packages.description.toLowerCase().indexOf(search.toLowerCase()) !== -1
//       );
//     });
//   }

//   return inputData;
// }
