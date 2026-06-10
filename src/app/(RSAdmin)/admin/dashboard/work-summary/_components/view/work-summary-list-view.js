"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { alpha, useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers";
import Iconify from "@/components/iconify/iconify";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from "@/app/(RSAdmin)/admin/common/table";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { apiClient } from "@/lib/ApiClient";
import AwsImageAvatar from "../../../../common/aws-image-avatar/Avatar";
import { useRouter } from "next/navigation";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

// ── Period helpers ──
function getToday() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    label: "Today",
  };
}

function getThisWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return { start: monday, end: sunday, label: "This Week (Mon–Sun)" };
}

function getThisMonth() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    label: "This Month",
  };
}

function getTaxYear() {
  const now = new Date();
  let startYear;
  if (now.getMonth() < 3 || (now.getMonth() === 3 && now.getDate() < 6)) {
    startYear = now.getFullYear() - 1;
  } else {
    startYear = now.getFullYear();
  }
  return {
    start: new Date(startYear, 3, 6),
    end: new Date(startYear + 1, 3, 6),
    label: `Tax Year ${startYear}/${startYear + 1}`,
  };
}

// ── Table heads ──
const ALL_DRIVERS_HEAD = [
  { id: "driverName", label: "Driver" },
  { id: "totalJobs", label: "Jobs", width: 90, align: "center" },
  { id: "totalRevenue", label: "Revenue", width: 120, align: "right" },
  { id: "cashPay", label: "Cash", width: 110, align: "right" },
  { id: "walletPay", label: "Card / Wallet", width: 130, align: "right" },
  { id: "commission", label: "Commission", width: 120, align: "right" },
  { id: "netPay", label: "Net Pay", width: 120, align: "right" },
  { id: "actions", label: "", width: 60 },
];

const BOOKINGS_HEAD = [
  { id: "bookingDate", label: "Date", width: 110 },
  { id: "bookingTime", label: "Time", width: 80 },
  { id: "riderName", label: "Passenger" },
  { id: "packageName", label: "Package", width: 120 },
  { id: "startFrom", label: "Pickup" },
  { id: "destination", label: "Drop-off" },
  { id: "finalBill", label: "Fare", width: 90, align: "right" },
  { id: "cashCollected", label: "Cash", width: 90, align: "right" },
  { id: "walletCollected", label: "Wallet", width: 90, align: "right" },
  { id: "commission", label: "Commission", width: 100, align: "right" },
  { id: "paymentType", label: "Payment", width: 100 },
];

const PERIODS = ["today", "week", "month", "year"];

