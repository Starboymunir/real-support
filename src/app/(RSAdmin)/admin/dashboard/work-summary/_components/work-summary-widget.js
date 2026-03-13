import PropTypes from "prop-types";
// @mui
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
// utils
import { fNumber, fPercent } from "@/lib/utils/format-number";
// components
import Iconify from "@/components/iconify/iconify";
import Chart from "@/app/(RSAdmin)/admin/common/chart";

// ----------------------------------------------------------------------

export default function AppWidgetSummary({
  title,
  total,
  sx,
  onClick,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        display: "flex",
        cursor: "pointer",
        alignItems: "center",
        p: 3,
        ...sx,
      }}
      onClick={onClick}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="h3">{total}</Typography>
      </Box>
    </Card>
  );
}

AppWidgetSummary.propTypes = {
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
