"use client";

import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useRouter } from "@/app/(RSAdmin)/admin/routes/hook";
import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import Label from "@/app/(RSAdmin)/admin/common/label";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { useCompanyQuery, useCompanyWalletQuery } from "@/hooks/Company";

export default function CompanyProfileView({ id }: { id: string }) {
  const { data, isLoading } = useCompanyQuery(id);
  const { data: walletData } = useCompanyWalletQuery(id);
  const company: any = data;
  const router = useRouter();

  if (isLoading) return <LoadingScreen />;
  if (!company) return null;

  const address = company.companyAddress;
  const contactPerson = company.userInfo;
  const fullAddress = address
    ? [address.houseNumber, address.streetName, address.city, address.postCode]
        .filter(Boolean)
        .join(", ")
    : "—";

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={company.companyName || "Company"}
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Companies", href: paths.dashboard.companies.root },
          { name: company.companyName || "Details" },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => router.push(paths.dashboard.companies.edit(id))}
          >
            Edit
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Header Card */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "flex-start" },
          gap: 3,
        }}
      >
        <AwsImageAvatar
          imageKey={company.coverImage}
          alt={company.companyName}
          sx={{
            width: 96,
            height: 96,
            fontSize: 40,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        />
        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5, justifyContent: { xs: "center", md: "flex-start" } }}>
            <Typography variant="h4">{company.companyName}</Typography>
            <Label
              variant="soft"
              color={
                (company.status === "ACTIVE" && "success") ||
                (company.status === "PENDING" && "warning") ||
                (company.status === "ONHOLD" && "info") ||
                (company.status === "SUSPEND" && "error") ||
                "default"
              }
            >
              {company.status}
            </Label>
          </Stack>
          {company.description && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {company.description}
            </Typography>
          )}
          {company.companyCode && (
            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontFamily: "monospace",
                color: "primary.main",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              Company ID: {company.companyCode}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={3}
            sx={{ mt: 1.5, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:letter-bold" width={18} sx={{ color: "text.disabled" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {company.companyEmail}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:phone-bold" width={18} sx={{ color: "text.disabled" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {company.phone_number || "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:map-point-bold" width={18} sx={{ color: "text.disabled" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {fullAddress}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Contact Person Card */}
            <Card>
              <CardHeader title="Contact Person" />
              {contactPerson ? (
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AwsImageAvatar
                      imageKey={contactPerson.coverImage || contactPerson.profileImageUrl}
                      alt={contactPerson.firstName}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {contactPerson.firstName} {contactPerson.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {contactPerson.role?.replace("_", " ")}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <InfoRow icon="solar:letter-bold" label="Email" value={contactPerson.email} />
                  <InfoRow icon="solar:phone-bold" label="Phone" value={contactPerson.phone_number} />
                </Stack>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No contact person assigned
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Created Date */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <InfoRow
                  icon="solar:calendar-bold"
                  label="Created"
                  value={new Date(company.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  icon="solar:calendar-bold"
                  label="Updated"
                  value={new Date(company.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Registration Details */}
            <Card>
              <CardHeader title="Registration & Licensing" />
              <Stack spacing={2} sx={{ p: 3 }}>
                <InfoRow
                  icon="mdi:file-document-outline"
                  label="HMRC Registration"
                  value={company.HMRC_RegistrationNumber}
                />
                <InfoRow
                  icon="mdi:file-document-outline"
                  label="VAT Registration"
                  value={company.VAT_RegistrationNumber}
                />
                <Divider />
                <InfoRow
                  icon="mdi:card-account-details-outline"
                  label="PCO Operator License"
                  value={company.PCO_OperatorLicenseNumber}
                />
                <InfoRow
                  icon="solar:calendar-bold"
                  label="PCO Issue Date"
                  value={
                    company.PCO_OperatorLicenseIssueDate
                      ? new Date(company.PCO_OperatorLicenseIssueDate).toLocaleDateString("en-GB")
                      : null
                  }
                />
                <InfoRow
                  icon="solar:calendar-bold"
                  label="PCO Expiry Date"
                  value={
                    company.PCO_OperatorLicenseExpiryDate
                      ? new Date(company.PCO_OperatorLicenseExpiryDate).toLocaleDateString("en-GB")
                      : null
                  }
                />
              </Stack>
            </Card>

            {/* Address */}
            {address && (
              <Card>
                <CardHeader title="Address" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <InfoRow icon="mdi:home-outline" label="House/Building" value={address.houseNumber} />
                  <InfoRow icon="mdi:road" label="Street" value={address.streetName} />
                  <InfoRow icon="mdi:city" label="City" value={address.city} />
                  <InfoRow icon="mdi:mailbox" label="Postcode" value={address.postCode} />
                </Stack>
              </Card>
            )}

            {/* Company Wallet */}
            {walletData && (
              <Card>
                <CardHeader title="Company Wallet" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "text.secondary" }}>
                      Wallet Balance
                    </Typography>
                    <Typography variant="h3" sx={{ color: "primary.main", mt: 0.5 }}>
                      £{(walletData.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Divider />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 1.5, bgcolor: "success.lighter" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Revenue</Typography>
                        <Typography variant="h6" sx={{ color: "success.dark" }}>
                          £{(walletData.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 1.5, bgcolor: "info.lighter" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Profit</Typography>
                        <Typography variant="h6" sx={{ color: "info.dark" }}>
                          £{(walletData.totalProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 1.5, bgcolor: "warning.lighter" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Commission</Typography>
                        <Typography variant="h6" sx={{ color: "warning.dark" }}>
                          £{(walletData.totalCommission ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 1.5, bgcolor: "grey.100" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Bookings</Typography>
                        <Typography variant="h6">{walletData.totalBookings ?? 0}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider />
                  <InfoRow icon="mdi:cash" label="Cash Collected" value={`£${(walletData.totalCashCollected ?? 0).toFixed(2)}`} />
                  <InfoRow icon="mdi:wallet" label="Wallet Collected" value={`£${(walletData.totalWalletCollected ?? 0).toFixed(2)}`} />
                  <InfoRow icon="mdi:account-group" label="Active Drivers" value={String(walletData.totalDrivers ?? 0)} />
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | null;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Iconify icon={icon} width={20} sx={{ color: "text.disabled", flexShrink: 0 }} />
      <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 120, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Stack>
  );
}
