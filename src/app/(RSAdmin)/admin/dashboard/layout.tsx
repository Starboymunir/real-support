"use client";

import { ReactNodeLike } from "prop-types";
import DashboardLayout from "@/app/(RSAdmin)/admin/layouts/dashboard";
import { useAuthContext } from "@/providers/auth-providers";
import { redirect } from "next/navigation";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";

export default function Layout({ children }: { children: ReactNodeLike }) {
  const { user, loading} = useAuthContext();

  if (loading) return <LoadingScreen sx={{}} />;

  // if (!user || !company) return redirect("/login");
  // console.log("user from context:", user);
  // console.log("user.Admin:", user?.Admin);

  if (!user?.Admin) return redirect("/");

  return <DashboardLayout>{children}</DashboardLayout>;
}
