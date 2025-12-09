import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Smartphone,
  Wifi,
  Globe,
  Cable,
  Tv,
  FileText,
  Tag,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";

interface ServiceMetric {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function MainScreen() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const statsCards: ServiceMetric[] = [
    {
      title: "ຜູ້ໃຊ້ທັງໝົດ",
      value: "1,245",
      icon: <Users size={32} />,
      color: "text-[#EF3328]",
      bgColor: "bg-red-50",
    },
    {
      title: "ທຸລະກຳມື້ນີ້",
      value: "356",
      icon: <Activity size={32} />,
      color: "text-[#EF3328]",
      bgColor: "bg-red-50",
    },
    {
      title: "ລາຍຮັບມື້ນີ້",
      value: "12.5M",
      icon: <DollarSign size={32} />,
      color: "text-[#EF3328]",
      bgColor: "bg-red-50",
    },
    
  ];

  const services = [
    {
      label: "ແພັກເກັດຂໍ້ມູນ",
      icon: <Package size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/data-packages",
    },
    {
      label: "ເຕີມເງິນມືຖື",
      icon: <Smartphone size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/mobile-topup",
    },
    {
      label: "ບໍລິການ E-SIM",
      icon: <Wifi size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/esim-service",
    },
    {
      label: "ໂຣມມິງຂໍ້ມູນ",
      icon: <Globe size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/data-roaming",
    },
    {
      label: "ຈັດການ FTTH",
      icon: <Cable size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/ftth/services",
    },
    {
      label: "ບໍລິການດິຈິຕອນ",
      icon: <Tv size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/digital-entertainment/wetv",
    },
    {
      label: "ຈ່າຍບິນ",
      icon: <FileText size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/bill-payments/electricity",
    },
    {
      label: "ຈັດການໂປຣໂມຊັນ",
      icon: <Tag size={32} />,
      color: "from-[#EF3328] to-[#d62a20]",
      path: "/promotions",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }

        .service-card {
          transition: all 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(239, 51, 40, 0.3);
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar onToggle={setSidebarOpen} />

      {/* Main Content */}
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}
      >
        {/* Navbar */}
        <Navbar title="ໜ້າຫຼັກ" />

        {/* Page Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="stat-card bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <h3 className="text-[#454350] text-sm font-medium mb-2 lao-font">
                    {stat.title}
                  </h3>
                  <p className="text-[#140F36] text-3xl font-bold lao-font">
                    {stat.value}
                  </p>
                </div>
                <div className="h-1 bg-gradient-to-r from-[#EF3328] to-[#d62a20]"></div>
              </div>
            ))}
          </div>

          {/* Services Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-[#EF3328] to-[#d62a20] rounded-full"></div>
              <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                ບໍລິການທັງໝົດ
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <button
                  key={index}
                  onClick={() => navigate(service.path)}
                  className={`service-card bg-gradient-to-br ${service.color} p-8 rounded-2xl shadow-lg text-white group relative cursor-pointer overflow-hidden`}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#EF3328] to-[#d62a20] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4 w-fit group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <h3 className="text-lg font-bold text-left lao-font mb-1">
                      {service.label}
                    </h3>
                    <p className="text-white/80 text-sm lao-font">
                      ຄລິກເພື່ອເຂົ້າໃຊ້ບໍລິການ
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-[#EF3328] to-[#d62a20] rounded-full"></div>
              <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                ທຸລະກຳຫຼ້າສຸດ
              </h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                {[
                  { action: "ເຕີມເງິນມືຖື", amount: "50,000 ກີບ", time: "5 ນາທີກ່ອນ" },
                  { action: "ຊື້ແພັກເກັດຂໍ້ມູນ", amount: "99,000 ກີບ", time: "15 ນາທີກ່ອນ" },
                  { action: "ຈ່າຍບິນໄຟຟ້າ", amount: "250,000 ກີບ", time: "1 ຊົ່ວໂມງກ່ອນ" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-[#EF3328] rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-[#140F36] lao-font">
                          {activity.action}
                        </p>
                        <p className="text-sm text-[#454350] lao-font">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#EF3328] lao-font">
                      {activity.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}