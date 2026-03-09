import React from "react";
import { DataTable } from "./table/DataTable";
import { columns } from "./table/WithDrawelRequestColumns";
import { WithdrawRequests } from "@prisma/client";

const WithDrawelList = ({ withDrawelList }: { withDrawelList: WithdrawRequests[] }) => {
  return <DataTable data={withDrawelList} columns={columns} />;
};

export default WithDrawelList;
