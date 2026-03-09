"use client";
// @mui
import Container from "@mui/material/Container";
// components
//
import CompanyNewEditForm from "../company-new-edit-form";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useCompanyQuery } from "@/hooks/Company";

export default function CompanyEditView({ id }) {
  const settings = useSettingsContext();
  const { data: company, isLoading } = useCompanyQuery(id);

  console.log("company info ----", company);

  return (
    <>
      {isLoading ? (
        <LoadingScreen sx={{}} />
      ) : (
        <Container maxWidth={settings.themeStretch ? false : "xl"}>
          <CustomBreadcrumbs
            heading="Edit"
            links={[
              {
                name: "Dashboard",
                href: paths.dashboard.root,
              },
              {
                name: "Company",
                href: paths.dashboard.companies.root,
              },
              { name: company?.companyName },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <CompanyNewEditForm currentCompany={company} />
        </Container>
      )}
    </>
  );
}
