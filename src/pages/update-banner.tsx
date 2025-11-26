import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Image,
  Upload,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Link,
  AlertCircle,
  Plus,
  Edit,
  X,
} from "lucide-react";

interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export default function UpdateBanner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    position: 1,
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // API functions (to be implemented)
  const fetchBanners = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/banners');
      // const data = await response.json();
      // setBanners(data);
      
      console.log("Fetching banners from API...");
      // Mock data removed - waiting for API
      setBanners([]);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("linkUrl", formData.linkUrl);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("position", formData.position.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/banners', {
      //   method: 'POST',
      //   body: formDataToSend,
      // });
      // const data = await response.json();
      
      console.log("Creating banner via API...", formDataToSend);
      alert("API ຍັງບໍ່ພ້ອມ - ກຳລັງລໍຖ້າ API endpoint");
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      fetchBanners();
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການສ້າງແບນເນີ");
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: number) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("linkUrl", formData.linkUrl);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("position", formData.position.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/banners/${id}`, {
      //   method: 'PUT',
      //   body: formDataToSend,
      // });
      // const data = await response.json();
      
      console.log(`Updating banner ${id} via API...`, formDataToSend);
      alert("API ຍັງບໍ່ພ້ອມ - ກຳລັງລໍຖ້າ API endpoint");
      
      resetForm();
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດແບນເນີ");
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບແບນເນີນີ້ແທ້ບໍ່?")) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/banners/${id}`, {
      //   method: 'DELETE',
      // });
      
      console.log(`Deleting banner ${id} via API...`);
      alert("API ຍັງບໍ່ພ້ອມ - ກຳລັງລໍຖ້າ API endpoint");
      
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການລົບແບນເນີ");
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id: number, isActive: boolean) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/banners/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isActive }),
      // });
      
      console.log(`Toggling banner ${id} status to ${isActive} via API...`);
      alert("API ຍັງບໍ່ພ້ອມ - ກຳລັງລໍຖ້າ API endpoint");
      
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      linkUrl: "",
      startDate: "",
      endDate: "",
      position: 1,
      isActive: true,
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      linkUrl: banner.linkUrl,
      startDate: banner.startDate,
      endDate: banner.endDate,
      position: banner.position,
      isActive: banner.isActive,
    });
    setImagePreview(banner.imageUrl);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner.id);
    } else {
      createBanner();
    }
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
        <Navbar title="ຈັດການແບນເນີ" />

        <div className="p-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#140F36] lao-font mb-2">
                  ຈັດການແບນເນີໂຄສະນາ
                </h2>
                <p className="text-gray-600 lao-font">
                  ເພີ່ມ, ແກ້ໄຂ, ແລະ ຈັດການແບນເນີທີ່ສະແດງຢູ່ໜ້າຫຼັກ
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setEditingBanner(null);
                  setShowAddModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 lao-font font-semibold"
              >
                <Plus size={20} />
                ເພີ່ມແບນເນີໃໝ່
              </button>
            </div>
          </div>

          {/* API Status Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-yellow-800 lao-font mb-1">
                  ກຳລັງລໍຖ້າ API
                </h3>
                <p className="text-yellow-700 lao-font">
                  ໜ້ານີ້ພ້ອມສຳລັບການເຊື່ອມຕໍ່ກັບ API. ກະລຸນາເພີ່ມ API endpoints ເພື່ອເລີ່ມໃຊ້ງານ.
                </p>
                <p className="text-sm text-yellow-600 mt-2 lao-font">
                  API endpoints ທີ່ຕ້ອງການ: GET, POST, PUT, DELETE, PATCH /api/banners
                </p>
              </div>
            </div>
          </div>

          {/* Banners List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#140F36] lao-font">
                ລາຍການແບນເນີ
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#EF3328] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 lao-font">ກຳລັງໂຫຼດ...</p>
              </div>
            ) : banners.length === 0 ? (
              <div className="p-12 text-center">
                <Image className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 lao-font">ຍັງບໍ່ມີແບນເນີ</p>
                <p className="text-sm text-gray-400 lao-font mt-2">
                  ກົດປຸ່ມ "ເພີ່ມແບນເນີໃໝ່" ເພື່ອເລີ່ມຕົ້ນ
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-[#140F36] lao-font">
                              {banner.title}
                            </h4>
                            <p className="text-gray-600 text-sm lao-font">
                              {banner.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              banner.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            } lao-font`}
                          >
                            {banner.isActive ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ"}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Link size={14} />
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {banner.linkUrl}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 lao-font">
                            <Calendar size={14} />
                            <span>
                              {banner.startDate} - {banner.endDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm lao-font"
                          >
                            <Edit size={16} />
                            ແກ້ໄຂ
                          </button>
                          <button
                            onClick={() =>
                              toggleBannerStatus(banner.id, !banner.isActive)
                            }
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm lao-font ${
                              banner.isActive
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {banner.isActive ? (
                              <>
                                <EyeOff size={16} />
                                ປິດ
                              </>
                            ) : (
                              <>
                                <Eye size={16} />
                                ເປີດ
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 text-sm lao-font"
                          >
                            <Trash2 size={16} />
                            ລົບ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {(showAddModal || editingBanner) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold lao-font">
                      {editingBanner ? "ແກ້ໄຂແບນເນີ" : "ເພີ່ມແບນເນີໃໝ່"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingBanner(null);
                        resetForm();
                      }}
                      className="text-white hover:bg-white/20 rounded-lg p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ຮູບພາບແບນເນີ
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#EF3328] transition-colors">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview("");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-600 lao-font">ກົດເພື່ອເລືອກຮູບພາບ</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ຫົວຂໍ້ *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                      placeholder="ປ້ອນຫົວຂໍ້ແບນເນີ"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ລາຍລະອຽດ
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                      placeholder="ປ້ອນລາຍລະອຽດແບນເນີ"
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ລິ້ງ URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                        ວັນທີເລີ່ມຕົ້ນ *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                        ວັນທີສິ້ນສຸດ *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                      />
                    </div>
                  </div>

                  {/* Position & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                        ຕຳແໜ່ງ
                      </label>
                      <input
                        type="number"
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            position: parseInt(e.target.value) || 1,
                          })
                        }
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                        ສະຖານະ
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-5 h-5 text-[#EF3328] rounded focus:ring-[#EF3328]"
                        />
                        <span className="lao-font">ເປີດໃຊ້ງານ</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold lao-font flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ກຳລັງດຳເນີນການ...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingBanner ? "ບັນທຶກການແກ້ໄຂ" : "ເພີ່ມແບນເນີ"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}