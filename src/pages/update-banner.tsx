import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";

interface Promotion {
  w_id: number;
  title: string | null;
  description: string | null;
  web_view_url: string | null;
  img_url: string | null;
  index: string | null;
  status: string | null;
}

interface ApiListResponse {
  status: boolean;
  data: Promotion[];
  message?: string;
}

interface ApiOneResponse {
  status: boolean;
  data?: Promotion;
  message?: string;
}

interface FormDataState {
  title: string;
  description: string;
  web_view_url: string;
  image: File | null;
  imagePreview: string;
}

const UploadBanner: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    title: "New",
    description: "",
    web_view_url: "",
    image: null,
    imagePreview: "",
  });

  const API_URL = "http://localhost:5001/api/banners";

  // ✅ Fetch banners (GET)
  const fetchPromotions = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, { method: "GET" });
      const data: ApiListResponse = await response.json();

      if (data.status && Array.isArray(data.data)) {
        setPromotions(data.data);
      } else {
        setPromotions([]);
        alert(data.message || "Failed to fetch banners");
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Upload or update banner
  const handleUpload = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // For create, image is required. For update, image is optional.
    if (!formData.description) {
      alert("Please fill in the description");
      return;
    }

    if (!editingId && !formData.image) {
      alert("Please choose an image for the banner");
      return;
    }

    setLoading(true);

    try {
      // If editing and no new image chosen, send PUT without img_url
      if (editingId && !formData.image) {
        try {
          const resp = await fetch(`${API_URL}/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title || "New",
              description: formData.description,
              web_view_url: formData.web_view_url ? formData.web_view_url : null,
              status: "active",
            }),
          });

          const data: ApiOneResponse = await resp.json();
          if (data.status) {
            alert("Banner updated successfully!");
            setFormData({ title: "New", description: "", web_view_url: "", image: null, imagePreview: "" });
            setShowUploadForm(false);
            setEditingId(null);
            fetchPromotions();
          } else {
            alert(data.message || "Failed to update banner");
          }
        } catch (err) {
          console.error("Update error:", err);
          alert("Failed to update banner");
        } finally {
          setLoading(false);
        }

        return;
      }

      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          if (editingId) {
            // Update existing banner (send fields that changed)
            const resp = await fetch(`${API_URL}/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title || "New",
                description: formData.description,
                web_view_url: formData.web_view_url ? formData.web_view_url : null,
                img_url: base64Image,
                status: "active",
              }),
            });

            const data: ApiOneResponse = await resp.json();

            if (data.status) {
              alert("Banner updated successfully!");
              setFormData({ title: "New", description: "", web_view_url: "", image: null, imagePreview: "" });
              setShowUploadForm(false);
              setEditingId(null);
              fetchPromotions();
            } else {
              alert(data.message || "Failed to update banner");
            }
          } else {
            const resp = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title || "New",
                description: formData.description,
                web_view_url: formData.web_view_url ? formData.web_view_url : null,
                img_url: base64Image,
                status: "active",
              }),
            });

            const data: ApiOneResponse = await resp.json();

            if (data.status) {
              alert("Banner uploaded successfully!");
              setFormData({ title: "New", description: "", web_view_url: "", image: null, imagePreview: "" });
              setShowUploadForm(false);
              fetchPromotions();
            } else {
              alert(data.message || "Failed to upload banner");
            }
          }
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload banner");
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(formData.image as File);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload banner");
      setLoading(false);
    }
  };

  // Delete banner (DELETE /api/banners/:id)
  const handleDelete = async (w_id: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${w_id}`, {
        method: "DELETE",
      });

      const data: ApiOneResponse = await response.json();

      if (data.status) {
        alert("Banner deleted successfully!");
        fetchPromotions();
      } else {
        alert(data.message || "Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  // Edit banner - populate form and open
  const handleEdit = (promotion: Promotion): void => {
    setEditingId(promotion.w_id);
    setFormData({
      title: promotion.title ?? "New",
      description: promotion.description ?? "",
      web_view_url: promotion.web_view_url ?? "",
      image: null,
      imagePreview: promotion.img_url ?? "",
    });
    setShowUploadForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onToggle={setSidebarOpen} />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="update-banner" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Update Banner
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage promotional banners and images
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={fetchPromotions}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                  >
                    Refresh
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(null);
                      setShowUploadForm(!showUploadForm);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    {showUploadForm ? "Cancel" : "Add Banner"}
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingId ? "Edit Banner" : "Upload New Banner"}
                </h2>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter banner title..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter banner description..."
                      required
                    />
                  </div>

                  {/* Web URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web View URL (optional)
                    </label>
                    <input
                      value={formData.web_view_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          web_view_url: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required={!editingId}
                        />
                      </label>
                      {formData.image && (
                        <span className="text-sm text-gray-600">
                          {formData.image.name}
                        </span>
                      )}
                    </div>

                    {formData.imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="max-w-md rounded-lg shadow-md border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                    >
                      {loading ? (editingId ? "Updating..." : "Uploading...") : (editingId ? "Update Banner" : "Upload Banner")}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadForm(false);
                        setFormData({
                          title: "New",
                          description: "",
                          web_view_url: "",
                          image: null,
                          imagePreview: "",
                        });
                        setEditingId(null);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Grid */}
            {loading && promotions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading banners...</p>
              </div>
            ) : promotions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No banners found
                </h3>
                <p className="mt-1 text-gray-500">
                  Get started by uploading your first banner.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promotion) => (
                  <div
                    key={promotion.w_id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-48 bg-gray-200 overflow-hidden group">
                      <img
                        src={promotion.img_url || ""}
                        alt={promotion.title || "Banner"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-4">
                      <h3
                        className="font-semibold text-lg text-gray-800 mb-2 truncate"
                        title={promotion.title || ""}
                      >
                        {promotion.title || "No title"}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {promotion.description || ""}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(promotion.w_id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {promotions.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Total Banners: {promotions.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadBanner;