import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Package,
  DollarSign,
  Clock,
  Wifi,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
  type DataPackage,
} from "../service/packageService";

export default function DataPackages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<DataPackage | null>(null);
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof DataPackage | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState<Partial<DataPackage>>({
    name: "",
    nameEn: "",
    data: "",
    price: 0,
    validity: "",
    speed: "4G/5G",
    type: "daily",
    status: "active",
    description: "",
  });

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getAllPackages();
      setPackages(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load packages";
      toast.error(message);
      console.error("Fetch packages error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm || filterType !== "all") {
        handleSearch();
      } else {
        fetchPackages();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchPackages(searchTerm, filterType);
      setPackages(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof DataPackage) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPackages = [...packages].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleAddPackage = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      nameEn: "",
      data: "",
      price: 0,
      validity: "",
      speed: "4G/5G",
      type: "daily",
      status: "active",
      description: "",
    });
    setShowModal(true);
  };

  const handleEditPackage = (pkg: DataPackage) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setShowModal(true);
  };

  const handleDeletePackage = async (id: number) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບແພັກເກັດນີ້?")) {
      try {
        await deletePackage(id);
        toast.success("ລຶບແພັກເກັດສຳເລັດ!");
        fetchPackages();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete package";
        toast.error(message);
        console.error("Delete error:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPackage && editingPackage.id) {
        await updatePackage(editingPackage.id, formData);
        toast.success("ອັບເດດແພັກເກັດສຳເລັດ!");
      } else {
        await createPackage(formData as Omit<DataPackage, 'id'>);
        toast.success("ເພີ່ມແພັກເກັດສຳເລັດ!");
      }
      
      setShowModal(false);
      fetchPackages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
      console.error("Submit error:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-700";
      case "weekly":
        return "bg-green-100 text-green-700";
      case "monthly":
        return "bg-purple-100 text-purple-700";
      case "unlimited":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "ລາຍວັນ";
      case "weekly":
        return "ລາຍອາທິດ";
      case "monthly":
        return "ລາຍເດືອນ";
      case "unlimited":
        return "ບໍ່ຈຳກັດ";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar onToggle={setSidebarOpen} />

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        {/* Navbar */}
        <Navbar title="ແພັກເກັດຂໍ້ມູນ" />

        {/* Page Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {packages.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ລາຍວັນ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {packages.filter((p) => p.type === "daily").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ລາຍເດືອນ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {packages.filter((p) => p.type === "monthly").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Wifi size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ລາຄາສະເລ່ຍ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {packages.length > 0
                      ? (
                          packages.reduce((sum, p) => sum + p.price, 0) /
                          packages.length
                        ).toLocaleString()
                      : 0}{" "}
                    ກີບ
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາແພັກເກັດ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
              >
                <option value="all">ທັງໝົດ</option>
                <option value="daily">ລາຍວັນ</option>
                <option value="weekly">ລາຍອາທິດ</option>
                <option value="monthly">ລາຍເດືອນ</option>
                <option value="unlimited">ບໍ່ຈຳກັດ</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 lao-font">
                <Download size={20} />
                <span>Export</span>
              </button>
              <button
                onClick={handleAddPackage}
                className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 lao-font"
              >
                <Plus size={20} />
                <span>ເພີ່ມແພັກເກັດ</span>
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
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ຊື່ແພັກເກັດ
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('data')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ຂໍ້ມູນ
                          {sortField === 'data' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('price')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ລາຄາ
                          {sortField === 'price' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('validity')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ໄລຍະເວລາ
                          {sortField === 'validity' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('speed')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ຄວາມໄວ
                          {sortField === 'speed' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('type')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ປະເພດ
                          {sortField === 'type' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold lao-font">
                        <button 
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-white/80"
                        >
                          ສະຖານະ
                          {sortField === 'status' && (
                            sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold lao-font">
                        ຈັດການ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedPackages.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <p className="text-gray-500 text-lg lao-font">ບໍ່ພົບຂໍ້ມູນແພັກເກັດ</p>
                        </td>
                      </tr>
                    ) : (
                      sortedPackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-[#140F36] lao-font">{pkg.name}</p>
                              <p className="text-sm text-gray-600">{pkg.nameEn}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#EF3328] lao-font">{pkg.data}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-[#140F36] lao-font">
                              {pkg.price.toLocaleString()} ກີບ
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700 lao-font">{pkg.validity}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700 lao-font">{pkg.speed}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(pkg.type)} lao-font`}>
                              {getTypeLabel(pkg.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(pkg.status)} lao-font`}>
                              {getStatusLabel(pkg.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditPackage(pkg)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ແກ້ໄຂ"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => pkg.id && handleDeletePackage(pkg.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="ລຶບ"
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
                {editingPackage ? "ແກ້ໄຂແພັກເກັດ" : "ເພີ່ມແພັກເກັດໃໝ່"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ຊື່ແພັກເກັດ (ລາວ)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ຊື່ແພັກເກັດ (ອັງກິດ)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ຈຳນວນຂໍ້ມູນ
                  </label>
                  <input
                    type="text"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="ເຊັ່ນ: 5GB, 50GB, ບໍ່ຈຳກັດ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ລາຄາ (ກີບ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ໄລຍະເວລາ
                  </label>
                  <input
                    type="text"
                    value={formData.validity}
                    onChange={(e) =>
                      setFormData({ ...formData, validity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    placeholder="ເຊັ່ນ: 1 ວັນ, 7 ວັນ, 30 ວັນ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ຄວາມໄວ
                  </label>
                  <input
                    type="text"
                    value={formData.speed}
                    onChange={(e) =>
                      setFormData({ ...formData, speed: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ປະເພດ
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as DataPackage["type"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  >
                    <option value="daily">ລາຍວັນ</option>
                    <option value="weekly">ລາຍອາທິດ</option>
                    <option value="monthly">ລາຍເດືອນ</option>
                    <option value="unlimited">ບໍ່ຈຳກັດ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ສະຖານະ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as DataPackage["status"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  >
                    <option value="active">ເປີດໃຊ້ງານ</option>
                    <option value="inactive">ປິດໃຊ້ງານ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                  ລາຍລະອຽດ
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors lao-font"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all duration-300 lao-font"
                >
                  {editingPackage ? "ບັນທຶກການແກ້ໄຂ" : "ເພີ່ມແພັກເກັດ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}