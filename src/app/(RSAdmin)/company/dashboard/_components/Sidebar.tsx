"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface SidebarProps {
  activeTab: "dashboard" | "drivers" | "mail";
  setActiveTab: (tab: "dashboard" | "drivers" | "mail") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false); // State for toggling sidebar on mobile

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-blue-600 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon icon={isOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white z-40 transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:w-64 
          w-56 sm:w-60 md:w-64`} // Responsive widths
      >
        <div className="p-4">
          {/* Logo Section */}
          <div className="flex items-center mb-8 mt-4">
            <div className="w-14 h-14 bg-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
              <span>RS CAB</span>
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-800 lg:block hidden">
              RS CAB
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { value: "dashboard", label: "Dashboard", icon: "mdi:view-dashboard" },
              { value: "drivers", label: "Drivers", icon: "mdi:car" },
              { value: "mail", label: "Email", icon: "mdi:email" },
            ].map((tab) => (
              <Link
                key={tab.value}
                href="/company/dashboard"
                className={`flex items-center p-2 rounded mx-2 
                  ${activeTab === tab.value ? "bg-blue-200 text-gray-800" : "text-gray-700 hover:bg-blue-100"}`}
                onClick={() => {
                  setActiveTab(tab.value as "dashboard" | "drivers" | "mail");
                  if (window.innerWidth < 1024) setIsOpen(false); // Close sidebar on mobile after clicking
                }}
              >
                <Icon icon={tab.icon} className="w-5 h-5 mr-2" />
                <span className="text-base">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for Mobile when Sidebar is Open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
