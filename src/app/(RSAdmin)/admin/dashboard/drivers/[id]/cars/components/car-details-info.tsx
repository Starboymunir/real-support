import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import CardHeader from "@mui/material/CardHeader";
import { fDate } from "@/lib/utils/format-time";
import LegalInfoQuickEditForm from "./legal-info-quick-edit-form";
import { IconButton } from "@mui/material";
import Iconify from "@/components/iconify/iconify";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";

interface CarDetailsInfoProps {
  carDetail: any;
  setChangeFlag: any;
  setLoading: any;
}

export default function CarDetailsInfo({ carDetail, setChangeFlag, setLoading }: CarDetailsInfoProps) {
  const legalInfoQuickEdit = useBoolean();

  const handleLegalInfoForEdit = async () => {
    legalInfoQuickEdit.onTrue();
  };

  const renderCarDetails = (
    <Card>
      <CardHeader title="Details" />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Color
          </Box>
          {carDetail.color}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Engine
          </Box>
          {carDetail.engine}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Make
          </Box>

          {carDetail.make}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            model
          </Box>

          {carDetail.model}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Year
          </Box>

          {carDetail.year}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Number Plate
          </Box>

          {carDetail.numberPlate}
        </Stack>
      </Stack>
    </Card>
  );

  const doc = (
    <Card>
      <CardHeader
        title="Legal information"
        action={
          <IconButton onClick={handleLegalInfoForEdit}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 150, flexShrink: 0 }}
          >
            MOT pass date
          </Box>
          {fDate(carDetail?.carDocument?.motDocument?.motPassDate)}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 150, flexShrink: 0 }}
          >
            Insurance expiry date
          </Box>
          {fDate(
            carDetail?.carDocument?.insuranceDocument?.insuranceExpiryDate
          )}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 150, flexShrink: 0 }}
          >
            PCO License expiry date
          </Box>
          {fDate(
            carDetail?.carDocument?.pCOVehicleLicense
              ?.pcoVehicleLicenseExpiryDate
          )}
        </Stack>
      </Stack>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {renderCarDetails}
      {doc}
      <LegalInfoQuickEditForm
        currentDocument={carDetail?.carDocument}
        open={legalInfoQuickEdit.value}
        onClose={legalInfoQuickEdit.onFalse}
        setChangeFlag={setChangeFlag}
      />
    </Stack>
  );
}
