"use client";
import { Container } from "@mui/material";
import DiscountCouponsNewEditForm from "../discount-coupons-new-edit-form";
import CustomBreadcrumbs from "../../../../common/custom-breadcrumbs";
import { useSettingsContext } from "../../../../common/settings";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

export default function DiscountCouponsCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "Discount Coupons",
            href: paths.dashboard.discountCoupons.root,
          },
          { name: "Create" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DiscountCouponsNewEditForm />
    </Container>
  );
}
