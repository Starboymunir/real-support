"use client";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import DocumentRenderer from "../../../_components/document-renderer";
import { enqueueSnackbar } from "notistack";
import { carDocumentApprovalOrRejection } from "@/server/Document";
import Iconify from "@/components/iconify/iconify";
import Label from "@/app/(RSAdmin)/admin/common/label";

interface AccordionDocumentProps {
  name: string;
  expanded: boolean;
  documentTitle: string;
  documentsList: any;
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleForEdit: (data: { documentsList: any; documentTitle: string }) => void;
  info: any;
}

const AccordionDocument = ({
  name,
  expanded,
  documentTitle,
  documentsList,
  handleChange,
  handleForEdit,
  info,
}: AccordionDocumentProps) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (info) {
      const detail = info[documentTitle]?.details;

      let approveStatus = detail?.isVerified
        ? "Approved"
        : !detail?.isVerified && !detail?.isReturned
        ? "Pending"
        : "Rejected";
      setStatus(approveStatus);
    }
  }, [info?.id]);

  const acceptDocument = async (documentType: string) => {
    setIsAccepting(true);
    try {
      await carDocumentApprovalOrRejection(info.id, documentType, true);
      setStatus("Approved");
      enqueueSnackbar("Approve Document Successfully");
    } catch (error: any) {
      console.log("error ", error);
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsAccepting(false);
    }
  };

  const rejectDocument = async (documentType: string) => {
    setIsRejecting(true);
    try {
      await carDocumentApprovalOrRejection(info.id, documentType, false);
      setStatus("Rejected");
      enqueueSnackbar("Reject Document Successfully");
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange(name)}>
      <AccordionSummary
        expandIcon={<GridExpandMoreIcon />}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
      >
        <Typography sx={{ width: "33%", flexShrink: 0 }}>
          {name}
          {"    "}
          <Label
            variant="soft"
            color={
              (status === "Approved" && "success") ||
              (status === "Pending" && "warning") ||
              (status === "Rejected" && "error") ||
              "default"
            }
          >
            {status}
          </Label>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack sx={{ py: 1 }}>
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            mb={10}
            gap={1}
          >
            <Button
              variant="contained"
              onClick={() => handleForEdit({ documentsList, documentTitle })}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
            <LoadingButton
              loading={isAccepting}
              color="success"
              variant="contained"
              disabled={status == "Approved"}
              onClick={() => acceptDocument(documentTitle)}
            >
              Approve
            </LoadingButton>
            <LoadingButton
              loading={isRejecting}
              disabled={status == "Rejected"}
              color="error"
              variant="contained"
              onClick={() => rejectDocument(documentTitle)}
            >
              Reject
            </LoadingButton>
          </Stack>
          <Grid container spacing={2}>
            {Object.keys(documentsList).map((document, i) => (
              <Grid
                key={i}
                sm={12}
                mx={2}
                md={5}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  my: 5,
                  gap: 2,
                }}
              >
                <Typography variant="h6">{document?.toUpperCase()}</Typography>
                <DocumentRenderer
                  width={400}
                  height={300}
                  alt={document}
                  src={documentsList[document]}
                  fileKey={documentsList[document]}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default AccordionDocument;
