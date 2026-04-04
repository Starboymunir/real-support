"use client";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  Grid,
  IconButton,
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
import { resolveS3Url } from '@/lib/api';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const safeDocumentsList = documentsList ?? {};

  useEffect(() => {
    if (info) {
      const detail = info?.[documentTitle]?.details;

      let approveStatus = detail?.isVerified
        ? "Approved"
        : !detail?.isVerified && !detail?.isReturned
        ? "Pending"
        : "Rejected";
      setStatus(approveStatus);
    }
  }, [info?.id, documentTitle]);

  const acceptDocument = async (documentType: string) => {
    setIsAccepting(true);
    try {
      await carDocumentApprovalOrRejection(info.id, documentType, true);
      setStatus("Approved");
      enqueueSnackbar("Document approved successfully");
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
      enqueueSnackbar("Document rejected successfully");
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
            {Object.keys(safeDocumentsList).map((document, i) => {
              const fileKey = safeDocumentsList[document];
              const extension = fileKey?.split(".").pop()?.toLowerCase();
              const isImage = fileKey && !["pdf", "heic", "heif"].includes(extension || "");
              const resolved = resolveS3Url(fileKey);

              return (
                <Grid
                  key={i}
                  sm={12}
                  mx={2}
                  md={5}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    my: 2,
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {document?.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase())}
                  </Typography>
                  <DocumentRenderer
                    width={350}
                    height={250}
                    alt={document}
                    fileKey={fileKey || ""}
                    onClick={
                      isImage && resolved
                        ? () => setPreviewUrl(resolved)
                        : resolved
                        ? () => window.open(resolved, "_blank")
                        : undefined
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </Stack>

        {/* Image preview dialog */}
        <Dialog
          open={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
          maxWidth="lg"
          PaperProps={{
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
              position: "relative",
            },
          }}
        >
          <IconButton
            onClick={() => setPreviewUrl(null)}
            sx={{
              position: "absolute",
              top: -40,
              right: -10,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              zIndex: 1,
            }}
          >
            <Iconify icon="carbon:close" />
          </IconButton>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Document Preview"
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
        </Dialog>
      </AccordionDetails>
    </Accordion>
  );
};

export default AccordionDocument;
