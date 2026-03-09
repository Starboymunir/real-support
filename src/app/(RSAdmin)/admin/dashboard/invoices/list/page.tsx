import { Suspense } from "react";
import { InvoiceListView } from "../_components/view";
import Loader from "@/components/loader";

export default function InvoiceListPage() {
  return (
    <Suspense fallback={<Loader />}>
      <InvoiceListView />
    </Suspense>
  );
}
