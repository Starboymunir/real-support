"use client";
import React, { useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import DriverWidget from "./driver-widget";
import { bgGradient } from "@/app/(RSAdmin)/admin/theme/css";
import {
  generateDocumentAccordionData,
  generateLegalInfoData,
} from "@/lib/utils";
import AccordionDocument from "./AccordionDocument";
import DocQuickEditForm from "./drivers-document-quick-edit";
import { useBoolean } from "../../../hooks/use-boolean";
import { IconButton } from "@mui/material";
import Iconify from "../../../common/iconify/iconify";
import LegalInfoQuickEditForm from "./legal-info-quick-edit-form";

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

  const jobStatus = (
    <Card sx={{ py: 3, textAlign: "center", typography: "h4" }}>
      <Stack
        direction="row"
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderStyle: "dashed" }}
          />
        }
      >
        <Stack width={1}>
          {info?.totalJobs?.map((booking: { status: string; }) => booking?.status == "COMPLETED")
            .length || 0}
          <Box
            component="span"
            sx={{ color: "text.secondary", typography: "body2" }}
          >
            Total jobs complete
          </Box>
        </Stack>

        <Stack width={1}>
          {info?.totalJobs?.length || 0}
          <Box
            component="span"
            sx={{ color: "text.secondary", typography: "body2" }}
          >
            Total Jobs
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="Bio" />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Box sx={{ typography: "body2" }}>{info?.bio}</Box>
        <Box sx={{ typography: "body2" }}>{`Hobby: ${info?.hobby}`}</Box>
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
        {legalInfoData?.map((cur, i) => (
          <Stack
            direction="row"
            alignItems="center"
            key={i}
            justifyContent="space-between"
          >
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 150, flexShrink: 0 }}
            >
              {cur?.name}
            </Box>
            {cur?.value}
          </Stack>
        ))}
      </Stack>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Stack spacing={3}>
          {jobStatus}
          {renderAbout}
          {doc}
        </Stack>
      </Grid>

      <Grid xs={12} md={8}>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <DriverWidget
                title="Current balance"
                total={info?.userInfo?.wallet?.balance}
                sx={{
                  ...bgGradient({
                    direction: "135deg",
                    startColor: alpha(theme.palette["primary"].light, 0.2),
                    endColor: alpha(theme.palette["primary"].main, 0.2),
                  }),
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <DriverWidget
                title="Deposit Amount"
                total={info?.depositAmount}
                sx={{
                  ...bgGradient({
                    direction: "135deg",
                    startColor: alpha(theme.palette["success"].light, 0.2),
                    endColor: alpha(theme.palette["success"].main, 0.2),
                  }),
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid xs={12} md={12}>
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
      </Grid>
    </Grid>
  );
}
