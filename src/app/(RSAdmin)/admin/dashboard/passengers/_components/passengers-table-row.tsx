// import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useBoolean, UseBooleanReturn } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import Label from "../../../common/label";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuthContext } from "@/providers/auth-providers";
import { IUser } from "@/types/type";

export default function PassengersTableRow({
  row,
  selected,
  onEditRow,
  onPromoteToAdminRow,
  onDeleteRow,
  onActiveUser,
  onViewRow,
  setChangeFlag,
  onSelectRow,
  deleteConfirm,
}: {
  row: IUser;
  selected: boolean;
  onEditRow: () => void;
  onPromoteToAdminRow: () => void;
  onDeleteRow: () => void;
  onSelectRow?: () => void;
  onActiveUser: () => void;
  onViewRow: () => void;
  setChangeFlag?: any;
  deleteConfirm?: UseBooleanReturn;
}) {
  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const router = useRouter();

  const { userId } = useAuthContext();

  const showChatButton = useMemo(() => userId !== row.id, [row, userId]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center" }}>
          <AwsImageAvatar
            alt={row?.firstName}
            imageKey={row?.coverImage}
            sx={{ mr: 2 }}
          />

          <ListItemText
            primary={row?.firstName + "" + row?.lastName}
            secondary={row?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.phone_number}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.emailAddress}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.bookings?.length}
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
            onPromoteToAdminRow();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-arrow-up" />
          Promote to Admin
        </MenuItem>

        <MenuItem
          onClick={() => {
            onActiveUser();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-reactivate" />
          Active User
        </MenuItem>
        {showChatButton && (
          <MenuItem
            onClick={() => {
              router.push(`/admin/dashboard/chat?adminChatUserId=${row.id}`);
            }}
          >
            <Iconify icon="mdi:chat-plus" />
            Chat with User
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Suspend User
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to suspend user {row.firstName} {row.lastName}
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
