import PropTypes from "prop-types";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Iconify from "@/components/iconify/iconify";
import { usePopover } from "@/app/(RSAdmin)/admin/common/custom-popover";
import Label from "@/app/(RSAdmin)/admin/common/label";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";

export default function TransactionsTableRow({ row }) {
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ wordWrap: "normal" }}>
          {" "}
          {row.userInfo ? (
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <AwsImageAvatar
                imageKey={row?.userInfo?.coverImage || row?.userInfo?.profileImageUrl}
                alt={row?.userInfo?.firstName}
                width={50}
                height={50}
                sx={{ mr: 2 }}
              />
              <ListItemText
                primary={
                  row?.userInfo?.firstName + " " + row?.userInfo?.lastName
                }
                secondary={row?.userInfo?.emailAddress}
                primaryTypographyProps={{ typography: "body2" }}
                secondaryTypographyProps={{
                  component: "span",
                  color: "text.disabled",
                }}
              />
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell sx={{ wordWrap: "normal" }}>
          {row.senderInfo ? (
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <AwsImageAvatar
                imageKey={row?.senderInfo?.coverImage}
                alt={row?.senderInfo?.firstName}
                width={50}
                height={50}
                sx={{ mr: 2 }}
              />
              <ListItemText
                primary={
                  row?.senderInfo?.firstName + " " + row?.senderInfo?.lastName
                }
                secondary={row?.senderInfo?.emailAddress}
                primaryTypographyProps={{ typography: "body2" }}
                secondaryTypographyProps={{
                  component: "span",
                  color: "text.disabled",
                }}
              />
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell sx={{ wordWrap: "normal" }}>
          {row?.receiverInfo ? (
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <AwsImageAvatar
                imageKey={row?.receiverInfo?.coverImage}
                alt={row?.receiverInfo?.firstName}
                width={50}
                height={50}
                sx={{ mr: 2 }}
              />
              <ListItemText
                primary={
                  row?.receiverInfo?.firstName +
                  " " +
                  row?.receiverInfo?.lastName
                }
                secondary={row?.receiverInfo?.emailAddress}
                primaryTypographyProps={{ typography: "body2" }}
                secondaryTypographyProps={{
                  component: "span",
                  color: "text.disabled",
                }}
              />
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell sx={{ wordWrap: "normal" }}>
          {row.stripeId ? row.stripeId : "-"}
        </TableCell>
        <TableCell sx={{ wordWrap: "normal" }}>
          {row?.type ? row?.type : "-"}
        </TableCell>
        <TableCell sx={{ wordWrap: "normal" }}>£ {row?.amount}</TableCell>
      </TableRow>
    </>
  );
}

TransactionsTableRow.propTypes = {
  row: PropTypes.object,
};
