/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Gift,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  searchPromotions,
  getPromotionStatistics,
  type Promotion,
  type PromotionStatistics,
} from "../service/promotionApi";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get date 30 days from now in YYYY-MM-DD format
const getFutureDate = (days: number = 30) => {
  const future = new Date();
  future.setDate(future.getDate() + days);
  return future.toISOString().split('T')[0];
};

export default function PromotionsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortField, setSortField] = useState<keyof Promotion | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [statistics, setStatistics] = useState<PromotionStatistics>({
    total: 0,
    active: 0,
    scheduled: 0,
    byType: [],
    totalUsage: 0,
    avgDiscount: 0,
  });

  // Initial form data with proper date format
  const getInitialFormData = (): Partial<Promotion> => ({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    discountValue: 0,
    minAmount: 0,
    maxDiscount: undefined,
    startDate: getTodayDate(),
    endDate: getFutureDate(30),
    usageLimit: 100,
    status: "scheduled",
    applicableServices: [],
    createdBy: "admin",
  });

  const [formData, setFormData] = useState<Partial<Promotion>>(getInitialFormData());

  useEffect(() => {
    fetchPromotions();
    fetchStatistics();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm || filterType !== "all" || filterStatus !== "all") {
        handleSearch();
      } else {
        fetchPromotions();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType, filterStatus]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error && "message" in error) {
      return String((error as Record<string, unknown>).message || fallback);
    }
    if (error instanceof Error) return error.message || fallback;
    return fallback;
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load promotions"));
      console.error("Fetch promotions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getPromotionStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Fetch statistics error:", error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchPromotions(searchTerm, filterType, filterStatus);
      setPromotions(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Search failed"));
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Promotion) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPromotions = [...promotions].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleAddPromotion = () => {
    setEditingPromo(null);
    setFormData(getInitialFormData());
    setShowModal(true);
  };

  const handleEditPromotion = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      ...promo,
      applicableServices: promo.applicableServices || [],
      createdBy: promo.createdBy || "admin",
    });
    setShowModal(true);
  };

  const handleDeletePromotion = async (id: number) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບໂປຣໂມຊັນນີ້ແທ້ບໍ່?")) return;

    try {
      await deletePromotion(id);
      toast.success("ລົບໂປຣໂມຊັນສຳເລັດ");
      fetchPromotions();
      fetchStatistics();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete promotion"));
      console.error("Delete error:", error);
    }
  };

  const validateForm = () => {
    if (!formData.code?.trim()) return "Please enter code";
    if (!formData.name?.trim()) return "Please enter name";
    if (!formData.description?.trim()) return "Please enter description";
    if (!formData.type) return "Please select type";
    if (!formData.startDate) return "Please select start date";
    if (!formData.endDate) return "Please select end date";
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.startDate)) return "Invalid start date format (use YYYY-MM-DD)";
    if (!dateRegex.test(formData.endDate)) return "Invalid end date format (use YYYY-MM-DD)";
    
    // Check if end date is after start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return "End date must be after start date";
    }
    
    if ((formData.discountValue ?? 0) <= 0) return "Discount must be greater than 0";
    if ((formData.minAmount ?? 0) < 0) return "Min amount must be >= 0";
    if ((formData.usageLimit ?? 0) <= 0) return "Usage limit must be greater than 0";
    
    // Validate percentage discount
    if (formData.type === "percentage" && (formData.discountValue ?? 0) > 100) {
      return "Percentage discount cannot exceed 100%";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateForm();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      if (editingPromo?.id) {
        await updatePromotion(editingPromo.id, formData);
        toast.success("ອັບເດດໂປຣໂມຊັນສຳເລັດ!");
      } else {
        // Create new promotion - ensure all required fields are present
        const createData: Omit<Promotion, "id" | "usedCount"> = {
          code: formData.code!,
          name: formData.name!,
          description: formData.description!,
          type: formData.type!,
          discountValue: formData.discountValue ?? 0,
          minAmount: formData.minAmount ?? 0,
          maxDiscount: formData.maxDiscount,
          startDate: formData.startDate!,
          endDate: formData.endDate!,
          usageLimit: formData.usageLimit ?? 100,
          status: formData.status ?? "scheduled",
          applicableServices: formData.applicableServices ?? [],
          createdBy: formData.createdBy ?? "admin",
        };
        
        console.log("Creating promotion with data:", createData);
        await createPromotion(createData);
        toast.success("ເພີ່ມໂປຣໂມຊັນສຳເລັດ!");
      }

      setShowModal(false);
      fetchPromotions();
      fetchStatistics();
    } catch (error) {
      const errorMsg = getErrorMessage(error, "Operation failed");
      toast.error(errorMsg);
      console.error("Submit error:", error);
    }
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-yellow-100 text-yellow-700";
      case "fixed":
        return "bg-blue-100 text-blue-700";
      case "free_service":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <Sidebar onToggle={setSidebarOpen} />

      <div className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}>
        <Navbar title="ຈັດການໂປຣໂມຊັນ" />

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">{statistics.total ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Gift size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">Active</p>
                  <p className="text-2xl font-bold text-green-600 lao-font">{statistics.active ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600 lao-font">{statistics.scheduled ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">Usage</p>
                  <p className="text-2xl font-bold text-[#EF3328] lao-font">{(statistics.totalUsage ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-[#EF3328]" />
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາໂປຣໂມຊັນ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
              >
                <option value="all">ທຸກສະຖານະ</option>
                <option value="active">active</option>
                <option value="scheduled">scheduled</option>
                <option value="expired">expired</option>
                <option value="inactive">inactive</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
              >
                <option value="all">ທຸກປະເພດ</option>
                <option value="percentage">percentage</option>
                <option value="fixed">fixed</option>
                <option value="free_service">free_service</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 lao-font">
                <Download size={20} />
                <span>Export</span>
              </button>
              <button
                onClick={handleAddPromotion}
                className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 lao-font"
              >
                <Plus size={20} />
                <span>ເພີ່ມ</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3328]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button onClick={() => handleSort("code")} className="flex items-center gap-2 hover:text-white/80">
                          Code {sortField === "code" && (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button onClick={() => handleSort("name")} className="flex items-center gap-2 hover:text-white/80">
                          Name {sortField === "name" && (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">Discount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">Usage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">Period</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold lao-font">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {sortedPromotions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <p className="text-gray-500 text-lg lao-font">ບໍ່ພົບຂໍ້ມູນ</p>
                        </td>
                      </tr>
                    ) : (
                      sortedPromotions.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 lao-font">{p.name}</td>

                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium lao-font ${getTypeColor(p.type)}`}>
                              {getTypeLabel(p.type)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-900">
                            {p.type === "percentage" ? `${p.discountValue}%` : `${(p.discountValue ?? 0).toLocaleString()} ກີບ`}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(p.usedCount ?? 0)} / {p.usageLimit}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium lao-font ${getStatusColor(p.status)}`}>
                              {getStatusIcon(p.status)} {p.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-col gap-1">
                              <span>{p.startDate}</span>
                              <span>→ {p.endDate}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditPromotion(p)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => p.id && handleDeletePromotion(p.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white lao-font">
                {editingPromo ? "Edit Promotion" : "Add Promotion"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="e.g., SUMMER2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="Promotion name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={(formData.type || "percentage") as Promotion["type"]}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Promotion["type"] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_service">Free Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number(formData.discountValue ?? 0)}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder={formData.type === "percentage" ? "0-100" : "Amount"}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Min Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number(formData.minAmount ?? 0)}
                    onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="Minimum purchase amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Max Discount (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount ?? ""}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="Maximum discount amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Usage Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={Number(formData.usageLimit ?? 100)}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="Number of times this can be used"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={(formData.status || "scheduled") as Promotion["status"]}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Promotion["status"] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    Applicable Services (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.applicableServices || []).join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicableServices: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="e.g., mobile_topup, bill_payment, money_transfer"
                  />
                  <p className="text-xs text-gray-500 mt-1 lao-font">
                    Leave empty to apply to all services
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  rows={3}
                  placeholder="Enter promotion description..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors lao-font font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all duration-300 lao-font font-medium"
                >
                  {editingPromo ? "Update Promotion" : "Create Promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}