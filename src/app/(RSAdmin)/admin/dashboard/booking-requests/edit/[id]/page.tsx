import BookingRequestEditView from "../../_components/view/booking-edit-view";

export const metadata = {
  title: "Dashboard: Edit a booking request",
};

const BookingEditsPage = async (props: any) => {
  const params = await props.params;
  const { id } = params;
  return <BookingRequestEditView id={id} />;
};

export default BookingEditsPage;
