"use client";

import React, { useEffect, useMemo } from "react";
import { DataTable } from "./table/DataTable";
import { columns } from "./table/Columns";
import { useSocket } from "@/providers/SocketProvider";
import { SOCKET_EVENT_ENUM } from "@/helpers/constants";
import { ITransaction } from "@/types/type";

const TransactionList = ({
  transactions,
  refetch,
}: {
  transactions: ITransaction[];
  refetch: () => void;
}) => {
  const { socket } = useSocket();

  // ✅ Memoized formatting (avoids re-calculating on every render)
  const formattedTransactions = useMemo(
    () =>
      transactions?.map((t) => ({
        ...t,
        senderName: t?.senderInfo
          ? `${t.senderInfo.firstName} ${t.senderInfo.lastName}`.trim()
          : "-",
        receiverName: t?.receiverInfo
          ? `${t.receiverInfo.firstName} ${t.receiverInfo.lastName}`.trim()
          : "-",
        senderEmail: t?.senderInfo?.emailAddress || "-",
        receiverEmail: t?.receiverInfo?.emailAddress || "-",
      })) || [],
    [transactions]
  );

  useEffect(() => {
    if (!socket) return;

    const handleWithdrawalProcessed = () => refetch();

    socket.on(
      SOCKET_EVENT_ENUM.WITHDRAWAL.WITHDRAWAL_PROCESSED,
      handleWithdrawalProcessed
    );

    return () => {
      socket.off(
        SOCKET_EVENT_ENUM.WITHDRAWAL.WITHDRAWAL_PROCESSED,
        handleWithdrawalProcessed
      );
    };
  }, [socket, refetch]);

  return <DataTable data={formattedTransactions} columns={columns} />;
};

export default TransactionList;
