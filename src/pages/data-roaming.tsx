import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Globe2,
  Smartphone,
  TrendingUp,
  Users,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Signal,
  Activity,
} from "lucide-react";

interface RoamingCustomer {
  id: number;
  name: string;
  phoneNumber: string;
  currentCountry: string;
  homeCountry: string;
  dataUsed: number;
  dataLimit: number;
  roamingStartDate: string;
  status: "active" | "inactive" | "suspended";
  dailyCost: number;
  totalCost: number;
}

export default function DataRoaming() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<RoamingCustomer | null>(null);

  const roamingCustomers: RoamingCustomer[] = [
    {
      id: 1,
      name: "ນາງ ວິໄລພອນ",
      phoneNumber: "020 5555 1234",
      currentCountry: "ປະເທດໄທ",
      homeCountry: "ລາວ",
      dataUsed: 2.5,
      dataLimit: 5,
      roamingStartDate: "2025-11-20",
      status: "active",
      dailyCost: 35000,
      totalCost: 140000,
    },
    {
      id: 2,
      name: "ທ້າວ ສຸກສະຫວັດ",
      phoneNumber: "020 7777 5678",
      currentCountry: "ປະເທດຫວຽດນາມ",
      homeCountry: "ລາວ",
      dataUsed: 4.2,
      dataLimit: 10,
      roamingStartDate: "2025-11-18",
      status: "active",
      dailyCost: 45000,
      totalCost: 270000,
    },
    {
      id: 3,
      name: "ນາງ ພອນສະຫວັນ",
      phoneNumber: "020 9999 8765",
      currentCountry: "ປະເທດຈີນ",
      homeCountry: "ລາວ",
      dataUsed: 1.8,
      dataLimit: 3,
      roamingStartDate: "2025-11-22",
      status: "active",
      dailyCost: 55000,
      totalCost: 110000,
    },
    {
      id: 4,
      name: "ທ້າວ ແສງອາລຸນ",
      phoneNumber: "020 3333 4567",
      currentCountry: "ປະເທດສິງກະໂປ",
      homeCountry: "ລາວ",
      dataUsed: 0.5,
      dataLimit: 2,
      roamingStartDate: "2025-11-23",
      status: "inactive",
      dailyCost: 65000,
      totalCost: 65000,
    },
    {
      id: 5,
      name: "ນາງ ດາລາວັນ",
      phoneNumber: "020 8888 2345",
      currentCountry: "ປະເທດເກົາຫຼີ",
      homeCountry: "ລາວ",
      dataUsed: 7.5,
      dataLimit: 10,
      roamingStartDate: "2025-11-15",
      status: "active",
      dailyCost: 70000,
      totalCost: 630000,
    },
    {
      id: 6,
      name: "ທ້າວ ຄຳພອນ",
      phoneNumber: "020 6666 7890",
      currentCountry: "ປະເທດຍີ່ປຸ່ນ",
      homeCountry: "ລາວ",
      dataUsed: 10,
      dataLimit: 10,
      roamingStartDate: "2025-11-10",
      status: "suspended",
      dailyCost: 80000,
      totalCost: 1120000,
    },
  ];

  const filteredCustomers = roamingCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      customer.currentCountry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeRoaming = roamingCustomers.filter((c) => c.status === "active").length;
  const totalRevenue = roamingCustomers.reduce((sum, c) => sum + c.totalCost, 0);
  const avgDataUsage =
    roamingCustomers.reduce((sum, c) => sum + (c.dataUsed / c.dataLimit) * 100, 0) /
    roamingCustomers.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "inactive":
        return "bg-slate-400";
      case "suspended":
        return "bg-amber-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "ກຳລັງໃຊ້ງານ";
      case "inactive":
        return "ບໍ່ມີການໃຊ້ງານ";
      case "suspended":
        return "ຖືກລະງັບ";
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
          font-family: 'Noto Sans Lao', sans-serif;
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <Sidebar onToggle={setSidebarOpen} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="ບໍລິການໂຣມມິ່ງຂໍ້ມູນ" />

        <div className="p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe2 className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 lao-font">
                ລະບົບຄຸ້ມຄອງໂຣມມິ່ງຂໍ້ມູນ
              </h1>
            </div>
            <p className="text-slate-600 ml-13 lao-font">
              ຕິດຕາມແລະຄຸ້ມຄອງການໃຊ້ງານຂໍ້ມູນໂຣມມິ່ງຂອງລູກຄ້າ
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Roaming Users */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <ArrowUpRight size={14} />
                  <span>12%</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1 lao-font">ຜູ້ໃຊ້ໂຣມມິ່ງ</p>
              <p className="text-3xl font-bold lao-font">{activeRoaming}</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <ArrowUpRight size={14} />
                  <span>8%</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1 lao-font">ລາຍຮັບລວມ</p>
              <p className="text-3xl font-bold lao-font">{(totalRevenue / 1000000).toFixed(1)}M</p>
            </div>

            {/* Average Data Usage */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <ArrowDownRight size={14} />
                  <span>3%</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1 lao-font">ການໃຊ້ງານສະເລ່ຍ</p>
              <p className="text-3xl font-bold lao-font">{avgDataUsage.toFixed(0)}%</p>
            </div>

            {/* Countries */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Globe2 size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Signal size={14} />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1 lao-font">ປະເທດທີ່ໃຫ້ບໍລິການ</p>
              <p className="text-3xl font-bold lao-font">15+</p>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 lao-font mb-1">
                    ລາຍຊື່ຜູ້ໃຊ້ໂຣມມິ່ງ
                  </h2>
                  <p className="text-sm text-slate-600 lao-font">
                    ມີທັງໝົດ {roamingCustomers.length} ລາຍການ
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Search */}
                  <div className="relative flex-1 lg:flex-none lg:w-64">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lao-font text-sm"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative">
                    <Filter
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lao-font text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">ທັງໝົດ</option>
                      <option value="active">ກຳລັງໃຊ້ງານ</option>
                      <option value="inactive">ບໍ່ມີການໃຊ້ງານ</option>
                      <option value="suspended">ຖືກລະງັບ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 card-hover cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 lao-font">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {customer.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white rounded-lg transition-colors">
                        <MoreVertical size={18} className="text-slate-400" />
                      </button>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Radio size={16} className="text-blue-500" />
                        <span className="text-slate-600 lao-font">
                          {customer.currentCountry}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Smartphone size={16} className="text-slate-400" />
                        <span className="text-slate-600 lao-font">
                          {customer.homeCountry}
                        </span>
                      </div>
                    </div>

                    {/* Data Usage Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 lao-font">
                          ການໃຊ້ຂໍ້ມູນ
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {customer.dataUsed}GB / {customer.dataLimit}GB
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (customer.dataUsed / customer.dataLimit) * 100 >= 90
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : (customer.dataUsed / customer.dataLimit) * 100 >= 70
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          }`}
                          style={{
                            width: `${(customer.dataUsed / customer.dataLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(customer.status)}`} />
                        <span className="text-sm text-slate-600 lao-font">
                          {getStatusLabel(customer.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 lao-font">ຄ່າໃຊ້ຈ່າຍ</p>
                        <p className="font-bold text-blue-600 lao-font">
                          {customer.totalCost.toLocaleString()} ກີບ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Globe2 size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 lao-font">ບໍ່ພົບຂໍ້ມູນ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 lao-font mb-1">
                  ລາຍລະອຽດຜູ້ໃຊ້
                </h2>
                <p className="text-slate-600">{selectedCustomer.phoneNumber}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-slate-400">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 lao-font mb-1">ຊື່ຜູ້ໃຊ້</p>
                <p className="font-semibold text-slate-800 lao-font">
                  {selectedCustomer.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 lao-font mb-1">ປະເທດປະຈຸບັນ</p>
                  <p className="font-semibold text-slate-800 lao-font">
                    {selectedCustomer.currentCountry}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 lao-font mb-1">ປະເທດຕົ້ນທາງ</p>
                  <p className="font-semibold text-slate-800 lao-font">
                    {selectedCustomer.homeCountry}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 lao-font mb-1">ວັນທີເລີ່ມໂຣມມິ່ງ</p>
                <p className="font-semibold text-slate-800">
                  {selectedCustomer.roamingStartDate}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-800 lao-font">ການໃຊ້ຂໍ້ມູນ</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {((selectedCustomer.dataUsed / selectedCustomer.dataLimit) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedCustomer.dataUsed / selectedCustomer.dataLimit) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {selectedCustomer.dataUsed}GB / {selectedCustomer.dataLimit}GB
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 lao-font mb-1">ຄ່າໃຊ້ຈ່າຍຕໍ່ມື້</p>
                  <p className="text-xl font-bold text-slate-800 lao-font">
                    {selectedCustomer.dailyCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                  <p className="text-sm text-emerald-700 lao-font mb-1">ລວມທັງໝົດ</p>
                  <p className="text-xl font-bold text-emerald-700 lao-font">
                    {selectedCustomer.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="text-slate-700 lao-font font-medium">ສະຖານະ</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedCustomer.status)}`} />
                  <span className="font-semibold text-slate-800 lao-font">
                    {getStatusLabel(selectedCustomer.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}