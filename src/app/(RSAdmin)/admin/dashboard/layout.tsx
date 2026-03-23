"use client";

import { ReactNodeLike } from "prop-types";
import DashboardLayout from "@/app/(RSAdmin)/admin/layouts/dashboard";
import { useAuth } from "@/lib/auth-context";
import { redirect } from "next/navigation";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";

export default function Layout({ children }: { children: ReactNodeLike }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen sx={{}} />;

  if (!user?.Admin) return redirect("/admin/login");

  return <DashboardLayout>{children}</DashboardLayout>;
}
