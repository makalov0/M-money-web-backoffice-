// Sidebar.tsx (FULL)
// ✅ Role-based menu: ADMIN-only items hidden for EMPLOYEE
// ✅ Logout calls backend /api/auth/logout then clears storage and redirects to /login

import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Newspaper,
  MonitorCheck,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Package,
  Smartphone,
  Wifi,
  Menu,
  Globe,
  Cable,
  CreditCard,
  XCircle,
  Calendar,
  ShieldCheck,
  Tv,
  FileText,
  Zap,
  Building,
  Shield,
  Monitor,
  Landmark,
  Play,
  Gamepad2,
  Ticket,
  Upload,
  MessageSquare,
  Tag,
  Book,
} from "lucide-react";
import { toast } from "react-toastify";
import { logoutApi } from "../../service/authservice";

type UserRole = "ADMIN" | "EMPLOYEE";

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [isFTTHOpen, setIsFTTHOpen] = useState(false);
  const [isDigitalEntertainmentOpen, setIsDigitalEntertainmentOpen] = useState(false);
  const [isBillPaymentsOpen, setIsBillPaymentsOpen] = useState(false);

  const [username, setUsername] = useState<string>("Customer");
  const [userRole, setUserRole] = useState<UserRole>("EMPLOYEE");

  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = userRole === "ADMIN";

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState);
    onToggle?.(newState);
  };

  // ✅ Get user info from localStorage
  useEffect(() => {
    const storedEmpId = localStorage.getItem("empId") || "Customer";
    const storedRole = (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();

    setUsername(storedEmpId);

    if (storedRole === "ADMIN" || storedRole === "EMPLOYEE") {
      setUserRole(storedRole);
    } else {
      setUserRole("EMPLOYEE");
    }
  }, []);

  // Auto-open dropdowns if on related page
  useEffect(() => {
    
    if (location.pathname.startsWith("/ftth/")) setIsFTTHOpen(true);
    if (location.pathname.startsWith("/digital-entertainment/")) setIsDigitalEntertainmentOpen(true);
    if (location.pathname.startsWith("/bill-payments/")) setIsBillPaymentsOpen(true);
  }, [location.pathname]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);

        
        if (!location.pathname.startsWith("/ftth/")) setIsFTTHOpen(false);
        if (!location.pathname.startsWith("/digital-entertainment/")) setIsDigitalEntertainmentOpen(false);
        if (!location.pathname.startsWith("/bill-payments/")) setIsBillPaymentsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]);

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("ອອກຈາກລະບົບແລ້ວ", { autoClose: 1200 });
    } catch (err) {
      console.error("logout error:", err);
      toast.info("ອອກຈາກລະບົບ", { autoClose: 1200 });
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#140F36] via-[#1a1447] to-[#140F36] text-white flex flex-col shadow-2xl transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(239, 51, 40, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EF3328;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d62a20; }
      `}</style>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#454350]/30">
        <button
          className="p-2 rounded-xl hover:bg-[#EF3328]/20 transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => handleToggle(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} className="text-white" />
        </button>
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#EF3328] rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300 font-medium lao-font">ອອນໄລນ໌</span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#454350]/30">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF3328] to-[#d62a20] flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>

            {/* ✅ ADMIN badge */}
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#EF3328] rounded-full flex items-center justify-center border-2 border-[#140F36]">
                <ShieldCheck size={12} className="text-white" />
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate lao-font">{username}</p>
              <p className="text-xs text-[#454350] lao-font">
                {isAdmin ? "ຜູ້ເບິ່ງແຍງລະບົບ" : "ພະນັກງານ"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <SidebarLink
          to="/mainscreen"
          icon={<Home size={22} />}
          text="ໜ້າຫຼັກ"
          isOpen={isOpen}
          isActive={location.pathname === "/mainscreen"}
        />

        <SidebarLink
          to="/AdminChat"
          icon={<MessageSquare size={22} />}
          text="ສົນທະນາ"
          isOpen={isOpen}
          isActive={location.pathname === "/AdminChat"}
        />
        <SidebarLink
          to="/reports/log-web-mmoney"
          icon={<Book size={22} />}
          text="ລາຍງານ"
          isOpen={isOpen}
          isActive={location.pathname === "/reports/log-web-mmoney"}
        />
        

        <SidebarLink
          to="/data-packages"
          icon={<Package size={22} />}
          text="ແພັກເກັດຂໍ້ມູນ"
          isOpen={isOpen}
          isActive={location.pathname === "/data-packages"}
        />

        {/* ✅ ADMIN ONLY */}
        <SidebarLink
          to="/promotions"
          icon={<Tag size={22} />}
          text="ໂປຣໂມຊັ່ນ"
          isOpen={isOpen}
          isActive={location.pathname === "/promotions"}
          roles={["ADMIN"]}
          userRole={userRole}
        />
         <SidebarLink
          to="/MenusPage"
          icon={<Menu size={22} />}
          text="ຈັດການເມນູ"
          isOpen={isOpen}
          isActive={location.pathname === "/MenusPage"}
          roles={["ADMIN"]}
          userRole={userRole}
        />

        {/* ✅ ADMIN ONLY */}
        <SidebarLink
          to="/update-banner"
          icon={<Upload size={22} />}
          text="ອັບເດດແບນເນີ"
          isOpen={isOpen}
          isActive={location.pathname === "/update-banner"}
          roles={["ADMIN"]}
          userRole={userRole}
        />

        {/* ✅ ADMIN ONLY */}
        <SidebarLink
          to="/update-news"
          icon={<Newspaper size={22} />}
          text="ອັບເດດຂ່າວ"
          isOpen={isOpen}
          isActive={location.pathname === "/update-news"}
          roles={["ADMIN"]}
          userRole={userRole}
        />
       <SidebarLink
          to="/admin/RealtimeMonitor"
          icon={<MonitorCheck size={22} />}
          text="Monitoring ລະບົບ"
           isOpen={isOpen}
           isActive={location.pathname === "/admin/RealtimeMonitor"}
           roles={["ADMIN"]}
           userRole={userRole}
          />

        
        

        <SidebarLink
          to="/mobile-topup"
          icon={<Smartphone size={22} />}
          text="ເຕີມເງິນມືຖື"
          isOpen={isOpen}
          isActive={location.pathname === "/mobile-topup"}
        />

        <SidebarLink
          to="/esim-service"
          icon={<Wifi size={22} />}
          text="ບໍລິການ E-SIM"
          isOpen={isOpen}
          isActive={location.pathname === "/esim-service"}
        />

        <SidebarLink
          to="/data-roaming"
          icon={<Globe size={22} />}
          text="ໂຣມມິງຂໍ້ມູນ"
          isOpen={isOpen}
          isActive={location.pathname === "/data-roaming"}
        />

        {/* FTTH Dropdown (visible for both) */}
        <div className="relative">
          <button
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ${
              isFTTHOpen || location.pathname.startsWith("/ftth/")
                ? "bg-[#EF3328]/20 shadow-lg scale-105"
                : "hover:bg-[#454350]/20"
            } group`}
            onClick={() => setIsFTTHOpen(!isFTTHOpen)}
          >
            <div className="flex items-center space-x-3">
              <Cable size={22} className="group-hover:scale-110 transition-transform text-white" />
              {isOpen && <span className="text-sm font-medium lao-font text-white">ຈັດການ FTTH</span>}
            </div>
            {isOpen && (
              <span className="transition-transform duration-300 text-white">
                {isFTTHOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            )}
          </button>

          {isFTTHOpen && isOpen && (
            <div className="ml-4 pl-4 border-l-2 border-[#EF3328]/30 space-y-1 mt-2">
              <SidebarLink
                to="/ftth/services"
                icon={<Cable size={20} />}
                text="ບໍລິການ FTTH"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/ftth/services"}
              />
              <SidebarLink
                to="/ftth/payment"
                icon={<CreditCard size={20} />}
                text="ການຊຳລະເງິນ FTTH"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/ftth/payment"}
              />
              <SidebarLink
                to="/ftth/failed-payment"
                icon={<XCircle size={20} />}
                text="ການຊຳລະລົ້ມເຫລວ"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/ftth/failed-payment"}
              />
              <SidebarLink
                to="/ftth/reservation"
                icon={<Calendar size={20} />}
                text="ການຈອງ FTTH"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/ftth/reservation"}
              />
            </div>
          )}
        </div>

        {/* Digital + Bill are visible for both roles.
            If you want ADMIN-only, just wrap them with: {isAdmin && (...)} */}
        {/* Digital Entertainment Dropdown */}
        <div className="relative">
          <button
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ${
              isDigitalEntertainmentOpen || location.pathname.startsWith("/digital-entertainment/")
                ? "bg-[#EF3328]/20 shadow-lg scale-105"
                : "hover:bg-[#454350]/20"
            } group`}
            onClick={() => setIsDigitalEntertainmentOpen(!isDigitalEntertainmentOpen)}
          >
            <div className="flex items-center space-x-3">
              <Tv size={22} className="group-hover:scale-110 transition-transform text-white" />
              {isOpen && <span className="text-sm font-medium lao-font text-white">ບໍລິການດິຈິຕອນ</span>}
            </div>
            {isOpen && (
              <span className="transition-transform duration-300 text-white">
                {isDigitalEntertainmentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            )}
          </button>

          {isDigitalEntertainmentOpen && isOpen && (
            <div className="ml-4 pl-4 border-l-2 border-[#EF3328]/30 space-y-1 mt-2">
              <SidebarLink
                to="/digital-entertainment/wetv"
                icon={<Play size={20} />}
                text="WeTV"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/digital-entertainment/wetv"}
              />
              <SidebarLink
                to="/digital-entertainment/monomax"
                icon={<Monitor size={20} />}
                text="Monomax"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/digital-entertainment/monomax"}
              />
              <SidebarLink
                to="/digital-entertainment/game-topup"
                icon={<Gamepad2 size={20} />}
                text="Game Top-up"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/digital-entertainment/game-topup"}
              />
              <SidebarLink
                to="/digital-entertainment/ticket"
                icon={<Ticket size={20} />}
                text="Ticket"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/digital-entertainment/ticket"}
              />
            </div>
          )}
        </div>

        {/* Bill Payments Dropdown */}
        <div className="relative">
          <button
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ${
              isBillPaymentsOpen || location.pathname.startsWith("/bill-payments/")
                ? "bg-[#EF3328]/20 shadow-lg scale-105"
                : "hover:bg-[#454350]/20"
            } group`}
            onClick={() => setIsBillPaymentsOpen(!isBillPaymentsOpen)}
          >
            <div className="flex items-center space-x-3">
              <FileText size={22} className="group-hover:scale-110 transition-transform text-white" />
              {isOpen && <span className="text-sm font-medium lao-font text-white">ຈ່າຍບິນ</span>}
            </div>
            {isOpen && (
              <span className="transition-transform duration-300 text-white">
                {isBillPaymentsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            )}
          </button>

          {isBillPaymentsOpen && isOpen && (
            <div className="ml-4 pl-4 border-l-2 border-[#EF3328]/30 space-y-1 mt-2">
              <SidebarLink
                to="/bill/electricity"
                icon={<Zap size={20} />}
                text="ໄຟຟ້າ"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/bill/electricity"}
              />
              <SidebarLink
                to="/bill-payments/leasing"
                icon={<Building size={20} />}
                text="ເຊົ່າຊື້"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/bill-payments/leasing"}
              />
              <SidebarLink
                to="/bill-payments/insurance"
                icon={<Shield size={20} />}
                text="ປະກັນໄພ"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/bill-payments/insurance"}
              />
              <SidebarLink
                to="/bill-payments/lao-digital-tv"
                icon={<Monitor size={20} />}
                text="ໂທລະທັດດິຈິຕອນລາວ"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/bill-payments/lao-digital-tv"}
              />
              <SidebarLink
                to="/bill-payments/finance-institution"
                icon={<Landmark size={20} />}
                text="ສະຖາບັນການເງິນ"
                isOpen={isOpen}
                isSubItem
                isActive={location.pathname === "/bill-payments/finance-institution"}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#454350]/30">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-xl transition-all duration-300 hover:bg-[#EF3328]/20 hover:shadow-lg group"
        >
          <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 text-white">
            <LogOut size={22} />
          </span>
          {isOpen && (
            <span className="relative z-10 text-sm ml-3 font-medium lao-font text-white">
              ອອກຈາກລະບົບ
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------------- SidebarLink ---------------- */

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
  isSubItem?: boolean;
  isActive?: boolean;

  // ✅ OPTIONAL: if provided -> only show for these roles
  roles?: UserRole[];

  // ✅ OPTIONAL: current role (needed only if roles is used)
  userRole?: UserRole;
};

function SidebarLink({
  to,
  icon,
  text,
  isOpen,
  isSubItem,
  isActive,
  roles,
  userRole,
}: SidebarLinkProps) {
  // ✅ hide if roles provided and userRole not allowed
  if (roles && roles.length > 0) {
    const current = userRole || "EMPLOYEE";
    if (!roles.includes(current)) return null;
  }

  return (
    <Link
      to={to}
      className={`flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-[#EF3328] shadow-xl scale-105 font-semibold"
          : "hover:bg-[#454350]/20 hover:translate-x-1"
      } ${isSubItem ? "text-sm" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#EF3328]/0 via-[#EF3328]/20 to-[#EF3328]/0 ${
          isActive ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-300`}
      />

      <span
        className={`relative z-10 transition-transform duration-300 text-white ${
          isActive ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>

      {isOpen && (
        <span
          className={`relative z-10 text-sm ml-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-colors lao-font ${
            isActive ? "text-white" : "text-white group-hover:text-white"
          }`}
        >
          {text}
        </span>
      )}

      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#EF3328] rounded-r-full transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </Link>
  );
}
