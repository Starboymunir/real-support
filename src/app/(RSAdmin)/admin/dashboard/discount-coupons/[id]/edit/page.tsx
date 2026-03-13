import DiscountCouponEditView from "../../_components/view/discount-coupons-edit-view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Discount Coupons Edit",
};

interface DiscountCouponsEditPageParams {
  id: string;
}

interface DiscountCouponsEditPageProps {
  params: Promise<DiscountCouponsEditPageParams>;
}

export default async function DiscountCouponsEditPage(props: DiscountCouponsEditPageProps) {
  const params = await props.params;
  const { id } = params;

  return <DiscountCouponEditView id={id} />;
}
