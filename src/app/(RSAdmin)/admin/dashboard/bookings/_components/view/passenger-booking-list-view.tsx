"use client";
import sumBy from "lodash/sumBy";
import Card from "@mui/material/Card";
import { useTable } from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { Divider, Stack } from "@mui/material";
import RideAnalytic from "@/app/(RSAdmin)/admin/common/InvoiceAnalytics";
import { useTheme } from "@mui/material/styles";
import { useUserBookings } from "@/hooks/Bookings";
import { BookingStatus } from "@/types/prisma-types";
import { IBookingType } from "@/types/type";

export default function PassengerBookingListView({
  passengerId,
}: {
  passengerId: string;
}) {
  const table = useTable();
  const theme = useTheme();

  const { data: tableData = [], isLoading } = useUserBookings(
    passengerId,
    table.page,
    table.rowsPerPage,
    table.orderBy
  );

  const getTotalAmount = (status: string | string[]) =>
    sumBy(
      tableData.filter((item) =>
        Array.isArray(status)
          ? status.includes(item.status)
          : item.status === status
      ),
      (item) => Number(item.totalBill) || 0
    );

  const getPercentByStatus = (status: string | string[]) => {
    const count = tableData.filter((item) =>
      Array.isArray(status)
        ? status.includes(item.status)
        : item.status === status
    ).length;

    return tableData.length > 0 ? (count / tableData.length) * 100 : 0;
  };

  const pendingStatuses: BookingStatus[] = [
    BookingStatus.ARRIVED,
    BookingStatus.PICKED_UP,
    BookingStatus.WAY_TO_DESTINATION,
    BookingStatus.WAY_TO_PICKUP,
    BookingStatus.ACCEPTED,
  ];

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Card>
            <Stack
              direction="row"
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderStyle: "dashed" }}
                />
              }
              sx={{ py: 2 }}
            >
              <RideAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, "totalBill")}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <RideAnalytic
                title="Completed"
                total={
                  tableData?.filter(
                    (booking: IBookingType) =>
                      booking.status === BookingStatus.COMPLETED
                  ).length
                }
                percent={getPercentByStatus(BookingStatus.COMPLETED)}
                price={getTotalAmount(BookingStatus.COMPLETED)}
                icon="solar:file-check-bold-duotone"
                color={theme.palette.success.main}
              />

              <RideAnalytic
                title="Pending"
                total={
                  tableData?.filter((booking) =>
                    pendingStatuses.includes(booking.status)
                  ).length
                }
                percent={getPercentByStatus(pendingStatuses)}
                price={getTotalAmount(pendingStatuses)}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.palette.warning.main}
              />

              <RideAnalytic
                title="Cancelled"
                total={
                  tableData?.filter(
                    (booking) => booking.status === BookingStatus.CANCELLED
                  ).length
                }
                percent={getPercentByStatus(BookingStatus.CANCELLED)}
                price={getTotalAmount(BookingStatus.CANCELLED)}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.palette.error.main}
              />
            </Stack>
          </Card>
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
type Filters = {
  search?: string;
  status?: string | string[];
};

export function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IBookingType[];
  comparator: (a: IBookingType, b: IBookingType) => number;
  filters: Filters;
}) {
  const { search = "", status } = filters;

  const stabilized = inputData
    .map((el, index) => [el, index] as [IBookingType, number])
    .sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order !== 0 ? order : a[1] - b[1];
    })
    .map((el) => el[0]);

  let filtered = stabilized;

  if (search) {
    const lowerSearch = search.toLowerCase();

    filtered = filtered.filter((booking) => {
      const fieldsToSearch = [
        booking?.riderInfo?.firstName,
        booking?.riderInfo?.lastName,
        booking?.riderInfo?.emailAddress,
        booking?.riderInfo?.phone_number,
        booking?.requestInfo?.destination?.name,
        booking?.requestInfo?.destination?.city,
        booking?.requestInfo?.startFrom?.name,
        booking?.requestInfo?.startFrom?.city,
        booking?.driverInfo?.userInfo?.firstName,
        booking?.driverInfo?.userInfo?.lastName,
        booking?.driverInfo?.userInfo?.emailAddress,
        booking?.driverInfo?.userInfo?.phone_number,
      ];

      return fieldsToSearch.some((field) =>
        field?.toLowerCase().includes(lowerSearch)
      );
    });
  }

  if (status && status !== "all") {
    const statusList = Array.isArray(status) ? status : [status];
    filtered = filtered.filter((booking) =>
      statusList.includes(booking.status || "")
    );
  }

  return filtered;
}
