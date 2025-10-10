import React, { useState } from "react";
import { FiMenu, FiHome, FiUpload, FiSettings } from "react-icons/fi";
const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div
            className={`h-screen bg-white shadow-lg transition-all duration-300 
      ${isOpen ? "w-64" : "w-20"} flex flex-col`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                {isOpen && <h2 className="text-lg font-bold text-gray-800">MmoneyX App</h2>}
                <button
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <FiMenu size={20} />
                </button>
            </div>
            {/* Menu */}
            <nav className="flex flex-col p-4 space-y-4 text-gray-700">
                <a
                    href="/"
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 hover:text-blue-600"
                >
                    <FiHome size={20} />
                    {isOpen && <span>Home</span>}
                </a>
                <a
                    href="/uploadimage"
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 hover:text-blue-600"
                >
                    <FiUpload size={20} />
                    {isOpen && <span>Upload</span>}
                </a>
                <a
                    href="/contact"
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 hover:text-blue-600"
                >
                    <FiSettings size={20} />
                    {isOpen && <span>Contact</span>}
                </a>

            </nav>
        </div>
    );
};

export default Sidebar;
