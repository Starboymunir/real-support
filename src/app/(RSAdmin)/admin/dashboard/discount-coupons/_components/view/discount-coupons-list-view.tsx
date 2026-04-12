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
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
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
import DiscountCouponsTableToolbar from "../discount-coupons-table-toolbar";
import DiscountCouponsTableFiltersResult from "../discount-coupons-table-filters-result";
import DiscountCouponsTableRow from "../discount-coupons-table-row";
import {
  deleteDiscountCoupon,
  getAllDiscountCoupons,
  updateIsActive,
} from "@/server/DiscountCoupons";
import { useRouter } from "next/navigation";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useGetAllDiscountCoupons } from "@/hooks/Coupons";
import { DiscountCoupons } from "@/lib/types";

const TABLE_HEAD = [
  { id: "coupon", label: "Coupon" },
  { id: "discount", label: "Discount", width: 150 },
  { id: "expiry", label: "Expiry", width: 120 },
  { id: "isActive", label: "Is Active", width: 120 },
  { id: "", label: "Action", width: 50 },
];

const defaultFilters = {
  search: "",
};

interface Filters {
  search: string;
  [key: string]: string;
}

type HandleFilters = (name: string, value: string) => void;

export default function DiscountCouponsListView() {
  const table = useTable();
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: tableData = [],
    isPending,
    refetch,
  } = useGetAllDiscountCoupons();
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const router = useRouter();

  const dataFiltered: DiscountCoupons[] = applyFilter({
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

  const confirm = useBoolean();

  const handleFilters: HandleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState: Filters) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const { statusCode, message } = await deleteDiscountCoupon(id);
        if (statusCode === 200) {
          enqueueSnackbar("Delete Successfully");
          setChangeFlag((prev) => !prev);
        } else {
          enqueueSnackbar(message, { variant: "error" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );
  const handleChangeActiveRow = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        setLoading(true);
        const { statusCode, message } = await updateIsActive(id, isActive);
        if (statusCode === 200) {
          enqueueSnackbar(
            isActive ? "Activated successfully" : "Deactivated successfully"
          );
          setChangeFlag((prev) => !prev);
        } else {
          enqueueSnackbar(message, { variant: "error" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.discountCoupons.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const load = isPending || loading;

  // console.log("Filtered Data:", dataFiltered, 'tableData:', tableData);

  return (
    <>
      {load ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Coupons List"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                {
                  name: "Coupons",
                  href: paths.dashboard.discountCoupons.root,
                },
                { name: "List" },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card>
              <DiscountCouponsTableToolbar
                filters={filters}
                onFilters={handleFilters}
              />

              {canReset && (
                <DiscountCouponsTableFiltersResult
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
                        {/* Icon for deleting */}
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
                    {dataFiltered.map((row) => (
                      <DiscountCouponsTableRow
                        key={row.id}
                        row={row}
                        deleteConfirm={confirm}
                        selected={table.selected.includes(row.id)}
                        onActive={() => handleChangeActiveRow(row.id, true)}
                        onInActive={() => handleChangeActiveRow(row.id, false)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
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
  inputData: DiscountCoupons[] | null | undefined;
  comparator: (a: DiscountCoupons, b: DiscountCoupons) => number;
  filters: { search: string };
}) {
  const { search } = filters;

  // Ensure it's always an array
  const safeData = Array.isArray(inputData) ? inputData : [];

  const stabilizedThis = safeData.map(
    (el, index) => [el, index] as [DiscountCoupons, number]
  );

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (search) {
    filteredData = filteredData.filter((coupon) =>
      coupon?.coupon?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return filteredData;
}
