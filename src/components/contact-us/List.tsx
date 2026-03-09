"use client";

import { DataTable } from "./table/DataTable";
import { columns } from "./table/Columns";
import { useUserFeedbacksQuery } from "@/hooks/ContactUs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";

const ContactList = () => {
  const { data: feedbacks = [], isPending } = useUserFeedbacksQuery();
  if (isPending) {
    return <LoadingScreen />;
  }

  console.log("feedbacks", feedbacks);
  

  return <DataTable data={feedbacks} columns={columns} />;
};

export default ContactList;
