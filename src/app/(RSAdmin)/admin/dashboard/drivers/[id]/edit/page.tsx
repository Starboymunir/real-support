import DriversEditView from "../../_components/view/drivers-edit-view";

export const metadata = {
  title: "Dashboard: Driver Edit",
};

export default async function DriverEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  return <DriversEditView id={id} />;
}
