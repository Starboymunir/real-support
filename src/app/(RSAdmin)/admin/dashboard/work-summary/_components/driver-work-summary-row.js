import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import dynamic from "next/dynamic";
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);
import InvoicePDF from "@/components/booking/BookingInvoicePdf";
import { CircularProgress } from "@mui/material";
import AwsImageRender from "@/app/(RSAdmin)/admin/common/aws-image-avatar/ImageRender";

export default function BookingsTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onAllowGenerateInvoice,
  onDisAllowGenerateInvoice,
}) {
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
        <ListItemText
          primary={row?.packageInfo?.name}
          primaryTypographyProps={{ typography: "body2" }}
        />
      </TableCell>

      <TableCell>{row?.startFrom?.name}</TableCell>
      <TableCell>{row?.destination?.name}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {Number(row?.totalDistance).toFixed(2)}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.totalWaitingTime || 0}
      </TableCell>
      <TableCell>{row?.notes || "-"}</TableCell>
      <TableCell>
        <ListItemText
          primary={
            row?.riderName ||
            row?.riderInfo?.firstName + row?.riderInfo?.lastName
          }
          secondary={row?.riderEmail || row?.riderInfo?.emailAddress}
          primaryTypographyProps={{ typography: "body2" }}
          secondaryTypographyProps={{
            component: "span",
            color: "text.disabled",
          }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.riderNumber || row?.riderInfo?.phone_number}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.riderRating || 0}
      </TableCell>
      <TableCell>{row?.riderReview || "-"}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {Number(row?.totalBill).toFixed(2)}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.cashCollected || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.cardCollected || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.bankTransferCollected || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.walletCollected || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.discountAmount || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.couponCode || "-"}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.commission || 0}
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.paymentType}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.driverRating || 0}
      </TableCell>
      <TableCell>{row?.driverReview || "-"}</TableCell>

      {/* <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
        <IconButton
          color={popover.open ? "inherit" : "default"}
          onClick={popover.onOpen}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell> */}
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
            popover.onClose();
          }}
        >
          <PDFDownloadLink
            document={<InvoicePDF invoice={row} />}
            fileName={row.id}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <div className="flex items-center justify-center bg-red-500">
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
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
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
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
    </>
  );
}

BookingsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
