import { PassengerProfileView } from "../_components/view";

const PassengerDetails = async (props: any) => {
  const params = await props.params;
  const { id } = params;

  return (
    <div>
      <PassengerProfileView id={id} />
    </div>
  );
};

export default PassengerDetails;
