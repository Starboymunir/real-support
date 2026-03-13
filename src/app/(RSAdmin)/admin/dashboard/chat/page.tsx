import UserChatWindow from "@/components/chat/UserChatWindow";
import Loader from "@/components/loader";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <Suspense fallback={<Loader />}>
      <UserChatWindow />
    </Suspense>
  );
}