const fCurrency = (v) => `£${Number(v || 0).toFixed(2)}`;
const fDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ══════════════════════════════════════════════════════════════════
export default function DriverSummaryListView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const table = useTable({ defaultRowsPerPage: 25 });
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ rows: [], totals: null });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [period, setPeriod] = useState("today");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  useEffect(() => {
    apiClient.get("/admin/drivers?count=1000").then((res) => {
      setDrivers(res.data || []);
    });
  }, []);

  const dateRange = useMemo(() => {
    switch (period) {
      case "today": return getToday();
      case "week": return getThisWeek();
      case "month": return getThisMonth();
      case "year": return getTaxYear();
      case "custom":
        return {
          start: customStart ? new Date(customStart) : null,
          end: customEnd ? new Date(customEnd) : null,
          label: "Custom Range",
        };
      default: return getToday();
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    // Per-driver aggregated rows + totals come from the server. The previous
    // implementation pulled `count=10000` completed bookings and aggregated
    // in the browser, which silently capped the report past 10k bookings
    // and used `totalBill` (pre-tip) instead of `finalBill` (actually paid).
    const params = new URLSearchParams();
    if (dateRange.start) params.set("startDate", dateRange.start.toISOString());
    if (dateRange.end) params.set("endDate", dateRange.end.toISOString());
    if (selectedDriver) params.set("driverId", selectedDriver.id);

    setLoading(true);
    const requests = [
      apiClient.get(`/admin/bookings/work-summary?${params.toString()}`),
    ];
    // When a single driver is selected we also fetch the booking-level rows
    // so the per-booking table renders. Keep the page size paginated server
    // side (default 25 per page is enough for the visible table).
    if (selectedDriver) {
      const bookingParams = new URLSearchParams({
        status: "COMPLETED",
        count: "500",
        driverId: selectedDriver.id,
      });
      if (dateRange.start) bookingParams.set("startDate", dateRange.start.toISOString());
      if (dateRange.end) bookingParams.set("endDate", dateRange.end.toISOString());
      requests.push(apiClient.get(`/admin/bookings?${bookingParams.toString()}`));
    }

    Promise.all(requests)
      .then(([summaryRes, bookingsRes]) => {
        const data = summaryRes?.data?.data || summaryRes?.data || {};
        setSummary({ rows: data.rows || [], totals: data.totals || null });
        setBookings(bookingsRes?.data || []);
        table.onChangePage(null, 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange, selectedDriver]);

  // When a driver is selected the summary endpoint returns a single row for
  // that driver — pull jobs/revenue from it. When no driver is selected the
  // grid lists every driver's row. Either way the totals come from server.
  const driverStats = useMemo(() => {
    if (selectedDriver) return [];
    return [...summary.rows].sort((a, b) => b.totalJobs - a.totalJobs);
  }, [summary.rows, selectedDriver]);

  const totals = useMemo(() => {
    if (summary.totals) return summary.totals;
    return { jobs: 0, revenue: 0, cash: 0, wallet: 0, commission: 0 };
  }, [summary.totals]);

  const displayData = selectedDriver ? bookings : driverStats;
  const paginatedData = displayData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const periodLabel = period === "custom" && customStart && customEnd
    ? `${fDate(customStart)} – ${fDate(customEnd)}`
    : dateRange.label;

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Typography variant="h4" sx={{ mb: 3 }}>Work Summary</Typography>

      {/* Controls */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }} alignItems={{ md: "center" }}>
        <ButtonGroup variant="outlined" size="small">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? "contained" : "outlined"}
              onClick={() => setPeriod(p)}
              sx={{ textTransform: "capitalize", minWidth: 90 }}
            >
              {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "Tax Year"}
            </Button>
          ))}
          <Button
            variant={period === "custom" ? "contained" : "outlined"}
            onClick={() => setPeriod("custom")}
            sx={{ textTransform: "capitalize", minWidth: 90 }}
          >
            Custom
          </Button>
        </ButtonGroup>

        {period === "custom" && (
          <Stack direction="row" spacing={1} alignItems="center">
            <DatePicker
              label="From"
              value={customStart}
              onChange={setCustomStart}
              slotProps={{ textField: { size: "small", sx: { maxWidth: 160 } } }}
            />
            <DatePicker
              label="To"
              value={customEnd}
              onChange={setCustomEnd}
              slotProps={{ textField: { size: "small", sx: { maxWidth: 160 } } }}
            />
          </Stack>
        )}

        <Autocomplete
          value={selectedDriver}
          onChange={(_, v) => setSelectedDriver(v)}
          options={drivers}
          getOptionLabel={(d) =>
            `${d.userInfo?.firstName || ""} ${d.userInfo?.lastName || ""}`.trim() || d.id
          }
          renderOption={(props, d) => (
            <li {...props} key={d.id}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AwsImageAvatar imageKey={d.userInfo?.profileImageUrl || d.userInfo?.coverImage} alt={d.userInfo?.firstName} width={32} height={32} />
                <ListItemText
                  primary={`${d.userInfo?.firstName || ""} ${d.userInfo?.lastName || ""}`}
                  secondary={d.userInfo?.emailAddress}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                />
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} placeholder="All Drivers" size="small" sx={{ minWidth: 260 }} />
          )}
          sx={{ flexShrink: 0 }}
          clearOnEscape
        />
      </Stack>

      {/* Period & info chips */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label={periodLabel}
          size="small"
          color="primary"
          variant="outlined"
          icon={<Iconify icon="solar:calendar-bold" width={16} />}
        />
        {selectedDriver && (
          <Chip
            label={`${selectedDriver.userInfo?.firstName || ""} ${selectedDriver.userInfo?.lastName || ""}`}
            size="small"
            color="info"
            variant="outlined"
            onDelete={() => setSelectedDriver(null)}
          />
        )}
        <Typography variant="body2" color="text.secondary">
          {totals.jobs} {totals.jobs === 1 ? "job" : "jobs"}
        </Typography>
      </Stack>

      {/* Summary cards */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <SummaryCard title="Total Jobs" value={totals.jobs} icon="solar:clipboard-check-bold" color={theme.palette.primary.main} />
        <SummaryCard title="Revenue" value={fCurrency(totals.revenue)} icon="solar:dollar-minimalistic-bold" color={theme.palette.success.main} />
        <SummaryCard title="Cash" value={fCurrency(totals.cash)} icon="solar:wallet-bold" color={theme.palette.warning.main} />
        <SummaryCard title="Card / Wallet" value={fCurrency(totals.wallet)} icon="solar:card-bold" color={theme.palette.info.main} />
        <SummaryCard title="Commission" value={fCurrency(totals.commission)} icon="solar:chart-bold" color={theme.palette.error.main} />
      </Box>

      {/* Data table */}
      {loading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <TableContainer sx={{ overflow: "unset" }}>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={selectedDriver ? BOOKINGS_HEAD : ALL_DRIVERS_HEAD}
                  onSort={table.onSort}
                />
                <TableBody>
                  {paginatedData.map((row) =>
                    selectedDriver ? (
                      <BookingRow key={row.id} row={row} />
                    ) : (
                      <DriverRow
                        key={row.driverId}
                        row={row}
                        onSelect={() => {
                          const d = drivers.find((dr) => dr.id === row.driverId);
                          if (d) setSelectedDriver(d);
                        }}
                      />
                    )
                  )}

                  {paginatedData.length > 0 && (
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                      {selectedDriver ? (
                        <>
                          <TableCell colSpan={6} sx={{ fontWeight: 700 }}>Totals</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.revenue)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.cash)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.wallet)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.commission)}</TableCell>
                          <TableCell />
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Totals ({driverStats.length} drivers)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.jobs}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.revenue)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.cash)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.wallet)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.commission)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fCurrency(totals.revenue - totals.commission)}</TableCell>
                          <TableCell />
                        </>
                      )}
                    </TableRow>
                  )}

                  <TableNoData notFound={!paginatedData.length} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={displayData.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      )}
    </Container>
  );
}

