import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/navbar";
import usePageAudit from "./hook/usePageAudit";

const MainLayout = ({
  children,
  title = "ໜ້າຫຼັກ",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  usePageAudit();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setIsSidebarOpen} />

      {/* ✅ Make main a normal container (NOT full-screen fixed issues) */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* ✅ Navbar will stick to top of MAIN */}
        <Navbar title={title} />

        {/* page body */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
