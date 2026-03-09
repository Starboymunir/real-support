
import DriverProfileView from "../_components/view/drivers-profile-view";

const DriverDetails = async (props: any) => {
  const params = await props.params;
  const { id } = params;

  return <DriverProfileView id={id} />;
};

export default DriverDetails;
