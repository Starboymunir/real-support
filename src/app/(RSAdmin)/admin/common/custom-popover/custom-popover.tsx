import { ReactNode } from "react";
// @mui
import { menuItemClasses } from "@mui/material/MenuItem";
import Popover, { PopoverProps } from "@mui/material/Popover";
//
import { getPosition } from "./utils";
import { StyledArrow } from "./styles";

// ----------------------------------------------------------------------

type ArrowPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom";

interface CustomPopoverProps extends Omit<PopoverProps, "open"> {
  open: null | HTMLElement;
  children: ReactNode;
  sx?: object;
  arrow?: ArrowPosition;
  hiddenArrow?: boolean;
}

export default function CustomPopover({
  open,
  children,
  arrow = "top-right",
  hiddenArrow,
  sx,
  ...other
}: CustomPopoverProps) {
  const { style, anchorOrigin, transformOrigin } = getPosition(arrow);

  return (
    <Popover
      open={Boolean(open)}
      anchorEl={open}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            width: "auto",
            overflow: "inherit",
            ...style,
            [`& .${menuItemClasses.root}`]: {
              "& svg": {
                mr: 2,
                flexShrink: 0,
              },
            },
            ...sx,
          },
        },
      }}
      {...other}
    >
      {!hiddenArrow && <StyledArrow />}
      {children}
    </Popover>
  );
}
