import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../MainLayout";
import {
  Users,
  Ticket,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  Pickaxe,
  ClipboardList,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { CheckXjaidee } from "../service/authservice";

export default function MainPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalEmployees: "--",
    activeTickets: "--",
    monthlySalary: "--",
    xjaideePickending: "--",
  });
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch Xjaidee data
        const xjaideeResponse = await CheckXjaidee();
        const xjaideeData = xjaideeResponse?.data;

        if (Array.isArray(xjaideeData)) {
          // Count total unique employees
          const uniqueEmployees = new Set(
            xjaideeData.map((item: any) => item.emp_id)
          ).size;

          // Count pending items
          const pendingCount = xjaideeData.filter(
            (item: any) => item.status === "pending"
          ).length;

          // Calculate total amount
          const totalAmount = xjaideeData.reduce(
            (sum: number, item: any) => sum + (Number(item.amount) || 0),
            0
          );

          setStats({
            totalEmployees: String(uniqueEmployees),
            activeTickets: "0", // Add your ticket API here
            monthlySalary: totalAmount.toLocaleString("de-DE"),
            xjaideePickending: String(pendingCount),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        setStats({
          totalEmployees: "N/A",
          activeTickets: "N/A",
          monthlySalary: "N/A",
          xjaideePickending: "N/A",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header Section */}
        <div className="mb-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 lao-font">
                Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2 lao-font">
                <Calendar size={18} />
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="bg-white px-4 py-3 rounded-xl shadow-md flex items-center gap-2">
                <Clock size={18} className="text-red-600" />
                <span className="text-lg font-semibold text-gray-800 lao-font">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="ພະນັກງານທັງໝົດ"
            icon={<Users size={28} />}
            color="from-red-500 to-red-600"
            value={loading ? <Loader2 className="animate-spin" size={24} /> : stats.totalEmployees}
            loading={loading}
          />
          <StatCard
            title="ປະກາດທີ່ເປີດ"
            icon={<Ticket size={28} />}
            color="from-orange-500 to-red-500"
            value={loading ? <Loader2 className="animate-spin" size={24} /> : stats.activeTickets}
            loading={loading}
          />
          <StatCard
            title="ເງິນເດືອນລາຍເດືອນ"
            icon={<DollarSign size={28} />}
            color="from-red-600 to-red-700"
            value={loading ? <Loader2 className="animate-spin" size={24} /> : stats.monthlySalary}
            loading={loading}
          />
          <StatCard
            title="Xjaidee ລໍຖ້າ"
            icon={<CheckCircle size={28} />}
            color="from-red-400 to-orange-500"
            value={loading ? <Loader2 className="animate-spin" size={24} /> : stats.xjaideePickending}
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 lao-font">
                <TrendingUp className="text-red-600" size={22} />
                ກິດຈະກໍາຜ່ານມາ
              </h2>
            </div>
            <div className="flex items-center justify-center h-48 text-gray-400 lao-font">
              <p>ຂໍ້ມູນກິດຈະກໍາຈະປາກົດໃນບ່ອນນີ້</p>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 lao-font">
              ວຽກທີ່ລໍຖ້າ
            </h2>
            <div className="flex items-center justify-center h-48 text-gray-400 lao-font">
              <p>ຂໍ້ມູນວຽກຈະປາກົດໃນບ່ອນນີ້</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 lao-font">ເຄື່ອງມືໄວ</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickActionButton
              label="ກວດສອບ Xjaidee"
              icon={<CheckCircle size={24} />}
              onClick={() => navigate("/checkxjaidee")}
            />
            <QuickActionButton
              label="ຄິດໄລ່ເງິນເດືອນ"
              icon={<DollarSign size={24} />}
              onClick={() => navigate("/calculatesalary")}
            />
            <QuickActionButton
              label="ອັບເດດ Xjaidee"
              icon={<Pickaxe size={24} />}
              onClick={() => navigate("/updatexjaidee")}
            />
            <QuickActionButton
              label="ລາຍງານເງິນເດືອນ"
              icon={<ClipboardList size={24} />}
              onClick={() => navigate("/reportsalary")}
            />
            <QuickActionButton
              label="ລາຍງານຈຳນວນ"
              icon={<BarChart3 size={24} />}
              onClick={() => navigate("/amount")}
            />
            <QuickActionButton
              label="ຈັດການປະກາດ"
              icon={<Ticket size={24} />}
              onClick={() => navigate("/manage/ticket")}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

type StatCardProps = {
  title: string;
  icon: React.ReactNode;
  color: string;
  value: string | React.ReactNode;
  loading?: boolean;
};

function StatCard({ title, icon, color, value, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
      <div className={`bg-gradient-to-br ${color} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <h3 className="text-white/90 text-xs font-medium mt-3 mb-1 lao-font">
          {title}
        </h3>
        <p className={`text-white text-2xl font-bold lao-font ${loading ? "flex items-center" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

type QuickActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function QuickActionButton({ label, icon, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:scale-105 flex flex-col items-center gap-3 group lao-font"
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-semibold text-sm text-center">{label}</span>
    </button>
  );
}