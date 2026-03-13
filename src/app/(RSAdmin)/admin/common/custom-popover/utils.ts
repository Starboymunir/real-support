// utils.ts
import { PopoverOrigin } from "@mui/material/Popover";

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

export function getPosition(arrow: ArrowPosition): {
  style?: object,
  anchorOrigin: PopoverOrigin,
  transformOrigin: PopoverOrigin,
} {
  switch (arrow) {
    case "top-left":
      return {
        style: { mt: -1 },
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },
      };
    case "top-center":
      return {
        style: { mt: -1 },
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        transformOrigin: { vertical: "top", horizontal: "center" },
      };
    case "top-right":
      return {
        style: { mt: -1 },
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "right" },
      };
    case "bottom-left":
      return {
        style: { mt: 1 },
        anchorOrigin: { vertical: "top", horizontal: "left" },
        transformOrigin: { vertical: "bottom", horizontal: "left" },
      };
    case "bottom-center":
      return {
        style: { mt: 1 },
        anchorOrigin: { vertical: "top", horizontal: "center" },
        transformOrigin: { vertical: "bottom", horizontal: "center" },
      };
    case "bottom-right":
      return {
        style: { mt: 1 },
        anchorOrigin: { vertical: "top", horizontal: "right" },
        transformOrigin: { vertical: "bottom", horizontal: "right" },
      };
    case "left-top":
      return {
        style: { ml: -1 },
        anchorOrigin: { vertical: "top", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "left" },
      };
    case "left-center":
      return {
        style: { ml: -1 },
        anchorOrigin: { vertical: "center", horizontal: "right" },
        transformOrigin: { vertical: "center", horizontal: "left" },
      };
    case "left-bottom":
      return {
        style: { ml: -1 },
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "bottom", horizontal: "left" },
      };
    case "right-top":
      return {
        style: { ml: 1 },
        anchorOrigin: { vertical: "top", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "right" },
      };
    case "right-center":
      return {
        style: { ml: 1 },
        anchorOrigin: { vertical: "center", horizontal: "left" },
        transformOrigin: { vertical: "center", horizontal: "right" },
      };
    case "right-bottom":
      return {
        style: { ml: 1 },
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "bottom", horizontal: "right" },
      };
    default:
      return {
        style: {},
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "right" },
      };
  }
}
