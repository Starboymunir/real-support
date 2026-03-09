"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "./_components/Sidebar";
import CompanyInfo from "./_components/CompanyInfo";
import DriversList from "./_components/DriversList";
import SendEmailPage from "./_components/SendEmailPage";
import { CompanyData, Driver } from "./types";
import { useAuthContext } from "@/providers/auth-providers";
import axiosInstance from "@/lib/axios";
import { signOut } from "aws-amplify/auth";

const CompanyDashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "drivers" | "mail">(
    "dashboard"
  ); // Add mail tab
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { company, companyId, setCompany, reload, setReload } =
    useAuthContext();

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API;

  // Fetch company and drivers data on page load
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const driversResponse = await axiosInstance.get(
          `/drivers/getDriverByCompanyId/${companyId}`
        );

        if (driversResponse.data.success) {
          const mappedDrivers: Driver[] = driversResponse.data.data.map(
            (driver: any) => ({
              id: driver.id,
              name: `${driver.driverInfo.userInfo.firstName} ${driver.driverInfo.userInfo.lastName}`,
              phoneNumber: driver.driverInfo.userInfo.phone_number || "N/A",
              email: driver.driverInfo.userInfo.emailAddress || "N/A",
              status: driver.status || "N/A",
            })
          );
          setDrivers(mappedDrivers);
          console.log("Drivers fetched:", mappedDrivers);
        } else {
          console.log("Failed to fetch drivers:", driversResponse.data);
        }
      } catch (error) {
        console.log("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([fetchDrivers()]);
  }, [router]);

  // Update company info
  const handleUpdateCompany = async (updatedData: Partial<CompanyData>) => {
    if (!companyId) return;

    try {
      const response = await axiosInstance.patch(
        `/company/updateById/${companyId}`,
        updatedData
      );

      if (response.data.success === true) {
        setCompany(response.data.data);
        setReload(!reload);
      }
    } catch (error) {
      console.error("Error updating company data:", error);
    }
  };

  // Update driver status
  const handleUpdateStatus = async (driverId: string, newStatus: string) => {
    try {
      const idToken = localStorage.getItem("idToken");
      const response = await axios.patch(
        `${baseUrl}/api/driver-request/updateStatus/${driverId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setDrivers(
          drivers.map((driver) =>
            driver.id === driverId ? { ...driver, status: newStatus } : driver
          )
        );
        console.log("Driver status updated:", driverId, newStatus);
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setCompany(null);
    router.push("/");
  };

  if (!company) {
    return redirect("/company/company-login");
  }

  // console.log("Active tab:", company);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "dashboard"
                ? "Company Dashboard"
                : activeTab === "drivers"
                ? "Drivers List"
                : "Send Email"}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Icon icon="mdi:account" className="w-5 h-5" />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <CompanyInfo
            companyData={company as any}
            loading={loading}
            onUpdate={handleUpdateCompany}
          />
        )}

        {activeTab === "drivers" && (
          <DriversList
            drivers={drivers}
            loading={loading}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === "mail" && <SendEmailPage />}
      </main>
    </div>
  );
};

export default CompanyDashboard;
