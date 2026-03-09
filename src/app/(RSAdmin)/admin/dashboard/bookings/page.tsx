import { Suspense } from "react";
import { BookingListView } from "./_components/view";
import Loader from "@/components/loader";

export default function BookingListPage() {
  return (
    <Suspense fallback={<Loader />}>
      <BookingListView />
    </Suspense>
  );
}
