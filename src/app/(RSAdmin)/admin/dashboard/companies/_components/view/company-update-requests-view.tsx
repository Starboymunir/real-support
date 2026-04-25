"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";

import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import axiosInstance from "@/lib/admin-axios";

interface UpdateRequest {
  id: string;
  status: "PENDING" | "PROCESSED" | "REJECTED";
  changes: Record<string, any>;
  reviewNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  companyInfo?: { id: string; companyName: string; companyEmail: string };
  requestedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "", label: "All" },
];

function formatValue(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

export default function CompanyUpdateRequestsView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("PENDING");
  const [reviewing, setReviewing] = useState<{
    request: UpdateRequest;
    action: "approve" | "reject";
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const { data: requests = [], isLoading } = useQuery<UpdateRequest[]>({
    queryKey: ["company_update_requests", status],
    queryFn: async () => {
      const url = status
        ? `/company/update-requests?status=${status}`
        : `/company/update-requests`;
      const { data } = await axiosInstance.get(url);
      return data?.data || [];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "approve" | "reject";
      note?: string;
    }) => {
      const { data } = await axiosInstance.patch(
        `/company/update-requests/${id}/${action}`,
        { reviewNote: note },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      enqueueSnackbar(
        variables.action === "approve"
          ? "Request approved and applied"
          : "Request rejected",
      );
      queryClient.invalidateQueries({ queryKey: ["company_update_requests"] });
      queryClient.invalidateQueries({ queryKey: ["all_companies"] });
      setReviewing(null);
      setReviewNote("");
    },
    onError: (e: any) => {
      enqueueSnackbar(
        e?.response?.data?.message || e?.message || "Action failed",
        { variant: "error" },
      );
    },
  });

  const sorted = useMemo(
    () =>
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [requests],
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="Company Update Requests"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Companies", href: paths.dashboard.companies.list },
          { name: "Update Requests" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={status}
          onChange={(_e, v) => setStatus(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
        >
          {STATUS_TABS.map((t) => (
            <Tab key={t.value || "all"} value={t.value} label={t.label} />
          ))}
        </Tabs>
      </Card>

      {isLoading ? (
        <LoadingScreen sx={{}} />
      ) : sorted.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No requests found.</Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sorted.map((r) => (
            <Card key={r.id} sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ md: "flex-start" }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">
                      {r.companyInfo?.companyName || "—"}
                    </Typography>
                    <Chip
                      size="small"
                      label={r.status}
                      color={
                        r.status === "PENDING"
                          ? "warning"
                          : r.status === "PROCESSED"
                            ? "success"
                            : "error"
                      }
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Submitted by{" "}
                    {r.requestedBy
                      ? `${r.requestedBy.firstName || ""} ${r.requestedBy.lastName || ""}`.trim() ||
                        r.requestedBy.email
                      : "—"}{" "}
                    on {new Date(r.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {r.status === "PENDING" && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setReviewing({ request: r, action: "approve" })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setReviewing({ request: r, action: "reject" })}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Proposed changes
              </Typography>
              <Stack spacing={1}>
                {Object.entries(r.changes || {}).map(([k, v]) => (
                  <Box
                    key={k}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
                      gap: 1,
                      p: 1.5,
                      bgcolor: "background.neutral",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {k}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {formatValue(v)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {r.reviewNote && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reviewer note: {r.reviewNote}
                  </Typography>
                </Box>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={!!reviewing}
        onClose={() => {
          if (!reviewMutation.isPending) {
            setReviewing(null);
            setReviewNote("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {reviewing?.action === "approve" ? "Approve" : "Reject"} update request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {reviewing?.action === "approve"
              ? "Approving will apply the proposed changes immediately."
              : "Rejecting will mark the request as rejected. Optionally provide a reason."}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Note (optional)"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReviewing(null);
              setReviewNote("");
            }}
            disabled={reviewMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewing?.action === "approve" ? "success" : "error"}
            disabled={reviewMutation.isPending}
            onClick={() => {
              if (!reviewing) return;
              reviewMutation.mutate({
                id: reviewing.request.id,
                action: reviewing.action,
                note: reviewNote || undefined,
              });
            }}
          >
            {reviewing?.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
