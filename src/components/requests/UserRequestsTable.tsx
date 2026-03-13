import React from "react";
import { DataTable } from "./table/DataTable";
import { columns } from "./table/cartColumns";
import { IRequestType } from "@/types/type";

const UserRequestTable = ({ requests }: { requests: IRequestType[] }) => {
  return <DataTable data={requests} columns={columns} />;
};

export default UserRequestTable;
