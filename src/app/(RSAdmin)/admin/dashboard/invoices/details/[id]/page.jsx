"use client";
import React, { use } from "react";
import BookingDetails from "../../_components/booking-details";

const page = (props) => {
  const params = use(props.params);
  const { id } = params;

  return <BookingDetails id={id} />;
};

export default page;
