"use client";

import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import CompanyNewEditForm from "../../companies/_components/company-new-edit-form";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useCompanyQuery } from "@/hooks/Company";
import { useAuth } from "@/lib/auth-context";
import axiosInstance from "@/lib/admin-axios";

interface UpdateRequest {
  id: string;
  status: "PENDING" | "PROCESSED" | "REJECTED";
  changes: Record<string, any>;
  reviewNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export default function MyCompanyView() {
  const settings = useSettingsContext();
  const { admin } = useAuth();
  const queryClient = useQueryClient();
  const companyId =
    (admin as any)?.companyId || (admin as any)?.company?.id || "";

  const { data: company, isLoading } = useCompanyQuery(companyId);

  const { data: requests = [] } = useQuery<UpdateRequest[]>({
    queryKey: ["my_company_update_requests"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/company/update-requests`);
      return data?.data || [];
    },
    enabled: !!companyId,
  });

  const pendingRequest = requests.find((r) => r.status === "PENDING");
  const lastReviewed = requests.find((r) => r.status !== "PENDING");

  if (!companyId) {
    return (
      <Container maxWidth={settings.themeStretch ? false : "xl"}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Your account is not linked to a company. Please contact a system
          administrator.
        </Alert>
      </Container>
    );
  }

  if (isLoading) return <LoadingScreen sx={{}} />;

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="My Company"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: company?.companyName || "Company" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Alert severity="info">
          Changes you submit here are reviewed and approved by a system
          administrator before they take effect.
        </Alert>
        {pendingRequest && (
          <Alert severity="warning">
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              You have a pending update request awaiting approval.
            </Typography>
            <Box sx={{ fontSize: 12, opacity: 0.8 }}>
              Submitted on{" "}
              {new Date(pendingRequest.createdAt).toLocaleString()}. Submitting
              again will replace it.
            </Box>
          </Alert>
        )}
        {!pendingRequest && lastReviewed && (
          <Alert
            severity={lastReviewed.status === "PROCESSED" ? "success" : "error"}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Last update request was{" "}
              {lastReviewed.status === "PROCESSED" ? "approved" : "rejected"}.
            </Typography>
            {lastReviewed.reviewNote && (
              <Box sx={{ fontSize: 12, opacity: 0.8 }}>
                Note: {lastReviewed.reviewNote}
              </Box>
            )}
          </Alert>
        )}
      </Stack>

      <CompanyNewEditForm
        currentCompany={company as any}
        submitMode="request"
        onRequestSubmitted={() => {
          queryClient.invalidateQueries({
            queryKey: ["my_company_update_requests"],
          });
        }}
      />
    </Container>
  );
}
