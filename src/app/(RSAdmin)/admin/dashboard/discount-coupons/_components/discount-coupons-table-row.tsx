"use client";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import {
  useBoolean,
  UseBooleanReturn,
} from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import { Button, MenuItem } from "@mui/material";
import Label from "../../../common/label";
import { DiscountCoupons } from "@/lib/types";

export default function DiscountCouponsTableRow({
  row,
  selected,
  onEditRow,
  onInActive,
  onActive,
  onDeleteRow,
  deleteConfirm,
  setChangeFlag,
}: {
  row: DiscountCoupons;
  selected: boolean;
  onEditRow: () => void;
  onDeleteRow: () => void;
  onInActive: () => void;
  onActive: () => void;
  deleteConfirm?: UseBooleanReturn;
  setLoading?: (loading: boolean) => void;
  setChangeFlag?: (changeFlag: boolean) => void;
}) {
  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{row?.coupon}</TableCell>
        <TableCell>{`Discount: ${row?.discount}%`}</TableCell>
        <TableCell>
          {row?.expiry
            ? new Date(row?.expiry).toISOString()?.split("T")[0]
            : null}
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (row?.isActive && "success") ||
              (!row?.isActive && "error") ||
              "default"
            }
          >
            {row?.isActive ? "Active" : "Inactive"}
          </Label>
        </TableCell>
        <TableCell align="right">
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
            onActive();
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
          Deactivate
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Deactivate"
        content={<>Are you sure you want to deactivate coupon {row.coupon}?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onInActive();
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
