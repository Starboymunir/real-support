import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import Label from "@/app/(RSAdmin)/admin/common/label";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { IWithdrawals } from "@/types/type";
import { formattedPrice, formatToLocalDate } from "@/lib/utils";

export default function WithDrawalTableRow({
  row,
  selected,
  onAcceptRequest,
  onRejectRequest,
}: {
  row: IWithdrawals;
  selected?: boolean;
  onAcceptRequest: VoidFunction;
  onRejectRequest: VoidFunction;
}) {
  const popover = usePopover();
  // console.log(row, 'row-----------');

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AwsImageAvatar
            imageKey={row?.userInfo?.coverImage || row?.userInfo?.profileImageUrl}
            alt={row?.userInfo?.firstName}
            width={50}
            height={50}
          />
          <ListItemText
            primary={row?.userInfo?.firstName + " " + row?.userInfo?.lastName}
            secondary={row?.userInfo?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formattedPrice(row?.totalTopUp ?? 0)}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formattedPrice(row?.totalWithdraw ?? 0)}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formattedPrice(row?.currentBalance ?? 0, {
            notation: "standard",
          })}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formattedPrice(row?.amount)}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formatToLocalDate(row?.createdAt, {
            withTime: true,
          })}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {formatToLocalDate(row?.updatedAt, {
            withTime: true,
          })}
        </TableCell>

        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {row?.proceeder && (
            <>
              <AwsImageAvatar
                imageKey={row?.proceeder?.userProfile?.coverImage}
                alt={row?.proceeder?.userProfile?.firstName}
                width={50}
                height={50}
              />
              <ListItemText
                primary={
                  row?.proceeder?.userProfile?.firstName +
                  " " +
                  row?.proceeder?.userProfile?.lastName
                }
                secondary={row?.proceeder?.userProfile?.emailAddress}
                primaryTypographyProps={{ typography: "body2" }}
                secondaryTypographyProps={{
                  component: "span",
                  color: "text.disabled",
                }}
              />
            </>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Label
            variant="soft"
            color={
              (row?.status === "PROCESSED" && "success") ||
              (row?.status === "PENDING" && "warning") ||
              (row?.status === "REJECTED" && "warning") ||
              "default"
            }
          >
            {row?.status?.toLowerCase()}
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

      {row?.status == "PENDING" && (
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 200 }}
        >
          <MenuItem
            onClick={() => {
              onAcceptRequest();
              popover.onClose();
            }}
          >
            <Iconify icon="fluent:text-change-accept-24-filled" />
            Processed Request
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              onRejectRequest();
            }}
            sx={{ color: "error.main" }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Reject Request
          </MenuItem>
        </CustomPopover>
      )}
    </>
  );
}
