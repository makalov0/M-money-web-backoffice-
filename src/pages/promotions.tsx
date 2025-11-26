/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Gift,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  Tag,
  TrendingUp,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_service";
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: "active" | "scheduled" | "expired" | "inactive";
  applicableServices: string[];
  createdBy: string;
  createdDate: string;
}

export default function PromotionsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      code: "NEWYEAR2025",
      name: "ສະຫຼອງປີໃໝ່ 2025",
      description: "ຮັບສ່ວນຫຼຸດ 20% ສຳລັບການເຕີມເງິນມືຖືທຸກເຄືອຂ່າຍ",
      type: "percentage",
      discountValue: 20,
      minAmount: 50000,
      maxDiscount: 100000,
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      usageLimit: 1000,
      usedCount: 456,
      status: "active",
      applicableServices: ["ເຕີມເງິນມືຖື", "eSIM"],
      createdBy: "ທ້າວ ບຸນມີ",
      createdDate: "2024-12-15",
    },
    {
      id: 2,
      code: "TOPUP50K",
      name: "ເຕີມ 50K ຟຣີ 10K",
      description: "ເຕີມເງິນ 50,000 ກີບຂື້ນໄປ ຮັບເງິນຄືນ 10,000 ກີບ",
      type: "fixed",
      discountValue: 10000,
      minAmount: 50000,
      startDate: "2025-11-01",
      endDate: "2025-11-30",
      usageLimit: 500,
      usedCount: 234,
      status: "active",
      applicableServices: ["ເຕີມເງິນມືຖື"],
      createdBy: "ນາງ ສົມຈິດ",
      createdDate: "2024-10-25",
    },
    {
      id: 3,
      code: "ESIMFREE",
      name: "eSIM ຟຣີ ສຳລັບລູກຄ້າໃໝ່",
      description: "ລູກຄ້າໃໝ່ຊື້ eSIM ຄັ້ງທຳອິດ ຟຣີ 1GB",
      type: "free_service",
      discountValue: 0,
      minAmount: 0,
      startDate: "2025-11-15",
      endDate: "2025-12-31",
      usageLimit: 200,
      usedCount: 89,
      status: "active",
      applicableServices: ["eSIM"],
      createdBy: "ທ້າວ ວິໄລ",
      createdDate: "2024-11-10",
    },
    {
      id: 4,
      code: "WEEKEND30",
      name: "ສຸດສັບປະດາ ຫຼຸດ 30%",
      description: "ທຸກວันເສົາ-ອາທິດ ຮັບສ່ວນຫຼຸດ 30%",
      type: "percentage",
      discountValue: 30,
      minAmount: 30000,
      maxDiscount: 50000,
      startDate: "2025-12-01",
      endDate: "2025-12-31",
      usageLimit: 800,
      usedCount: 0,
      status: "scheduled",
      applicableServices: ["ເຕີມເງິນມືຖື", "eSIM", "ຊຳລະບິນ"],
      createdBy: "ນາງ ແສງດາວ",
      createdDate: "2024-11-20",
    },
    {
      id: 5,
      code: "SUMMER2024",
      name: "ສະຫຼອງລະດູຮ້ອນ 2024",
      description: "ຮັບສ່ວນຫຼຸດ 15% ທຸກບໍລິການ",
      type: "percentage",
      discountValue: 15,
      minAmount: 40000,
      maxDiscount: 80000,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      usageLimit: 1500,
      usedCount: 1500,
      status: "expired",
      applicableServices: ["ເຕີມເງິນມືຖື", "eSIM", "ຊຳລະບິນ"],
      createdBy: "ທ້າວ ພູມໃຈ",
      createdDate: "2024-05-15",
    },
    {
      id: 6,
      code: "VIP100",
      name: "ສ່ວນຫຼຸດສະມາຊິກ VIP",
      description: "ສະມາຊິກ VIP ຮັບສ່ວນຫຼຸດ 100,000 ກີບ",
      type: "fixed",
      discountValue: 100000,
      minAmount: 500000,
      startDate: "2025-11-01",
      endDate: "2025-12-31",
      usageLimit: 50,
      usedCount: 12,
      status: "active",
      applicableServices: ["eSIM"],
      createdBy: "ທ້າວ ບຸນມີ",
      createdDate: "2024-10-30",
    },
  ]);

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || promo.status === filterStatus;
    const matchesType = filterType === "all" || promo.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "scheduled":
        return <Clock size={16} />;
      case "expired":
        return <XCircle size={16} />;
      case "inactive":
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "ກຳລັງໃຊ້ງານ";
      case "scheduled":
        return "ກຳນົດການ";
      case "expired":
        return "ໝົດອາຍຸ";
      case "inactive":
        return "ປິດການໃຊ້ງານ";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "ສ່ວນຫຼຸດເປີເຊັນ";
      case "fixed":
        return "ຫຼຸດເງິນສົດ";
      case "free_service":
        return "ບໍລິການຟຣີ";
      default:
        return type;
    }
  };

  const totalActive = promotions.filter((p) => p.status === "active").length;
  const totalScheduled = promotions.filter((p) => p.status === "scheduled").length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);

  const handleDelete = (id: number) => {
    if (confirm("ທ່ານຕ້ອງການລົບໂປຣໂມຊັນນີ້ແທ້ບໍ່?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const handleViewDetails = (promo: Promotion) => {
    setSelectedPromo(promo);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      <Sidebar onToggle={setSidebarOpen} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="ຈັດການໂປຣໂມຊັນ" />

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {promotions.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Gift size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ກຳລັງໃຊ້ງານ</p>
                  <p className="text-2xl font-bold text-green-600 lao-font">
                    {totalActive}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ກຳນົດການ</p>
                  <p className="text-2xl font-bold text-blue-600 lao-font">
                    {totalScheduled}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ການນຳໃຊ້</p>
                  <p className="text-2xl font-bold text-[#EF3328] lao-font">
                    {totalUsage.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-[#EF3328]" />
                </div>
              </div>
            </div>
          </div>

          {/* Promotions List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                  ລາຍການໂປຣໂມຊັນ
                </h2>

                <div className="flex gap-2">
                  <div className="relative flex-1 md:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font w-full md:w-64"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  >
                    <option value="all">ທຸກສະຖານະ</option>
                    <option value="active">ກຳລັງໃຊ້ງານ</option>
                    <option value="scheduled">ກຳນົດການ</option>
                    <option value="expired">ໝົດອາຍຸ</option>
                    <option value="inactive">ປິດການໃຊ້ງານ</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  >
                    <option value="all">ທຸກປະເພດ</option>
                    <option value="percentage">ສ່ວນຫຼຸດເປີເຊັນ</option>
                    <option value="fixed">ຫຼຸດເງິນສົດ</option>
                    <option value="free_service">ບໍລິການຟຣີ</option>
                  </select>

                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download size={20} />
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 lao-font"
                  >
                    <Plus size={20} />
                    ເພີ່ມໂປຣໂມຊັນ
                  </button>
                </div>
              </div>
            </div>

            {/* Promotions Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg lao-font mb-1">
                          {promo.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-white/80" />
                          <span className="text-white/90 text-sm font-mono">
                            {promo.code}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          promo.status
                        )}`}
                      >
                        {getStatusIcon(promo.status)}
                        {getStatusLabel(promo.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-gray-600 text-sm lao-font line-clamp-2">
                      {promo.description}
                    </p>

                    {/* Discount Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent size={18} className="text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-700 lao-font">
                          {getTypeLabel(promo.type)}
                        </span>
                      </div>
                      {promo.type === "percentage" && (
                        <p className="text-2xl font-bold text-yellow-600">
                          {promo.discountValue}%
                        </p>
                      )}
                      {promo.type === "fixed" && (
                        <p className="text-2xl font-bold text-yellow-600 lao-font">
                          {promo.discountValue.toLocaleString()} ກີບ
                        </p>
                      )}
                      {promo.type === "free_service" && (
                        <p className="text-lg font-bold text-yellow-600 lao-font">
                          ບໍລິການຟຣີ
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 lao-font mb-1">
                          ນຳໃຊ້ແລ້ວ
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {promo.usedCount}/{promo.usageLimit}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 lao-font mb-1">
                          ຍັງເຫຼືອ
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {promo.usageLimit - promo.usedCount}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span className="lao-font">ເລີ່ມ:</span>
                        <span className="font-semibold">{promo.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span className="lao-font">ສິ້ນສຸດ:</span>
                        <span className="font-semibold">{promo.endDate}</span>
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <p className="text-xs text-gray-600 lao-font mb-1">
                        ບໍລິການທີ່ໃຊ້ໄດ້:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {promo.applicableServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full lao-font"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleViewDetails(promo)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm lao-font"
                      >
                        <Eye size={16} />
                        ເບິ່ງ
                      </button>
                      <button className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1 text-sm lao-font">
                        <Edit size={16} />
                        ແກ້ໄຂ
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Modal */}
          {selectedPromo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold lao-font mb-2">
                        {selectedPromo.name}
                      </h2>
                      <p className="text-white/90 font-mono">{selectedPromo.code}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPromo(null)}
                      className="text-white hover:bg-white/20 rounded-lg p-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-2">ລາຍລະອຽດ</h3>
                    <p className="text-gray-600 lao-font">{selectedPromo.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 lao-font mb-1">ປະເພດ</p>
                      <p className="font-bold text-gray-800 lao-font">
                        {getTypeLabel(selectedPromo.type)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 lao-font mb-1">ມູນຄ່າສ່ວນຫຼຸດ</p>
                      <p className="font-bold text-gray-800">
                        {selectedPromo.type === "percentage"
                          ? `${selectedPromo.discountValue}%`
                          : `${selectedPromo.discountValue.toLocaleString()} ກີບ`}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 lao-font mb-1">ຍອດຂັ້ນຕ່ຳ</p>
                      <p className="font-bold text-gray-800 lao-font">
                        {selectedPromo.minAmount.toLocaleString()} ກີບ
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 lao-font mb-1">ນຳໃຊ້ແລ້ວ</p>
                      <p className="font-bold text-gray-800">
                        {selectedPromo.usedCount}/{selectedPromo.usageLimit}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-2">
                      ບໍລິການທີ່ໃຊ້ໄດ້
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPromo.applicableServices.map((service, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg lao-font"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 lao-font mb-2">ສ້າງໂດຍ</p>
                    <p className="font-bold text-gray-800 lao-font">
                      {selectedPromo.createdBy}
                    </p>
                    <p className="text-sm text-gray-500">{selectedPromo.createdDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}