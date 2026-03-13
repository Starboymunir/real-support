import { Suspense } from "react";
import PrivacyPolicy from "../_components/PrivacyPolicy";
import Loader from "@/components/loader";

const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <PrivacyPolicy />
    </Suspense>
  );
};

export default Page;
