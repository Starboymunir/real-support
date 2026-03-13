import BookingEditView from "../../_components/view/booking-edit-view";

export const metadata = {
  title: "Dashboard: Edit a booking request",
};

export default async function BookingEditsPage(props) {
  const params = await props.params;
  const { id } = params;

  return <BookingEditView id={id}/>;
}
