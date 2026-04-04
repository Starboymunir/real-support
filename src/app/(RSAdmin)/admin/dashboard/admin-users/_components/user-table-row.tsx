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
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import Label from "@/app/(RSAdmin)/admin/common/label";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { IAdmin } from "@/types/type";

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  handleChangeStatus,
}: {
  row: IAdmin;
  selected: boolean;
  onEditRow: () => void;
  handleChangeStatus: (id: string, status: boolean) => void;
  deleteConfirm?: UseBooleanReturn;
  setLoading?: (loading: boolean) => void;
  setChangeFlag?: (changeFlag: boolean) => void;
}) {
  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center" }}>
          <AwsImageAvatar
            alt={row.firstName}
            imageKey={row.coverImage || row.profileImageUrl}
            sx={{ mr: 2 }}
          />

          <ListItemText
            primary={`${row.firstName || ""} ${row.lastName || ""}`}
            secondary={row.email}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row.phone_number}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row.email}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.role}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {new Date(row.createdAt)?.toISOString()?.substring(0, 10)}
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status && "success") || (!row.status && "error") || "default"
            }
          >
            {row.status ? "Active" : "Inactive"}
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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 200 }}
      >
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
            handleChangeStatus(row.id, true);
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-reactivate-outline" />
          Activate User
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Deactivate User
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Deactivate User"
        content={
          <>
            Are you sure you want to deactivate user {row.firstName}{" "}
            {row.lastName}?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleChangeStatus(row.id, false);
              confirm.onFalse();
            }}
          >
            Deactivate
          </Button>
        }
      />
    </>
  );
}
