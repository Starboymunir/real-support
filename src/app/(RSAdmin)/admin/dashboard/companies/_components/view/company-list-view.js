"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useEffect, use } from "react";
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
import axios from "axios";
import { endpoints } from "@/lib/utils/axios";
import PackagesTableToolbar from "../company-table-toolbar";
import PackagesTableFiltersResult from "../company-table-filters-result";
import CompaniesTableRow from "../company-table-row";
import { activatePackage } from "@/server/Package";
import { useCompaniesQuery } from "@/hooks/Company";
import axiosInstance from "@/lib/axios";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "companyName", label: "Name" },
  { id: "companyPhone", label: "Company Phone", width: 150 },
  { id: "companyEmail", label: "Company Email", width: 150 },
  { id: "HMRC_RegistrationNumber", label: "Registration Number", width: 150 },
  {
    id: "PCO_OperatorLicenseNumber",
    label: "Operator License Number",
    width: 150,
  },
  { id: "status", label: "Status", width: 90 },
  { id: "", width: 50 },
];

const defaultFilters = {
  search: "",
  role: [],
};

// ----------------------------------------------------------------------

export default function CompaniesListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const { data: tableData = [], isLoading, refetch } = useCompaniesQuery();
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

  const handleDeleteRow = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.patch(
        `/company/updateCompanyStatus/${id}`,
        {
          status: "SUSPEND",
        }
      );

      if (data.success) {
        enqueueSnackbar("SUSPEND Successfully");
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleActiveCompany = async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.patch(
        `/company/updateCompanyStatus/${id}`,
        {
          status: "ACTIVE",
        }
      );

      if (data.success) {
        enqueueSnackbar("Company Activate Successfully");
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleEditRow = useCallback(
    (id) => {
      setLoading(true);
      router.push(paths.dashboard.companies.edit(id));
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
          <Container maxWidth={settings.themeStretch ? false : "xl"}>
            <CustomBreadcrumbs
              heading="Companies List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Companies", href: paths.dashboard.companies.root },
                { name: "List" },
              ]}
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
                        <CompaniesTableRow
                          key={row.id}
                          row={row}
                          deleteConfirm={confirm}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onActivePackage={() => handleActiveCompany(row.id)}
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
