"use client";

import Container from "@mui/material/Container";
import DiscountCouponsNewEditForm from "../discount-coupons-new-edit-form";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useGetDiscountCouponById } from "@/hooks/Coupons";

export default function DiscountCouponsEditView({ id }: { id: string }) {
  const { data: currentCoupon, isPending } = useGetDiscountCouponById(id);

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth="xl">
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
              { name: currentCoupon?.coupon ?? "" },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          {currentCoupon && (
            <DiscountCouponsNewEditForm currentCoupon={currentCoupon} />
          )}
        </Container>
      )}
    </>
  );
}
