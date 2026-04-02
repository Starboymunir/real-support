import React from "react";
import { DataTable } from "./table/DataTable";
import { columns } from "./table/PaymentRequestSendColumns";
import { columns as ReceiverColumns } from "./table/PaymentRequestsReceiveColumns";
import { PaymentRequests } from "@/lib/types";

const PaymentRequestList = ({ requests = [], isSenderList }: { requests:PaymentRequests[] | undefined , isSenderList: boolean | null | undefined }) => {
  return <DataTable data={requests} columns={isSenderList ? columns : ReceiverColumns} />;
};

export default PaymentRequestList;
