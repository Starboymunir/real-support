import React from "react";
import BookingDetails from "../../_components/booking-details";

const page = async (props: any) => {
  const params = await props.params;
  const { id } = params;

  return <BookingDetails id={id} />;
};

export default page;
