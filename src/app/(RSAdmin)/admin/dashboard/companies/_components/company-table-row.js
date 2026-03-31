import PropTypes from "prop-types";
import Button from "@mui/material/Button";
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
import PassengersQuickEditForm from "./company-quick-edit-form";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import Label from "../../../common/label";

export default function CompaniesTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onActivePackage,
  onViewRow,
}) {
  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected} sx={{ cursor: "pointer" }} onClick={onViewRow}>
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AwsImageRender
            imageKey={row?.coverImage}
            alt={row?.companyName}
            width={44}
            height={44}
            placeHolderImage="/images/services/parcel.jpg"
            className="shadow-none rounded-lg"
          />
          <ListItemText
            primary={row?.companyName}
            secondary={row?.companyEmail}
            primaryTypographyProps={{ typography: "subtitle2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
              typography: "caption",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "monospace", fontWeight: 600 }}>
          {row?.companyCode || "—"}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.phone_number}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.companyEmail}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.HMRC_RegistrationNumber}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.PCO_OperatorLicenseNumber}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Label
            variant="soft"
            color={
              (row?.status === "PENDING" && "default") ||
              (row?.status === "ONHOLD" && "warning") ||
              (row?.status === "ACTIVE" && "success") ||
              (row?.status === "SUSPEND" && "error")
            }
          >
            {row?.status}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
          <IconButton
            color={popover.open ? "inherit" : "default"}
            onClick={(e) => { e.stopPropagation(); popover.onOpen(e); }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <PassengersQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onActivePackage();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-reactivate-outline" />
          Activate
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          In Active
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to In Active package {row.name}</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

CompaniesTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onActivePackage: PropTypes.func,
  deleteConfirm: PropTypes.object,
};
