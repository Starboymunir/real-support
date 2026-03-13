import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Label from "@/app/(RSAdmin)/admin/common/label";
import Iconify from "@/components/iconify/iconify";
import CarsQuickEditForm from "./car-quick-edit-form";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import { changeCarStatus } from "@/server/Driver";
import { useSnackbar } from "notistack";
import { Car } from "@/lib/interface-types/driver-types";
import { Dispatch, SetStateAction } from "react";

interface CarDetailsToolbarProps {
  backLink: string;
  car: Car;
  setLoading: (value: boolean) => void;
  setChangeFlag: Dispatch<SetStateAction<boolean>>;
  setCurrentCar: Dispatch<SetStateAction<Car | null>>;
}

export default function CarDetailsToolbar({
  backLink,
  car,
  setLoading,
  setChangeFlag,
  setCurrentCar,
}: CarDetailsToolbarProps) {
  const quickEdit = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const handleActiveCar = async () => {
    try {
      setLoading(false);
      const { message, statusCode } = await changeCarStatus(car.id, "ACTIVE");
      if (statusCode === 200) {
        enqueueSnackbar("Car Active Sucessfully");
        setChangeFlag((prevValue: boolean) => !prevValue);
      } else {
        enqueueSnackbar(message, { variant: "error" });
      }
    } catch (err) {
      console.log("Errr", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInActiveCar = async () => {
    try {
      setLoading(false);
      const { message, statusCode } = await changeCarStatus(car.id, "INACTIVE");
      if (statusCode === 200) {
        enqueueSnackbar("Car In Active Sucessfully");
        setChangeFlag((prevValue: boolean) => !prevValue);
      } else {
        enqueueSnackbar(message, { variant: "error" });
      }
    } catch (err) {
      console.log("Errr", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: "column", md: "row" }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <Link href={backLink} legacyBehavior passHref>
            <IconButton component="a">
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Link>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">
                {`${car.model?.charAt(0).toUpperCase()}${car.model
                  ?.substr(1)
                  .toLowerCase()}`}
              </Typography>
              <Label
                variant="soft"
                color={
                  (car.status === "ACTIVE" && "success") ||
                  (car.status === "INACTIVE" && "error") ||
                  "default"
                }
              >
                {car.status}
              </Label>
            </Stack>
          </Stack>
        </Stack>

        <CarsQuickEditForm
          currentCar={car}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          setCurrentCar={setCurrentCar}
        />

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            color="success"
            variant="contained"
            onClick={handleActiveCar}
            disabled={car.status == "ACTIVE"}
          >
            Active Car
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleInActiveCar}
            disabled={car.status == "INACTIVE"}
          >
            In Active Car
          </Button>
          <Button
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={quickEdit.onTrue}
          >
            Edit
          </Button>
        </Stack>
      </Stack>
    </>
  );
};
