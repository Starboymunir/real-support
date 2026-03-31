"use client";

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
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { formatDistance, formatDuration } from "@/lib/utils";
import { IContactUs } from "@/types/type";

export default function FeedbackTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onViewRow,
  setChangeFlag,
  deleteConfirm,
}: {
  row: IContactUs;
  selected: boolean;
  onEditRow: () => void;
  onDeleteRow: () => void;
  onViewRow: () => void;
  setChangeFlag: (changeFlag: boolean) => void;
  deleteConfirm: ReturnType<typeof useBoolean>;
}) {
  const quickEdit = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell sx={{ wordWrap: "normal" }}>
        {new Date(row?.createdAt).toLocaleDateString()}
      </TableCell>

      {/* <TableCell>
        <div style={{ display: "flex", alignItems: "center" }}>
          <AwsImageAvatar
            imageKey={row?.userInfo?.coverImage || row?.userInfo?.profileImageUrl}
            alt={`${row?.userInfo?.firstName ?? ""}${row?.userInfo?.lastName ?? ""}`}
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
      </TableCell> */}

      {/* <TableCell
        sx={{ display: "flex", alignItems: "center", gap: 2, width: "auto" }}
      >
        <AwsImageAvatar
          imageKey={row?.packageInfo?.coverImage}
          alt={row?.packageInfo?.name}
        />
        <ListItemText
          primary={row?.packageInfo?.name}
          primaryTypographyProps={{ typography: "body2" }}
        />
      </TableCell> */}

      {/* <TableCell sx={{ wordWrap: "normal" }}>{row?.startFrom?.name}</TableCell> */}

      {/* <TableCell sx={{ wordWrap: "normal" }}>
        {row?.destination?.name}
      </TableCell> */}

      {/* <TableCell sx={{ wordWrap: "normal" }}>
        {formatDistance(row?.totalDistance)}
      </TableCell> */}

      {/* <TableCell sx={{ wordWrap: "normal" }}>
        {formatDuration(row?.totalDuration)}
      </TableCell> */}

      {/* <TableCell sx={{ wordWrap: "normal" }}>
        {Number(row?.totalBill).toFixed(2)}
      </TableCell> */}
      <TableCell sx={{ wordWrap: "normal" }}>{row?.name}</TableCell>
      <TableCell sx={{ wordWrap: "normal" }}>{row?.phone_number}</TableCell>
      <TableCell sx={{ wordWrap: "normal" }}>{row?.email}</TableCell>
      <TableCell sx={{ wordWrap: "normal" }}>{row?.reason}</TableCell>
      <TableCell sx={{ wordWrap: "normal" }}>{row?.status}</TableCell>
      <TableCell sx={{ wordWrap: "normal" }}>
        {new Date(row?.updatedAt).toLocaleString()}
      </TableCell>
      <TableCell align="right" sx={{ wordWrap: "normal" }}>
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
        {/* {row.status === "PENDING" && row.requestType === "FIXED" && (
          <MenuItem
            onClick={() => {
              quickEdit.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="pajamas:assignee" />
            Assign Driver
          </MenuItem>
        )} */}

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
      </CustomPopover>

      {/* <AssignQuickEditForm
        row={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      /> */}
    </>
  );
}
