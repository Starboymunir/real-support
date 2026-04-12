"use client";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Iconify from "@/components/iconify/iconify";
import Label from "@/app/(RSAdmin)/admin/common/label";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { formatToLocalDate } from "@/lib/utils";

interface BankAccountRow {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  isDefault: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    coverImage?: string;
  };
}

export default function BankAccountsTableRow({
  row,
  onApprove,
  onReject,
}: {
  row: BankAccountRow;
  onApprove: VoidFunction;
  onReject: VoidFunction;
}) {
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        {/* User Info */}
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AwsImageAvatar
            imageKey={row?.user?.coverImage}
            alt={row?.user?.firstName}
            width={40}
            height={40}
          />
          <ListItemText
            primary={`${row?.user?.firstName || ""} ${row?.user?.lastName || ""}`}
            secondary={row?.user?.emailAddress}
            primaryTypographyProps={{ typography: "body2", noWrap: true }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
              noWrap: true,
            }}
          />
        </TableCell>

        {/* Bank Name */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row.bankName}</TableCell>

        {/* Account Name */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row.accountName}</TableCell>

        {/* Account Number */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row.accountNumber}</TableCell>

        {/* Sort Code */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row.sortCode}</TableCell>

        {/* Default */}
        <TableCell>
          {row.isDefault ? (
            <Label variant="soft" color="info">
              Default
            </Label>
          ) : (
            "-"
          )}
        </TableCell>

        {/* Status */}
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === "ACTIVE" && "success") ||
              (row.status === "PENDING" && "warning") ||
              (row.status === "REJECTED" && "error") ||
              "default"
            }
          >
            {row.status?.toLowerCase()}
          </Label>
        </TableCell>

        {/* Created */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formatToLocalDate(row.createdAt, { withTime: true })}
        </TableCell>

        {/* Actions */}
        <TableCell align="right" sx={{ px: 1 }}>
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
        sx={{ width: 180 }}
      >
        {row.status !== "ACTIVE" && (
          <MenuItem
            onClick={() => {
              onApprove();
              popover.onClose();
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" />
            Approve
          </MenuItem>
        )}

        {row.status !== "REJECTED" && (
          <MenuItem
            onClick={() => {
              onReject();
              popover.onClose();
            }}
            sx={{ color: "error.main" }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Reject
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
