"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import SuperAdminDashboard from "./super-admin-dashboard";
import AdminDashboard from "./admin-dashboard";
import CompanyAdminDashboard from "./company-admin-dashboard";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

const OverviewAppView = () => {
  const { admin } = useAuth();
  const role = admin?.role;

  if (role === "ADMIN") return <AdminDashboard />;
  return <SuperAdminDashboard />;
};

export default OverviewAppView;
