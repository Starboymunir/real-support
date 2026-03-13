"use client";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import {
  useBoolean,
  UseBooleanReturn,
} from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import Label from "@/app/(RSAdmin)/admin/common/label";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import DriversQuickEditForm from "./drivers-quick-edit-form";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import AssignPackageDriverForm from "./AssignPackageForm";
import RemovePackageDriverForm from "./RemovePackageForm";
import { IDriver } from "@/types/type";

export default function DriversTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onActiveDriver,
  onHoldDriver,
  onPendingDriver,
  onViewRow,
  refetch,
  deleteConfirm,
  onSelectRow,
}: {
  row: IDriver;
  selected: boolean;
  onEditRow: () => void;
  onDeleteRow: () => void;
  onActiveDriver: () => void;
  onHoldDriver: () => void;
  onPendingDriver: () => void;
  onViewRow: () => void;
  refetch: () => void;
  deleteConfirm?: UseBooleanReturn;
  onSelectRow?: () => void;
}) {
  const confirm = useBoolean();

  const quickEdit = useBoolean();
  const quickEditPackage = useBoolean();
  const quickRemovePackage = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center" }}>
          <AwsImageAvatar
            imageKey={row.userInfo?.coverImage}
            alt={row?.userInfo?.firstName }
            sx={{ mr: 2 }}
          />
          <ListItemText
            primary={`${row?.userInfo?.firstName} ${row?.userInfo?.lastName}`}
            secondary={row?.userInfo?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.userInfo?.phone_number}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.userInfo?.emailAddress}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row?.status === "ACTIVE" && "success") ||
              (row?.status === "PENDING" && "warning") ||
              (row?.status === "SUSPEND" && "error") ||
              "default"
            }
          >
            {row?.status}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
          <IconButton
            color={popover.open ? "inherit" : "default"}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <AssignPackageDriverForm
        driver={row}
        open={quickEditPackage.value}
        onClose={quickEditPackage.onFalse}
        refetch={refetch}
      />
      <RemovePackageDriverForm
        driver={row }
        open={quickRemovePackage.value}
        onClose={quickRemovePackage.onFalse}
        refetch={refetch}
      />

      <DriversQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        refetch={refetch}
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
            onActiveDriver();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-reactivate-outline" />
          Active Driver
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEditPackage.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="bxs:package" />
          Assign Package
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickRemovePackage.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="bxs:package" />
          Remove Package
        </MenuItem>

        <MenuItem
          onClick={() => {
            onHoldDriver();
            popover.onClose();
          }}
        >
          <Iconify icon="medical-icon:i-waiting-area" />
          Hold Driver
        </MenuItem>
        <MenuItem
          onClick={() => {
            onPendingDriver();
            popover.onClose();
          }}
          sx={{ color: "warning.main" }}
        >
          <Iconify icon="mdi:account-pending" />
          Pending Driver
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Suspend
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to suspend driver {row?.userInfo?.firstName}{" "}
            {row?.userInfo?.lastName}?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Suspend
          </Button>
        }
      />
    </>
  );
}
