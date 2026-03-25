import AdminChatView from "./_components/AdminChatView";
import Loader from "@/components/loader";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AdminChatView />
    </Suspense>
  );
}
