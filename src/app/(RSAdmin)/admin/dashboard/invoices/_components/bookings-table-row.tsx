import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import dynamic from "next/dynamic";
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <CircularProgress size={24} /> }
) as any;
import InvoicePDF from "@/components/booking/BookingInvoicePdf";
import { CircularProgress } from "@mui/material";

interface BookingsTableRowProps {
  row: any;
  selected: boolean;
  deleteConfirm: any;
  setChangeFlag: any;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
  onViewRow: () => void;
  onAllowGenerateInvoice: () => void;
  onDisAllowGenerateInvoice: () => void;
}

export default function BookingsTableRow({
  row,
  selected,
  deleteConfirm,
  setChangeFlag,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onViewRow,
  onAllowGenerateInvoice,
  onDisAllowGenerateInvoice,
}: BookingsTableRowProps) {
  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {new Date(row?.bookingDate).toLocaleDateString()}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.bookingTime}</TableCell>

      <TableCell>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ListItemText
            primary={
              row?.clientName ||
              row?.riderInfo?.firstName + row?.riderInfo?.lastName
            }
            secondary={row?.clientEmail || row?.riderInfo?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </div>
      </TableCell>

      <TableCell>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ListItemText
            primary={
              row?.driverInfo?.userInfo?.firstName +
              row?.driverInfo?.userInfo?.lastName
            }
            secondary={row?.driverInfo?.userInfo?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </div>
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.startFrom?.name}
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.destination?.name}
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {Number(row?.totalBill).toFixed(2)}
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {Number(row?.totalDistance).toFixed(2)}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.clientNumber || row?.riderInfo?.phone_number}
      </TableCell>
      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        <IconButton
          color={popover.open ? "inherit" : "default"}
          onClick={popover.onOpen}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
  return (
    <>
      {renderPrimary}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 200 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <PDFDownloadLink
            document={<InvoicePDF invoice={row} />}
            fileName={`invoice-${row.id}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Iconify icon="solar:eye-bold" />
                    Generate Invoice
                  </div>
                )}
              </>
            )}
          </PDFDownloadLink>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onAllowGenerateInvoice();
            popover.onClose();
          }}
        >
          <Iconify icon="icon-park:permissions" />
          Allow Generate Invoice
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDisAllowGenerateInvoice();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Disallow Invoice
        </MenuItem>
      </CustomPopover>
    </>
  );
}

