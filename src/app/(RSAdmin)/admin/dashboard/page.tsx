// sections
import { Suspense } from "react";
import Loader from "@/components/loader";
import OverviewAppView from "./_components/view/overview-app-view";
// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Home",
};

export default async function OverviewAppPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OverviewAppView />
    </Suspense>
  );
}
