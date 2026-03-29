"use client";

import { ReactNodeLike } from "prop-types";
import DashboardLayout from "@/app/(RSAdmin)/admin/layouts/dashboard";
import { AuthGuard } from "@/app/(RSAdmin)/admin/auth/guard";

export default function Layout({ children }: { children: ReactNodeLike }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
