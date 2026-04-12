"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";
import Label from "@/app/(RSAdmin)/admin/common/label";
import Iconify from "@/components/iconify/iconify";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { formatToLocalDate } from "@/lib/utils";
import { resolveS3Url } from "@/lib/api";
import { useState } from "react";

interface BankAccountRow {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  document?: string;
  isDefault: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    coverImage?: string;
  };
}

interface BankAccountDetailDialogProps {
  open: boolean;
  onClose: VoidFunction;
  account: BankAccountRow | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}

export default function BankAccountDetailDialog({
  open,
  onClose,
  account,
  onApprove,
  onReject,
}: BankAccountDetailDialogProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!account) return null;

  const docUrl = account.document ? resolveS3Url(account.document) : null;
  const docExt = account.document?.split(".").pop()?.toLowerCase();
  const isImage = docUrl && !["pdf", "heic", "heif"].includes(docExt || "");

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(account.id);
      onClose();
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(account.id);
      onClose();
    } finally {
      setRejecting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Bank Account Details
          <IconButton onClick={onClose} size="small">
            <Iconify icon="carbon:close" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* User Info */}
            {account.user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AwsImageAvatar
                  imageKey={account.user.coverImage}
                  alt={account.user.firstName}
                  width={48}
                  height={48}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {account.user.firstName} {account.user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {account.user.emailAddress}
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Bank Details */}
            <Stack spacing={1.5}>
              <InfoRow label="Bank Name" value={account.bankName} />
              <InfoRow label="Account Name" value={account.accountName} />
              <InfoRow label="Account Number" value={account.accountNumber} />
              <InfoRow label="Sort Code" value={account.sortCode} />
              <InfoRow
                label="Default"
                value={
                  account.isDefault ? (
                    <Label variant="soft" color="info">Default</Label>
                  ) : (
                    "No"
                  )
                }
              />
              <InfoRow
                label="Status"
                value={
                  <Label
                    variant="soft"
                    color={
                      (account.status === "ACTIVE" && "success") ||
                      (account.status === "PENDING" && "warning") ||
                      (account.status === "REJECTED" && "error") ||
                      "default"
                    }
                  >
                    {account.status?.toLowerCase()}
                  </Label>
                }
              />
              <InfoRow label="Created" value={formatToLocalDate(account.createdAt, { withTime: true })} />
            </Stack>

            <Divider />

            {/* Proof Document */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Proof Document
              </Typography>
              {docUrl ? (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    overflow: "hidden",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    cursor: "pointer",
                  }}
                  onClick={() => isImage ? setPreviewOpen(true) : window.open(docUrl, "_blank")}
                >
                  {isImage ? (
                    <Box
                      component="img"
                      src={docUrl}
                      alt="Bank proof document"
                      sx={{ width: "100%", maxHeight: 300, objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ p: 2, bgcolor: "background.neutral" }}
                    >
                      <Iconify icon="solar:document-bold" width={32} />
                      <Box>
                        <Typography variant="subtitle2">View Document</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {docExt?.toUpperCase()} file — click to open
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 1.5,
                    bgcolor: "background.neutral",
                    textAlign: "center",
                  }}
                >
                  <Iconify icon="solar:gallery-remove-bold-duotone" width={40} sx={{ color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No document uploaded
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {account.status !== "REJECTED" && (
            <LoadingButton
              loading={rejecting}
              variant="contained"
              color="error"
              onClick={handleReject}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
            >
              Reject
            </LoadingButton>
          )}
          {account.status !== "ACTIVE" && (
            <LoadingButton
              loading={approving}
              variant="contained"
              color="success"
              onClick={handleApprove}
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            >
              Approve
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Full-size image preview */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        PaperProps={{
          sx: { bgcolor: "transparent", boxShadow: "none", overflow: "visible", position: "relative" },
        }}
      >
        <IconButton
          onClick={() => setPreviewOpen(false)}
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
        {docUrl && (
          <img
            src={docUrl}
            alt="Bank proof document"
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
          />
        )}
      </Dialog>
    </>
  );
}
