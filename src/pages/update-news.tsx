import React, { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";

interface HotNews {
  news_id: number;
  title: string;
  description: string;
  content: string | null;
  img_url: string;
  web_view_url: string | null;
  category: string | null;
  status: string | null;
  created_at?: string;
}

interface ApiListResponse {
  status: boolean;
  data: HotNews[];
  message?: string;
}

interface ApiOneResponse {
  status: boolean;
  data?: HotNews;
  message?: string;
}

interface FormDataState {
  title: string;
  description: string;
  content: string;
  web_view_url: string;
  category: string;
  image: File | null;
  imagePreview: string;
}

const HotNewsUpload: React.FC = () => {
  const API_URL = "http://localhost:5001/api/hot-news";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<HotNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HotNews | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    description: "",
    content: "",
    web_view_url: "",
    category: "",
    image: null,
    imagePreview: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API_URL);
      const data: ApiListResponse = await resp.json();
      if (data.status) setItems(data.data || []);
      else alert(data.message || "Failed to fetch");
    } catch (e) {
      console.error(e);
      alert("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      web_view_url: "",
      category: "",
      image: null,
      imagePreview: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({
      ...p,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const submitCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Title and Description required");
      return;
    }

    setLoading(true);
    try {
      let img_url = editing?.img_url || "";

      // if new image selected -> convert to base64
      if (formData.image) {
        img_url = await fileToBase64(formData.image);
      }

      if (!img_url) {
        alert("Image is required");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        content: formData.content || null,
        web_view_url: formData.web_view_url ? formData.web_view_url : null,
        category: formData.category ? formData.category : null,
        img_url,
        status: "active",
      };

      const url = editing ? `${API_URL}/${editing.news_id}` : API_URL;
      const method = editing ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiOneResponse = await resp.json();

      if (data.status) {
        alert(editing ? "Updated!" : "Created!");
        resetForm();
        fetchAll();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: HotNews) => {
    setEditing(item);
    setShowForm(true);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || "",
      web_view_url: item.web_view_url || "",
      category: item.category || "",
      image: null,
      imagePreview: item.img_url,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this news?")) return;

    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data: ApiOneResponse = await resp.json();
      if (data.status) {
        alert("Deleted");
        fetchAll();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onToggle={setSidebarOpen} />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="news update"/>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Hot News & Insights
                </h1>
                <p className="text-gray-600 mt-1">
                  Upload / Edit / Delete news cards
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchAll}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) setEditing(null);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  {showForm ? "Cancel" : "Add News"}
                </button>
              </div>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editing ? "Edit News" : "Upload New News"}
                </h2>

                <form onSubmit={submitCreateOrUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter news title..."
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description for the card..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Content (optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Detailed article content..."
                      rows={5}
                      value={formData.content}
                      onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category (optional)
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Technology, Sports..."
                        value={formData.category}
                        onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Web View URL (optional)
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/article"
                        value={formData.web_view_url}
                        onChange={(e) => setFormData((p) => ({ ...p, web_view_url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image {editing ? "(optional)" : <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required={!editing}
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
                          className="max-w-md rounded-lg border border-gray-200 shadow-md"
                          alt="preview"
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
                      {loading ? (editing ? "Updating..." : "Uploading...") : (editing ? "Update News" : "Upload News")}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && items.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading news...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-medium text-gray-900">No news found</h3>
                <p className="mt-1 text-gray-500">Get started by uploading your first news article.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((n) => (
                  <div key={n.news_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 bg-gray-200 overflow-hidden group">
                      <img 
                        src={n.img_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        alt={n.title} 
                      />
                      {n.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{n.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{n.description}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(n)}
                          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(n.news_id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Total News: {items.length}
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

export default HotNewsUpload;