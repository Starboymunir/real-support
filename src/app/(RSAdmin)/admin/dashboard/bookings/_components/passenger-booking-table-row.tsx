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
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import dynamic from "next/dynamic";
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <CircularProgress size={24} /> }
) as any;
import { CircularProgress } from "@mui/material";
import Label from "../../../common/label";
import InvoicePDF from "@/components/booking/BookingInvoicePdf";

export default function PassengerBookingTableRow({
  row,
  selected,
  onAllowGenerateInvoice,
  onDisAllowGenerateInvoice,
  deleteConfirm,
  setChangeFlag,
  onSelectRow,
}: {
  row: any;
  selected: boolean;
  onAllowGenerateInvoice: () => void;
  onDisAllowGenerateInvoice: () => void;
  deleteConfirm: boolean;
  setChangeFlag: (value: boolean) => void;
  onSelectRow: () => void;
}) {
  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {new Date(row?.bookingDate).toLocaleDateString()}
      </TableCell>

      <TableCell>
        <div style={{ display: "flex", alignItems: "center" }}>
          <AwsImageAvatar
            imageKey={row?.riderInfo?.coverImage}
            alt={row?.riderInfo?.firstName + row?.riderInfo?.lastName}
            sx={{ mr: 2 }}
          />
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
          <AwsImageAvatar
            imageKey={row?.driverInfo?.userInfo?.coverImage || row?.driverInfo?.userInfo?.profileImageUrl}
            alt={
              row?.driverInfo?.userInfo?.firstName +
              row?.driverInfo?.userInfo?.lastName
            }
            sx={{ mr: 2 }}
          />
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
      <TableCell>
        <Label
          variant="soft"
          color={
            (row?.isAllowGenerateInvoice && "success") ||
            (!row?.isAllowGenerateInvoice && "error") ||
            "default"
          }
        >
          {row?.isAllowGenerateInvoice ? "Yes" : "No"}
        </Label>
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
        <IconButton
          color={collapse.value ? "inherit" : "default"}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: "action.hover",
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

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
        <>
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
        </>
      </CustomPopover>
    </>
  );
}
