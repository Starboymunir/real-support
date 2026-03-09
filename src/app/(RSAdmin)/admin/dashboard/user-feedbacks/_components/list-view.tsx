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
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
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
import { useSnackbar } from "notistack";
import { Tab, Tabs, alpha } from "@mui/material";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { allowGenerateInvoice } from "@/server/Passenger";
import { useAdminBookingsQuery } from "@/hooks/Bookings";
import { useAdminFeedbacksQuery } from "@/hooks/ContactUs";
import { IContactUs } from "@/types/type";
import TableToolbar from "./table-toolbar";
import TableFiltersResult from "./table-filters-result";
import Scrollbar from "../../../common/scrollbar";
import FeedbackTableRow from "./table-row";
import { SOCKET_EVENT_ENUM } from "@/helpers/constants";
import { useSocket } from "@/providers/SocketProvider";

const TABLE_HEAD = [
  { id: "feedbackDate", label: "Date" },
  { id: "name", label: "Name" },
  { id: "phone_number", label: "Phone Number" },
  { id: "email", label: "Email" },
  { id: "reason", label: "Contact Reason" },
  { id: "status", label: "Status" },
  { id: "updatedAt", label: "Last Updated" },
  { id: "", label: "Action" },
];

const defaultFilters = {
  search: "",
  status: "all",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "New" },
  { value: "PROCESSING", label: "Working on it" },
  { value: "COMPLETED", label: "Responded" },
  { value: "all", label: "All" },
];
interface Filters {
  search: string;
  status: string;
}

type HandleFilters = (name: string, value: string) => void;

const FeedbackList = () => {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [changeFlag, setChangeFlag] = useState(true);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { data = [], isPending, refetch } = useAdminFeedbacksQuery();
  const [feedbacks, setFeedbacks] = useState<IContactUs[]>([]);
  const { socket } = useSocket();

  const [filters, setFilters] = useState(defaultFilters);
  const dataFiltered: IContactUs[] = applyFilter({
    inputData: feedbacks,
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

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters]
  );
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.userFeedbacks.details(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {},
    [dataInPage.length, table, data]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.userFeedbacks.edit(id));
    },
    [router]
  );

  useEffect(() => {
    if (data.length && feedbacks.length === 0) {
      setFeedbacks(data);
    }
  }, [data, feedbacks.length]);

  useEffect(() => {
    if (!socket) return;

    const handleNewContact = (newContact: IContactUs) => {
      setFeedbacks((prev) => [newContact, ...prev]);
    };

    socket.on(SOCKET_EVENT_ENUM.CONTACT_US.NEW_CONTACT_US, handleNewContact);

    return () => {
      socket.off(SOCKET_EVENT_ENUM.CONTACT_US.NEW_CONTACT_US, handleNewContact);
    };
  }, [socket]);

  if (isPending) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Feedbacks List"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Feedbacks", href: paths.dashboard.userFeedbacks.root },
          { name: "List" },
        ]}
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
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={
                    ((tab.value === "all" || tab.value === filters.status) &&
                      "filled") ||
                    "soft"
                  }
                  color={
                    (tab.value === "PENDING" && "error") ||
                    (tab.value === "PROCESSING" && "warning") ||
                    (tab.value === "COMPLETED" && "success") ||
                    "default"
                  }
                >
                  {tab.value === "PENDING" &&
                    data?.filter((booking) => booking.status === "PENDING")
                      .length}
                  {tab.value === "PROCESSING" &&
                    data?.filter((booking) => booking.status === "PROCESSING")
                      .length}
                  {tab.value === "COMPLETED" &&
                    data?.filter((booking) => booking.status === "COMPLETED")
                      .length}
                  {tab.value === "all" && data?.length}
                </Label>
              }
            />
          ))}
        </Tabs>
        <TableToolbar filters={filters} onFilters={handleFilters} />
        {canReset && (
          <TableFiltersResult
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
            rowCount={data.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                data.map((row) => row.id)
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
                rowCount={data.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    data.map((row) => row.id)
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
                    <FeedbackTableRow
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
                    data.length
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
  );
};

export default FeedbackList;

// function applyFilter({
//   inputData,
//   comparator,
//   filters,
// }: {
//   inputData: IContactUs[];
//   comparator: (a: IContactUs, b: IContactUs) => number;
//   filters: {
//     search: string;
//     status: string;
//   };
// }) {
//   const { search, status } = filters;
//   // Ensure it's always an array
//   const safeData = Array.isArray(inputData) ? inputData : [];

//   const stabilizedThis = safeData.map(
//     (el, index) => [el, index] as [IContactUs, number]
//   );

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   let filteredData = stabilizedThis.map((el) => el[0]);

//   if (search) {
//     const lowerSearch = search.toLowerCase();
//     filteredData = filteredData?.filter((feedback) => {
//       const user = feedback?.userInfo;
//       return (
//         user?.firstName?.toLowerCase().includes(lowerSearch) ||
//         user?.lastName?.toLowerCase().includes(lowerSearch) ||
//         user?.emailAddress?.toLowerCase().includes(lowerSearch) ||
//         String(user?.phone_number || "").includes(lowerSearch)
//       );
//     });
//   }

//   if (status && status !== "all") {
//     filteredData = filteredData.filter(
//       (feedback) => feedback.status === status
//     );
//   }

//   return filteredData;
// }

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IContactUs[];
  comparator: (a: IContactUs, b: IContactUs) => number;
  filters: { search: string; status: string };
}) {
  const { search, status } = filters;

  const filtered = [...inputData].sort(comparator);

  return filtered
    .filter((fb) => {
      if (!search) return true;
      const user = fb.userInfo;
      const lowerSearch = search.toLowerCase();
      return (
        user?.firstName?.toLowerCase().includes(lowerSearch) ||
        user?.lastName?.toLowerCase().includes(lowerSearch) ||
        user?.emailAddress?.toLowerCase().includes(lowerSearch) ||
        String(user?.phone_number || "").includes(lowerSearch)
      );
    })
    .filter((fb) => (status && status !== "all" ? fb.status === status : true));
}
