import Typography from "@mui/material/Typography";
import Card, { CardProps } from "@mui/material/Card";
import { fNumber } from "@/lib/utils/format-number";
import { Divider } from "@mui/material";


interface DriverWidgetProps extends CardProps {
  title: string;
  percent?: number;
  total: number;
}

export default function DriverWidget({ title, percent, total, sx, ...other }: DriverWidgetProps) {

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 3.5,
        ...sx,
      }}
      {...other}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{title}</Typography>
      <Divider orientation="vertical" flexItem sx={{ borderStyle: "dashed" }} />
      <Typography variant="h3">{fNumber(total)}</Typography>
    </Card>
  );
}
