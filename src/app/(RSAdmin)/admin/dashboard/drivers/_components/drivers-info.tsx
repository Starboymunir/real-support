"use client";
import React, { useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import DriverWidget from "./driver-widget";
import { bgGradient } from "@/app/(RSAdmin)/admin/theme/css";
import AccordionDocument from "./AccordionDocument";
import DocQuickEditForm from "./drivers-document-quick-edit";
import { useBoolean } from "../../../hooks/use-boolean";
import { IconButton } from "@mui/material";
import Iconify from "../../../common/iconify/iconify";
import LegalInfoQuickEditForm from "./legal-info-quick-edit-form";

const formatDocDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generateDocumentAccordionData = (document: any) => [
  {
    documentTitle: "drivingLicense",
    name: "Driving License",
    documentsList: {
      licenseDocFront: document?.drivingLicense?.licenseDocFront,
      licenseDocBack: document?.drivingLicense?.licenseDocBack,
    },
  },
  {
    documentTitle: "pcoDocuments",
    name: "PHV License",
    documentsList: {
      pcoBadgeDocFront: document?.pcoDocuments?.pcoBadgeDocFront,
      pcoBadgeDocBack: document?.pcoDocuments?.pcoBadgeDocBack,
      pcoPaperDoc: document?.pcoDocuments?.pcoPaperDoc,
    },
  },
  {
    documentTitle: "passport",
    name: "DBS Certificate",
    documentsList: {
      passportDocFront: document?.passport?.passportDocFront,
      passportDocBack: document?.passport?.passportDocBack,
    },
  },
  {
    documentTitle: "bankDocuments",
    name: "Account Proof",
    documentsList: {
      accProfDoc: document?.bankDocuments?.accProfDoc,
    },
  },
  {
    documentTitle: "addressProfDocs",
    name: "Address Proof",
    documentsList: {
      addressProfDoc: document?.addressProfDocs?.addressProfDoc,
    },
  },
];

const generateLegalInfoData = (document: any) => [
  { name: "Sort code", value: document?.bankDocuments?.sortCode },
  { name: "Bank name", value: document?.bankDocuments?.bankName },
  { name: "Account Number", value: document?.bankDocuments?.accountNumber },
  { name: "License number", value: document?.drivingLicense?.licenseNumber },
  {
    name: "License expiry date",
    value: formatDocDate(document?.drivingLicense?.licenseExpiryDate),
  },
  { name: "PCO badge number", value: document?.pcoDocuments?.pcoBadgeNumber },
  {
    name: "PCO badge expiry date",
    value: formatDocDate(document?.pcoDocuments?.pcoBadgeExpiryDate),
  },
  { name: "Work permit code", value: document?.workPermitCode },
  { name: "Passport number", value: document?.passport?.passportNumber },
  {
    name: "Passport expiry date",
    value: formatDocDate(document?.passport?.passportExpiryDate),
  },
  { name: "House number", value: document?.addressProfDocs?.houseNumber },
  { name: "State", value: document?.addressProfDocs?.state },
  {
    name: "Zip Code/Postal Code",
    value: document?.addressProfDocs?.addressCode,
  },
  { name: "Street Address", value: document?.addressProfDocs?.streetAddress },
  { name: "City", value: document?.addressProfDocs?.city },
];

export default function DriverInfo({ info, refetch }: { info: any; refetch: any }) {
  const [expanded, setExpanded] = useState(false);
  const [forEdit, setForEdit] = useState({});
  const AccordionData = generateDocumentAccordionData(info?.document);
  const legalInfoData = generateLegalInfoData(info?.document);
  const theme = useTheme();
  const quickEdit = useBoolean();
  const legalInfoQuickEdit = useBoolean();

  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleForEdit = async (data: any) => {
    quickEdit.onTrue();
    setForEdit(data);
  };

  const handleLegalInfoForEdit = async () => {
    legalInfoQuickEdit.onTrue();
  };

  const completedJobs = info?.totalJobs?.filter((b: { status: string }) => b?.status === "COMPLETED")?.length || 0;
  const totalJobs = info?.totalJobs?.length || 0;

  // ── Stats row ──
  const statsRow = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 3 }}>
        <DriverWidget
          title="Completed Jobs"
          total={completedJobs}
          sx={{
            ...bgGradient({
              direction: "135deg",
              startColor: alpha(theme.palette.success.light, 0.2),
              endColor: alpha(theme.palette.success.main, 0.2),
            }),
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DriverWidget
          title="Total Jobs"
          total={totalJobs}
          sx={{
            ...bgGradient({
              direction: "135deg",
              startColor: alpha(theme.palette.info.light, 0.2),
              endColor: alpha(theme.palette.info.main, 0.2),
            }),
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DriverWidget
          title="Balance"
          total={info?.userInfo?.wallet?.balance || 0}
          sx={{
            ...bgGradient({
              direction: "135deg",
              startColor: alpha(theme.palette.primary.light, 0.2),
              endColor: alpha(theme.palette.primary.main, 0.2),
            }),
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DriverWidget
          title="Deposit"
          total={info?.depositAmount || 0}
          sx={{
            ...bgGradient({
              direction: "135deg",
              startColor: alpha(theme.palette.warning.light, 0.2),
              endColor: alpha(theme.palette.warning.main, 0.2),
            }),
          }}
        />
      </Grid>
    </Grid>
  );

  // ── Contact & personal info ──
  const contactInfo = (
    <Card>
      <CardHeader title="Contact & Personal Info" />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        {[
          { icon: "solar:letter-bold", label: "Email", value: info?.userInfo?.emailAddress },
          { icon: "solar:phone-bold", label: "Phone", value: info?.userInfo?.phone_number },
          { icon: "solar:calendar-bold", label: "Date of Birth", value: info?.dateOfBirth ? new Date(info.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null },
          { icon: "solar:map-point-bold", label: "Address", value: [info?.address, info?.city, info?.postcode].filter(Boolean).join(", ") || null },
          { icon: "solar:shield-check-bold", label: "NI Number", value: info?.nationalInsuranceNumber },
          { icon: "solar:document-bold", label: "Tax ID", value: info?.selfAssessmentTaxId },
          { icon: "solar:star-bold", label: "Rating", value: info?.ratings ? `${info.ratings} / 5` : null },
          { icon: "solar:tag-bold", label: "Subscription", value: info?.subscription },
          { icon: "solar:buildings-bold", label: "Commission", value: info?.commissionPercentage ? `${(info.commissionPercentage * 100).toFixed(0)}%` : null },
        ].map((item, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon={item.icon} width={20} sx={{ color: "text.disabled", flexShrink: 0 }} />
            <Box component="span" sx={{ color: "text.secondary", width: 110, flexShrink: 0 }}>
              {item.label}
            </Box>
            <Box component="span" sx={{ fontWeight: 500 }}>
              {item.value || "—"}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Card>
  );

  // ── Bio ──
  const renderAbout = (
    <Card>
      <CardHeader title="Bio" />
      <Stack spacing={1} sx={{ p: 3 }}>
        {info?.bio && <Typography variant="body2">{info.bio}</Typography>}
        {info?.hobby && (
          <Typography variant="body2" color="text.secondary">
            <strong>Hobby:</strong> {info.hobby}
          </Typography>
        )}
        {!info?.bio && !info?.hobby && (
          <Typography variant="body2" color="text.disabled">No bio added</Typography>
        )}
      </Stack>
    </Card>
  );

  // ── Legal information ──
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
        {legalInfoData?.map((cur, i) => (
          <Stack
            direction="row"
            alignItems="center"
            key={i}
            justifyContent="space-between"
          >
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 180, flexShrink: 0 }}
            >
              {cur?.name}
            </Box>
            <Box component="span" sx={{ fontWeight: 500 }}>
              {cur?.value || "—"}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {/* Stats row – full width */}
      {statsRow}

      {/* Two-column layout */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            {contactInfo}
            {renderAbout}
            {doc}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ bgcolor: "background.neutral" }}>
            <CardHeader title="Documents" />
            <Stack spacing={1} sx={{ p: 3 }}>
              {AccordionData.map((accord, index) => {
                const { name, documentsList, documentTitle } = accord || {};
                return (
                  <AccordionDocument
                    info={info}
                    handleForEdit={handleForEdit}
                    key={index}
                    expanded={expanded}
                    handleChange={handleChange}
                    name={name}
                    documentsList={documentsList}
                    documentTitle={documentTitle}
                    refetch={refetch}
                  />
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <DocQuickEditForm
        title={""}
        currentData={forEdit}
        documentId={info?.document?.id}
        driverId={info?.id}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        refetch={refetch}
      />
      <LegalInfoQuickEditForm
        currentDocument={info?.document}
        open={legalInfoQuickEdit.value}
        onClose={legalInfoQuickEdit.onFalse}
        refetch={refetch}
      />
    </Stack>
  );
}