// ── Summary card ──
function SummaryCard({ title, value, icon, color }) {
  return (
    <Card sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 1.5, display: "flex",
          alignItems: "center", justifyContent: "center",
          bgcolor: alpha(color, 0.12),
        }}
      >
        <Iconify icon={icon} width={26} sx={{ color }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" noWrap>{title}</Typography>
        <Typography variant="h5" noWrap>{value}</Typography>
      </Box>
    </Card>
  );
}

// ── Driver summary row ──
function DriverRow({ row, onSelect }) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onSelect}>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AwsImageAvatar
            imageKey={row.driver?.userInfo?.profileImageUrl || row.driver?.userInfo?.coverImage}
            alt={row.driverName}
            width={36}
            height={36}
          />
          <ListItemText
            primary={row.driver ? `${row.driver.userInfo?.firstName || ""} ${row.driver.userInfo?.lastName || ""}` : row.driverName}
            secondary={row.driver?.userInfo?.emailAddress || row.driverEmail}
            primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
            secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
          />
        </Stack>
      </TableCell>
      <TableCell align="center">{row.totalJobs}</TableCell>
      <TableCell align="right">{fCurrency(row.totalRevenue)}</TableCell>
      <TableCell align="right">{fCurrency(row.cashPay)}</TableCell>
      <TableCell align="right">{fCurrency(row.walletPay)}</TableCell>
      <TableCell align="right">{fCurrency(row.commission)}</TableCell>
      <TableCell align="right">{fCurrency(row.totalRevenue - row.commission)}</TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          <Iconify icon="solar:eye-bold" width={18} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

// ── Booking detail row ──
function BookingRow({ row }) {
  const router = useRouter();
  return (
    <TableRow
      hover
      sx={{ cursor: "pointer" }}
      onClick={() => router.push(paths.dashboard.bookings.details(row.id))}
    >
      <TableCell sx={{ whiteSpace: "nowrap" }}>{fDate(row.bookingDate)}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.bookingTime || "-"}</TableCell>
      <TableCell>
        <ListItemText
          primary={row.riderName || `${row.riderInfo?.firstName || ""} ${row.riderInfo?.lastName || ""}`}
          secondary={row.riderPhone || row.riderInfo?.phone_number}
          primaryTypographyProps={{ variant: "body2" }}
          secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
        />
      </TableCell>
      <TableCell>{row.packageInfo?.name || row.packageName || "-"}</TableCell>
      <TableCell sx={{ maxWidth: 200 }}>
        <Typography variant="body2" noWrap>{row.startFrom?.name || "-"}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 200 }}>
        <Typography variant="body2" noWrap>{row.destination?.name || "-"}</Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(row.finalBill ?? row.totalBill)}</TableCell>
      <TableCell align="right">{fCurrency(row.cashCollected)}</TableCell>
      <TableCell align="right">{fCurrency(row.walletCollected)}</TableCell>
      <TableCell align="right">{fCurrency(row.commission)}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={row.paymentType || "-"}
          variant="soft"
          color={row.paymentType === "CASH" ? "warning" : row.paymentType === "WALLET" ? "info" : "default"}
        />
      </TableCell>
    </TableRow>
  );
}
