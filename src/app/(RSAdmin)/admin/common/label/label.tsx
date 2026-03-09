import { ReactNode, ReactElement, forwardRef } from "react";
// @mui
import { useTheme, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
//
import { StyledLabel } from "./styles";

// ----------------------------------------------------------------------

type LabelProps = {
  children?: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error";
  variant?: "filled" | "outlined" | "soft";
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  sx?: object;
} & React.ComponentPropsWithoutRef<"span">;

const Label = forwardRef<HTMLSpanElement, LabelProps>(
  (
    {
      children,
      color = "default",
      variant = "soft",
      startIcon,
      endIcon,
      sx,
      ...other
    },
    ref
  ) => {
    const theme: Theme = useTheme();

    const iconStyle = {
      width: 16,
      height: 16,
      "& svg, img": { width: 1, height: 1, objectFit: "cover" },
    };

    return (
      <StyledLabel
        ref={ref}
        sx={{
          ...(startIcon && { pl: 0.75 }),
          ...(endIcon && { pr: 0.75 }),
          ...sx,
        }}
        theme={theme}
        ownerState={{ color, variant }}
        {...other}
      >
        {startIcon && <Box sx={{ mr: 0.75, ...iconStyle }}>{startIcon}</Box>}

        {children}

        {endIcon && <Box sx={{ ml: 0.75, ...iconStyle }}>{endIcon}</Box>}
      </StyledLabel>
    );
  }
);

export default Label;
