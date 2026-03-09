import DriverSummaryListView from "../_components/view/driver-work-summary-list-view";

const Page = async (props: any) => {
  const params = await props.params;
  const { driverId } = params;
  return <DriverSummaryListView driverId={driverId} />;
};

export default Page;
