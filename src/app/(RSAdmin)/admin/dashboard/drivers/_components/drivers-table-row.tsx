"use client";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
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
import AssignCompanyForm from "./AssignCompanyForm";
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
  const quickEditCompany = useBoolean();

  const popover = usePopover();

  const vehiclesCount = (() => {
    const anyRow = row as any;
    const directCount = Number(anyRow?.carsCount);
    if (Number.isFinite(directCount) && directCount >= 0) return directCount;

    const aggregateCount = Number(anyRow?._count?.cars);
    if (Number.isFinite(aggregateCount) && aggregateCount >= 0) return aggregateCount;

    const cars = anyRow?.cars;

    if (Array.isArray(cars)) return cars.length;
    if (cars && typeof cars === "object") {
      if (Array.isArray(cars.data)) return cars.data.length;
      if (Array.isArray(cars.items)) return cars.items.length;
      if (Array.isArray(cars.results)) return cars.results.length;
      if (typeof cars.count === "number") return cars.count;
      return Object.keys(cars).length;
    }

    const metaCount = anyRow?._count?.cars ?? anyRow?.carsCount ?? anyRow?.vehicleCount;
    const parsedMetaCount = Number(metaCount);
    return Number.isFinite(parsedMetaCount) && parsedMetaCount >= 0 ? parsedMetaCount : 0;
  })();

  return (
    <>
      <TableRow hover selected={selected} sx={{ cursor: "pointer" }} onClick={onViewRow}>
        {/* Driver: Avatar + Name + Email */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ position: "relative" }}>
              <AwsImageAvatar
                imageKey={row.userInfo?.coverImage || row.userInfo?.profileImageUrl}
                alt={row?.userInfo?.firstName}
                sx={{ width: 44, height: 44 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  bgcolor: row.isOnline ? "success.main" : "grey.400",
                }}
              />
            </Box>
            <ListItemText
              primary={`${row?.userInfo?.firstName || ""} ${row?.userInfo?.lastName || ""}`}
              secondary={row?.userInfo?.emailAddress}
              primaryTypographyProps={{ typography: "subtitle2", noWrap: true }}
              secondaryTypographyProps={{
                component: "span",
                typography: "caption",
                color: "text.disabled",
                noWrap: true,
                sx: { maxWidth: 200, display: "block" },
              }}
            />
          </Stack>
        </TableCell>

        {/* Contact: Phone */}
        <TableCell>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:phone-bold" width={16} sx={{ color: "text.disabled" }} />
              <Box component="span" sx={{ typography: "body2", whiteSpace: "nowrap" }}>
                {row?.userInfo?.phone_number || "—"}
              </Box>
            </Stack>
          </Stack>
        </TableCell>

        {/* Vehicles */}
        <TableCell align="center">
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <Iconify icon="mdi:car" width={16} sx={{ color: vehiclesCount > 0 ? "info.main" : "text.disabled" }} />
            <Box component="span" sx={{ typography: "subtitle2", color: "text.primary", minWidth: 10 }}>
              {vehiclesCount}
            </Box>
          </Stack>
        </TableCell>

        {/* Subscription */}
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.subscription === "PREMIUM" && "primary") ||
              (row.subscription === "BASIC" && "info") ||
              "default"
            }
          >
            {row.subscription === "NONE" ? "Free" : row.subscription || "Free"}
          </Label>
        </TableCell>

        {/* Rating */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Rating value={row.ratings || 0} size="small" readOnly precision={0.5} max={5} />
          </Stack>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Label
            variant="soft"
            color={
              (row?.status === "ACTIVE" && "success") ||
              (row?.status === "PENDING" && "warning") ||
              (row?.status === "ONHOLD" && "info") ||
              (row?.status === "SUSPEND" && "error") ||
              "default"
            }
          >
            {row?.status}
          </Label>
        </TableCell>

        {/* Actions */}
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton
            color={popover.open ? "inherit" : "default"}
            onClick={(e) => { e.stopPropagation(); popover.onOpen(e); }}
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

      <AssignCompanyForm
        driver={row}
        open={quickEditCompany.value}
        onClose={quickEditCompany.onFalse}
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
            quickEditCompany.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="bxs:building" />
          Assign Company
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
