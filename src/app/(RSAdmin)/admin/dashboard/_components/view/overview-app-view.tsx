"use client";

import { useAuth } from "@/lib/auth-context";
import SuperAdminDashboard from "./super-admin-dashboard";
import AdminDashboard from "./admin-dashboard";
import CompanyAdminDashboard from "./company-admin-dashboard";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

const OverviewAppView = () => {
  const { user } = useAuth();
  const role = user?.Admin?.role;

  if (role === "COMPANY_ADMIN") return <CompanyAdminDashboard />;
  if (role === "ADMIN") return <AdminDashboard />;
  return <SuperAdminDashboard />;
};

export default OverviewAppView;
