"use client";

import Loader from "@/components/loader";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useAuthContext } from "@/providers/auth-providers";
import { redirect } from "next/navigation";

const CompanyGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, company } = useAuthContext();

  if (loading) {
    return <Loader />;
  } else if (!loading && !company) {
    redirect("/company-login");
  } else {
    return (
      <MaxWidthWrapper>
        {company?.status !== "ACTIVE" && (
          <div
            id="alert-border-2"
            className="flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="ms-3 text-sm font-medium">
              Your Company Profile is {company?.status}
            </div>
          </div>
        )}

        {children}
      </MaxWidthWrapper>
    );
  }
};

export default CompanyGuard;
