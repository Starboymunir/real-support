import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import CustomPopover, {
  usePopover,
} from "@/app/(RSAdmin)/admin/common/custom-popover";
import { ConfirmDialog } from "@/app/(RSAdmin)/admin/common/custom-dialog";
import AwsImageRender from "../../../common/aws-image-avatar/ImageRender";
import Label from "../../../common/label";
import Iconify from "@/components/iconify/iconify";
import { AdminPackage } from "@/types/package";


interface PackagesTableRowProps {
  row: AdminPackage;
  selected?: boolean;
  onEditRow: () => void;
  onDeleteRow?: () => void;
  onActivePackage: () => void;
  handleInActivePackage: () => void;
}

export default function PackagesTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onActivePackage,
  handleInActivePackage,
}: PackagesTableRowProps) {
  const confirmActivate = useBoolean();
  const confirmInActive = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AwsImageRender
            imageKey={
              typeof row?.coverImage === "string" ? row.coverImage : null
            }
            alt={row?.name || "package-image"}
            width={80}
            height={80}
            placeHolderImage="/images/services/parcel.jpg"
            className="shadow-none"
          />

          <ListItemText
            primary={row?.name}
            secondary={row?.summary}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.pricePerMilage}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.serviceFee}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.drivingProMin}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {row?.waitingProMin}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Label
            variant="soft"
            color={
              (row?.status == false && "warning") ||
              (row?.status == true && "success") ||
              "default"
            }
          >
            {row?.status ? "Active" : "Inactive"}
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
            confirmActivate.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:account-reactivate-outline" />
          Activate
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirmInActive.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Deactivate
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title="Activate"
        content={<>Are you sure you want to activate package {row.name}?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onActivePackage();
              confirmActivate.onFalse();
            }}
          >
            Activate
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmInActive.value}
        onClose={confirmInActive.onFalse}
        title="Deactivate"
        content={<>Are you sure you want to deactivate package {row.name}?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleInActivePackage();
              confirmInActive.onFalse();
            }}
          >
            Deactivate
          </Button>
        }
      />
    </>
  );
}
