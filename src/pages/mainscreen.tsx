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
  AlertCircle,
  CreditCard,
  Filter,
  Search,
  TrendingDown,
  Percent,
  Target,
} from "lucide-react";
import { CheckXjaidee } from "../service/authservice";
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
interface CreditItem {
  emp_id?: string;
  name?: string;
  surname?: string;
  amount?: number;
  status?: string;
  date_of_borrow?: string;
  credit_id?: string;
  expiration_date?: string;
  [key: string]: unknown;
}

export default function MainPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalEmployees: "--",
    activeTickets: "--",
    totalCredit: "--",
    xjaideePickending: "--",
    avgCredit: "--",
    approvalRate: "--",
    thisMonth: "--",
    lastMonth: "--",
  });
  const [loading, setLoading] = useState(true);
  const [recentCredits, setRecentCredits] = useState<CreditItem[]>([]);
  const [pendingCredits, setPendingCredits] = useState<CreditItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusData, setStatusData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const xjaideeResponse = await CheckXjaidee();
        const xjaideeData = xjaideeResponse?.data;

        if (Array.isArray(xjaideeData)) {
          let filteredData = xjaideeData;
          const now = new Date();
          
          if (dateFilter === "today") {
            filteredData = xjaideeData.filter((item: CreditItem) => {
              const date = new Date(item.date_of_borrow || "");
              return date.toDateString() === now.toDateString();
            });
          } else if (dateFilter === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredData = xjaideeData.filter((item: CreditItem) => {
              const date = new Date(item.date_of_borrow || "");
              return date >= weekAgo;
            });
          } else if (dateFilter === "month") {
            filteredData = xjaideeData.filter((item: CreditItem) => {
              const date = new Date(item.date_of_borrow || "");
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
          }

          const uniqueEmployees = new Set(
            filteredData.map((item: CreditItem) => item.emp_id)
          ).size;

          const pendingItems = filteredData.filter(
            (item: CreditItem) => item.status === "pending"
          );
          const pendingCount = pendingItems.length;

          const totalAmount = filteredData.reduce(
            (sum: number, item: CreditItem) => sum + (Number(item.amount) || 0),
            0
          );

          const avgCredit = filteredData.length > 0 ? totalAmount / filteredData.length : 0;

          const approvedCount = filteredData.filter((item: CreditItem) => item.status === "approved").length;
          const approvalRate = filteredData.length > 0 ? (approvedCount / filteredData.length) * 100 : 0;

          const thisMonthData = xjaideeData.filter((item: CreditItem) => {
            const date = new Date(item.date_of_borrow || "");
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          });
          const lastMonthData = xjaideeData.filter((item: CreditItem) => {
            const date = new Date(item.date_of_borrow || "");
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
          });
          const thisMonthTotal = thisMonthData.reduce((sum: number, item: CreditItem) => sum + (Number(item.amount) || 0), 0);
          const lastMonthTotal = lastMonthData.reduce((sum: number, item: CreditItem) => sum + (Number(item.amount) || 0), 0);

          const statusCounts: Record<string, number> = {};
          filteredData.forEach((item: CreditItem) => {
            const status = item.status || "unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
            name: name === "pending" ? "ລໍຖ້າ" : name === "approved" ? "ອະນຸມັດແລ້ວ" : name === "rejected" ? "ປະຕິເສດ" : name,
            value,
          }));

          const monthlyTrend: any[] = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthData = xjaideeData.filter((item: CreditItem) => {
              const itemDate = new Date(item.date_of_borrow || "");
              return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
            });
            const total = monthData.reduce((sum: number, item: CreditItem) => sum + (Number(item.amount) || 0), 0);
            monthlyTrend.push({
              month: date.toLocaleDateString("lo-LA", { month: "short" }),
              amount: total,
              count: monthData.length,
            });
          }

          const sortedByDate = [...filteredData].sort((a: CreditItem, b: CreditItem) => {
            const dateA = new Date(a.date_of_borrow || 0).getTime();
            const dateB = new Date(b.date_of_borrow || 0).getTime();
            return dateB - dateA;
          });
          setRecentCredits(sortedByDate.slice(0, 5));
          setPendingCredits(pendingItems.slice(0, 5));
          setStatusData(statusChartData);
          setMonthlyData(monthlyTrend);

          setStats({
            totalEmployees: String(uniqueEmployees),
            activeTickets: "0",
            totalCredit: totalAmount.toLocaleString("de-DE"),
            xjaideePickending: String(pendingCount),
            avgCredit: avgCredit.toLocaleString("de-DE"),
            approvalRate: approvalRate.toFixed(1),
            thisMonth: thisMonthTotal.toLocaleString("de-DE"),
            lastMonth: lastMonthTotal.toLocaleString("de-DE"),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        setStats({
          totalEmployees: "N/A",
          activeTickets: "N/A",
          totalCredit: "N/A",
          xjaideePickending: "N/A",
          avgCredit: "N/A",
          approvalRate: "N/A",
          thisMonth: "N/A",
          lastMonth: "N/A",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("lo-LA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const COLORS = ["#ef4444", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6"];

  const filteredRecentCredits = recentCredits.filter((credit) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      credit.name?.toLowerCase().includes(search) ||
      credit.surname?.toLowerCase().includes(search) ||
      credit.emp_id?.toLowerCase().includes(search) ||
      credit.credit_id?.toLowerCase().includes(search)
    );
  });

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-700 lao-font">
              <Filter size={20} className="text-red-600" />
              <span className="font-semibold">ກອງຂໍ້ມູນ:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "today", "week", "month"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all lao-font ${
                    dateFilter === filter
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter === "all" ? "ທັງໝົດ" : filter === "today" ? "ມື້ນີ້" : filter === "week" ? "ອາທິດນີ້" : "ເດືອນນີ້"}
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ຄົ້ນຫາພະນັກງານ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
              />
            </div>
          </div>
        </div>

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
            title="ສິນເຊື່ອທັງໝົດ"
            icon={<DollarSign size={28} />}
            color="from-red-600 to-red-700"
            value={loading ? <Loader2 className="animate-spin" size={24} /> : stats.totalCredit}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <QuickStatCard
            title="ສິນເຊື່ອສະເລ່ຍ"
            value={stats.avgCredit}
            icon={<Target size={24} className="text-blue-600" />}
            suffix="ກີບ"
            loading={loading}
          />
          <QuickStatCard
            title="ອັດຕາອະນຸມັດ"
            value={stats.approvalRate}
            icon={<Percent size={24} className="text-green-600" />}
            suffix="%"
            loading={loading}
          />
          <QuickStatCard
            title="ເດືອນນີ້"
            value={stats.thisMonth}
            icon={<TrendingUp size={24} className="text-purple-600" />}
            suffix="ກີບ"
            loading={loading}
          />
          <QuickStatCard
            title="ເດືອນແລ້ວ"
            value={stats.lastMonth}
            icon={<TrendingDown size={24} className="text-orange-600" />}
            suffix="ກີບ"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 lao-font">
              ສະຖານະສິນເຊື່ອ
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="text-red-600 animate-spin" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 lao-font">
              ແນວໂນ້ມ 6 ເດືອນ
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="text-red-600 animate-spin" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#ef4444" name="ຈຳນວນ" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 lao-font">
                <TrendingUp className="text-red-600" size={22} />
                ສິນເຊື່ອລ່າສຸດ
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="text-red-600 animate-spin" size={32} />
              </div>
            ) : filteredRecentCredits.length > 0 ? (
              <div className="space-y-3">
                {filteredRecentCredits.map((credit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <CreditCard className="text-red-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 lao-font">
                          {credit.name} {credit.surname}
                        </p>
                        <p className="text-sm text-gray-500 lao-font">
                          {credit.credit_id || credit.emp_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 lao-font">
                        {Number(credit.amount || 0).toLocaleString("de-DE")} ກີບ
                      </p>
                      <p className="text-xs text-gray-500 lao-font">
                        {formatDate(credit.date_of_borrow)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CreditCard size={48} className="mb-3" />
                <p className="lao-font">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 lao-font">
              <AlertCircle className="text-orange-500" size={22} />
              ສິນເຊື່ອລໍຖ້າອະນຸມັດ
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="text-red-600 animate-spin" size={32} />
              </div>
            ) : pendingCredits.length > 0 ? (
              <div className="space-y-3">
                {pendingCredits.map((credit, index) => (
                  <div
                    key={index}
                    className="p-3 bg-orange-50 rounded-xl border-l-4 border-orange-500"
                  >
                    <p className="font-semibold text-gray-800 text-sm lao-font">
                      {credit.name} {credit.surname}
                    </p>
                    <p className="text-xs text-gray-500 lao-font mt-1">
                      {credit.credit_id || credit.emp_id}
                    </p>
                    <p className="font-bold text-orange-600 text-sm mt-2 lao-font">
                      {Number(credit.amount || 0).toLocaleString("de-DE")} ກີບ
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CheckCircle size={48} className="mb-3" />
                <p className="text-center lao-font">ບໍ່ມີສິນເຊື່ອລໍຖ້າໃນຂະນະນີ້</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 lao-font">ເຄື່ອງມືໄວ</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickActionButton
              label="ກວດສອບ Xjaidee"
              icon={<CheckCircle size={24} />}
              onClick={() => navigate("/checkxjaidee")}
            />
            <QuickActionButton
              label="ຄິດໄລ່ສິນເຊື່ອ"
              icon={<DollarSign size={24} />}
              onClick={() => navigate("/calculatesalary")}
            />
            <QuickActionButton
              label="ອັບເດດ Xjaidee"
              icon={<Pickaxe size={24} />}
              onClick={() => navigate("/updatexjaidee")}
            />
            <QuickActionButton
              label="ລາຍງານສິນເຊື່ອ"
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

type QuickStatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  suffix: string;
  loading?: boolean;
};

function QuickStatCard({ title, value, icon, suffix, loading }: QuickStatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 lao-font">{title}</span>
        {icon}
      </div>
      {loading ? (
        <Loader2 className="animate-spin text-gray-400" size={24} />
      ) : (
        <p className="text-2xl font-bold text-gray-800 lao-font">
          {value} {suffix}
        </p>
      )}
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