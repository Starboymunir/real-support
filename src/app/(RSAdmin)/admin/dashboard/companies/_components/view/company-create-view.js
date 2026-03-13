"use client";
import { Container } from "@mui/material";
import CompanyNewEditForm from "../company-new-edit-form";
import CustomBreadcrumbs from "../../../../common/custom-breadcrumbs";
import { useSettingsContext } from "../../../../common/settings";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

export default function CompanyCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="Create New Company"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "Companies",
            href: paths.dashboard.companies.root,
          },
          { name: "Create" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CompanyNewEditForm />
    </Container>
  );
}
