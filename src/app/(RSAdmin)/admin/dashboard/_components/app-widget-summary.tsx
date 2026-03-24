// @mui
import { useTheme, alpha } from "@mui/material/styles";
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
  percent,
  total,
  chart,
  sx,
  ...other
}: {
  title: string;
  percent: number;
  total: number;
  chart: any;
  sx?: object;
  [key: string]: any;
}) {
  const theme = useTheme();

  const {
    colors = [theme.palette.primary.light, theme.palette.primary.main],
    series,
    options,
  } = chart;

  const chartOptions = {
    colors: [colors[1]],
    fill: {
      type: "gradient",
      gradient: {
        colorStops: [
          { offset: 0, color: colors[0], opacity: 1 },
          { offset: 100, color: colors[1], opacity: 1 },
        ],
      },
    },
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "68%",
        borderRadius: 2,
      },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (value: any) => fNumber(value),
        title: {
          formatter: () => "",
        },
      },
      marker: { show: false },
    },
    ...options,
  };

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        p: 3,
        background: `linear-gradient(135deg, ${alpha(colors[1], 0.12)} 0%, ${alpha(colors[0], 0.04)} 100%)`,
        border: `1px solid ${alpha(colors[1], 0.16)}`,
        boxShadow: 'none',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="h3" sx={{ mb: 1 }}>
          {fNumber(total)}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            width={20}
            icon={
              percent < 0
                ? "solar:double-alt-arrow-down-bold-duotone"
                : "solar:double-alt-arrow-up-bold-duotone"
            }
            sx={{
              color: "success.main",
              ...(percent < 0 && {
                color: "error.main",
              }),
            }}
          />

          <Typography
            component="div"
            variant="subtitle2"
            sx={{
              color: percent < 0 ? "error.main" : "success.main",
            }}
          >
            {percent > 0 && "+"}
            {fPercent(percent)}
          </Typography>
        </Stack>
      </Box>

      <Chart
        type="bar"
        series={[{ data: series }]}
        options={chartOptions}
        width={80}
        height={64}
      />
    </Card>
  );
}
