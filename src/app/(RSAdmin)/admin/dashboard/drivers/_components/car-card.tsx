import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import AwsImageRender from '../../../common/aws-image-avatar/ImageRender';
import { Car } from '@/lib/interface-types/driver-types';

interface CarCardProps {
  car: Car;
  handleClick: (driverId: string, id: string) => void;
}

export default function CarCard({ car, handleClick }: CarCardProps) {
  const {
    carImage,
    model,
    driverInfo,
    engine,
    make,
    id
  } = car;

  

  return (
    <Card
      sx={{ textAlign: "center", cursor: "pointer" }}
      onClick={() => handleClick(driverInfo?.id || "", id)}
    >
      <Box sx={{ position: "relative", marginTop: 10 }}>
        <AwsImageRender
          imageKey={carImage || null  }
          alt={model || make}
          height={150}
          width={150}
          className="rounded-lg shadow-lg"
          // overlay={alpha(theme.palette.grey[900], 0.48)}
        />
      </Box>

      <ListItemText
        sx={{ my: 3 }}
        primary={make + " " + engine}
        secondary={`Model: ${model}`}
        primaryTypographyProps={{ typography: "subtitle1" }}
        secondaryTypographyProps={{ component: "span", mt: 0.5 }}
      />
    </Card>
  );
}
