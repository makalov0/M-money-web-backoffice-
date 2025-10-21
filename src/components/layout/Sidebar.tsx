import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Home,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Ticket,
  Megaphone,
  Calculator,
  CheckCheck,
  Pickaxe,
  ClipboardList,
  Upload,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";
import CryptoJS from "crypto-js";
import { mySecretKey } from "../../service/myConst";

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState);
    onToggle?.(newState);
  };

  // Get user info from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Guest";
    const encryptedRole = localStorage.getItem("Role");

    setUsername(storedUsername);

    if (encryptedRole) {
      try {
        const decryptedRole = CryptoJS.AES.decrypt(
          encryptedRole,
          mySecretKey
        ).toString(CryptoJS.enc.Utf8);
        setUserRole(decryptedRole || "user");
      } catch (error) {
        console.error("Error decrypting role:", error);
        setUserRole("user");
      }
    }
  }, []);

  // Auto-open management dropdown if on management page
  useEffect(() => {
    if (location.pathname.startsWith("/manage/")) {
      setIsManagementOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (!location.pathname.startsWith("/manage/")) {
          setIsManagementOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("profile");
    localStorage.removeItem("Role");
    navigate("/login");
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900 text-white flex flex-col shadow-2xl transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      {/* Header with Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-red-700/30">
        <button
          className="p-2 rounded-xl hover:bg-red-700/50 transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => handleToggle(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-200 font-medium lao-font">ອອນໄລນ໌</span>
          </div>
        )}
      </div>

      {/* User Info Section */}
      <div className="p-4 border-b border-red-700/30">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
            {userRole === "admin" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-red-900">
                <ShieldCheck size={12} className="text-red-900" />
              </div>
            )}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate lao-font">
                {username}
              </p>
              <p className="text-xs text-red-300 capitalize lao-font">
                {userRole === "admin" ? "ຜູ້ເບິ່ງແຍງລະບົບ" : userRole === "manager" ? "ຜູ້ຈັດການ" : "ຜູ້ໃຊ້"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <SidebarLink
          to="/mainscreen"
          icon={<Home size={22} />}
          text="ໜ້າຫຼັກ"
          isOpen={isOpen}
          isActive={location.pathname === "/mainscreen"}
        />

        {/* Upload Image - Admin Only */}
        {userRole === "admin" && (
          <SidebarLink
            to="/uploadimage"
            icon={<Upload size={22} />}
            text="ອັບໂຫລດຮູບພາບ"
            isOpen={isOpen}
            isActive={location.pathname === "/uploadimage"}
          />
        )}

        {/* Management Dropdown - Admin Only */}
        {userRole === "admin" && (
          <div className="relative">
            <button
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ${
                isManagementOpen || location.pathname.startsWith("/manage/")
                  ? "bg-red-700/60 shadow-lg scale-105"
                  : "hover:bg-red-700/40"
              } group`}
              onClick={() => setIsManagementOpen(!isManagementOpen)}
            >
              <div className="flex items-center space-x-3">
                <User size={22} className="group-hover:scale-110 transition-transform" />
                {isOpen && <span className="text-sm font-medium lao-font">ຈັດການ</span>}
              </div>
              {isOpen && (
                <span className="transition-transform duration-300">
                  {isManagementOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </span>
              )}
            </button>

            {isManagementOpen && isOpen && (
              <div className="ml-4 pl-4 border-l-2 border-red-600/50 space-y-1 mt-2">
                <SidebarLink
                  to="/manage/ticket"
                  icon={<Ticket size={20} />}
                  text="ປີ້"
                  isOpen={isOpen}
                  isSubItem
                  isActive={location.pathname === "/manage/ticket"}
                />
                <SidebarLink
                  to="/manage/ads"
                  icon={<Megaphone size={20} />}
                  text="ໂຄສະນາ"
                  isOpen={isOpen}
                  isSubItem
                  isActive={location.pathname === "/manage/ads"}
                />
              </div>
            )}
          </div>
        )}

        <SidebarLink
          to="/checkxjaidee"
          icon={<CheckCheck size={22} />}
          text="ກວດສອບ Xjaidee"
          isOpen={isOpen}
          isActive={location.pathname === "/checkxjaidee"}
        />
        <SidebarLink
          to="/calculatesalary"
          icon={<Calculator size={22} />}
          text="ຄິດໄລ່ເງິນເດືອນ"
          isOpen={isOpen}
          isActive={location.pathname === "/calculatesalary"}
        />
        <SidebarLink
          to="/updatexjaidee"
          icon={<Pickaxe size={22} />}
          text="ອັບເດດ Xjaidee"
          isOpen={isOpen}
          isActive={location.pathname === "/updatexjaidee"}
        />
        <SidebarLink
          to="/reportsalary"
          icon={<CircleDollarSign size={22} />}
          text="ລາຍງານເງິນເດືອນ"
          isOpen={isOpen}
          isActive={location.pathname === "/reportsalary"}
        />

        <SidebarLink
          to="/amount_all"
          icon={<ClipboardList size={22} />}
          text="ລາຍງານຈຳນວນທັງໝົດ"
          isOpen={isOpen}
          isActive={location.pathname === "/amount_all"}
        />
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-red-700/30">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-xl transition-all duration-300 hover:bg-red-600/60 hover:shadow-lg group"
        >
          <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            <LogOut size={22} />
          </span>
          {isOpen && (
            <span className="relative z-10 text-sm ml-3 font-medium lao-font">
              ອອກຈາກລະບົບ
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
  isSubItem?: boolean;
  isActive?: boolean;
};

function SidebarLink({
  to,
  icon,
  text,
  isOpen,
  isSubItem,
  isActive,
}: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-red-600 shadow-xl scale-105 font-semibold"
          : "hover:bg-red-700/40 hover:translate-x-1"
      } ${isSubItem ? "text-sm" : ""}`}
    >
      {/* Hover Effect Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-500/20 to-red-600/0 ${
          isActive ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-300`}
      ></div>

      <span
        className={`relative z-10 transition-transform duration-300 ${
          isActive ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>
      {isOpen && (
        <span
          className={`relative z-10 text-sm ml-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-colors lao-font ${
            isActive ? "text-white" : "group-hover:text-white"
          }`}
        >
          {text}
        </span>
      )}

      {/* Active Indicator */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-300 rounded-r-full transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      ></div>
    </Link>
  );
}