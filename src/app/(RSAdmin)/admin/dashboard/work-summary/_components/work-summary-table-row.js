import PropTypes from "prop-types";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Iconify from "@/components/iconify/iconify";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { MenuItem } from "@mui/material";

export default function DriverWorkSummaryTableRow({
  row,
  selected,
  onViewRow,
}) {
  const popover = usePopover();
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AwsImageAvatar
            imageKey={row?.driverName?.profileImage}
            alt={row?.driverName?.userInfo?.firstName}
            width={50}
            height={50}
          />
          <ListItemText
            primary={
              row?.driverName?.userInfo?.firstName +
              row?.driverName?.userInfo?.lastName
            }
            secondary={row?.driverName?.userInfo?.emailAddress}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.totalJobs}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.totalValue}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.cardPay}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.cashPay}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.tip}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.commission}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.totalAfterCommission}
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
      </CustomPopover>
    </>
  );
}

DriverWorkSummaryTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
