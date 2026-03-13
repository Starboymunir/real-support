"use client";

import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { Suspense } from "react";

const CompanyLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingScreen sx={{}} />}> {children}</Suspense>;
};

export default CompanyLayout;
