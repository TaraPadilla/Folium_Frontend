
import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./Sidebar";
import { useState } from "react";

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="flex-1 flex">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab}/>
        <main className="flex-1 p-6 overflow-y-auto md:ml-56">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
