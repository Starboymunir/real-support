import CompanyEditView from "../../_components/view/company-edit-view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Company Edit",
};

export default async function CompanyEditPage(props: any) {
  const params = await props.params;
  const { id } = params;

  return <CompanyEditView id={id} />;
}
