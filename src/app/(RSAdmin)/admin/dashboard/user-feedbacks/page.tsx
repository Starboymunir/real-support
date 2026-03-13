import Loader from "@/components/loader";
import { Suspense } from "react";
import FeedbackList from "./_components/list-view";

export default function UserFeedbacksPage() {
  return (
    <Suspense fallback={<Loader />}>
      <FeedbackList />
    </Suspense>
  );
}
