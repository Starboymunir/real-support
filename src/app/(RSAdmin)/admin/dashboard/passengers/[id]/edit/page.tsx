import PassengerEditView from "../../_components/view/passengers-edit-view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Passenger Edit",
};

type PassengerEditPageProps = {
  params: {
    id: string;
  };
};


export default async function PassengerEditPage(props: any) {
  const params = await props.params;
  const { id } = params;
  console.log('Passenger edit page is loading as server side component', id);

  return <PassengerEditView id={id} />;
}