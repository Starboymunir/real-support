"use client";
import { Container } from "@mui/material";
import PackagesNewEditForm from "../packages-new-edit-form";
import CustomBreadcrumbs from "../../../../common/custom-breadcrumbs";
import { useSettingsContext } from "../../../../common/settings";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

export default function PackageCreateView() {
  return (
    <Container>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "Package",
            href: paths.dashboard.packages.root,
          },
          { name: "Create" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PackagesNewEditForm />
    </Container>
  );
}
