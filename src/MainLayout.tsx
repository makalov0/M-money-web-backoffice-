import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {React.createElement(
                Sidebar as React.ComponentType<{ onToggle: React.Dispatch<React.SetStateAction<boolean>> }>,
                { onToggle: setIsSidebarOpen }
            )}
            <main className={`flex-1 bg-gray-50 transition-all duration-300 ${
                isSidebarOpen ? "ml-64" : "ml-20"
            }`}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;