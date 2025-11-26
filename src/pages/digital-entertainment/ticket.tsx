import React, { useState } from "react";
import {
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Upload,
  X,
  Tag,
  CheckCircle,
} from "lucide-react";
import MainLayout from "../../MainLayout";

interface TicketEvent {
  id: number;
  eventName: string;
  eventNameLao: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueLao: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: "active" | "sold-out" | "cancelled" | "upcoming";
  image: string;
  description: string;
}

export default function TicketManagement() {
  // sidebar is handled by MainLayout now
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [newTicket, setNewTicket] = useState<Partial<TicketEvent>>({
    eventName: "",
    eventNameLao: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    venueLao: "",
    category: "concert",
    price: 0,
    totalSeats: 0,
    availableSeats: 0,
    status: "upcoming",
    image: "",
    description: "",
  });

  const [tickets, setTickets] = useState<TicketEvent[]>([
    {
      id: 1,
      eventName: "Lao Pop Music Festival 2025",
      eventNameLao: "ງານມະໂຫລານດົນຕີລາວ 2025",
      eventDate: "2025-12-15",
      eventTime: "18:00",
      venue: "National Stadium",
      venueLao: "ສະໜາມກິລາແຫ່ງຊາດ",
      category: "concert",
      price: 150000,
      totalSeats: 5000,
      availableSeats: 2500,
      status: "active",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      description: "ງານດົນຕີທີ່ໃຫຍ່ທີ່ສຸດຂອງປີ",
    },
    {
      id: 2,
      eventName: "Traditional Dance Performance",
      eventNameLao: "ການສະແດງລຳພື້ນເມືອງ",
      eventDate: "2025-12-01",
      eventTime: "19:00",
      venue: "Cultural Center",
      venueLao: "ສູນວັດທະນະທຳ",
      category: "cultural",
      price: 80000,
      totalSeats: 500,
      availableSeats: 100,
      status: "active",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800",
      description: "ການສະແດງວັດທະນະທຳລາວດັ້ງເດີມ",
    },
    {
      id: 3,
      eventName: "Comedy Night Vientiane",
      eventNameLao: "ຄືນຕະຫຼົກວຽງຈັນ",
      eventDate: "2025-11-28",
      eventTime: "20:00",
      venue: "Lao Plaza Hotel",
      venueLao: "ໂຮງແຮມລາວພລາຊ່າ",
      category: "entertainment",
      price: 100000,
      totalSeats: 300,
      availableSeats: 0,
      status: "sold-out",
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
      description: "ຕະຫຼົກຢ່າງມ່ວນ",
    },
    {
      id: 4,
      eventName: "Football Match: Laos vs Thailand",
      eventNameLao: "ບານເຕະ: ລາວ ປະເຊີນໜ້າ ໄທ",
      eventDate: "2025-12-20",
      eventTime: "16:00",
      venue: "National Stadium",
      venueLao: "ສະໜາມກິລາແຫ່ງຊາດ",
      category: "sports",
      price: 50000,
      totalSeats: 10000,
      availableSeats: 8000,
      status: "active",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      description: "ແມັດທີ່ໜ້າຕື່ນເຕັ້ນ",
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewTicket({ ...newTicket, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTicket = () => {
    if (!newTicket.eventName || !newTicket.eventDate) return;
    const ticket: TicketEvent = {
      id: tickets.length + 1,
      eventName: newTicket.eventName || "",
      eventNameLao: newTicket.eventNameLao || "",
      eventDate: newTicket.eventDate || "",
      eventTime: newTicket.eventTime || "",
      venue: newTicket.venue || "",
      venueLao: newTicket.venueLao || "",
      category: (newTicket.category as TicketEvent["category"]) || "concert",
      price: Number(newTicket.price || 0),
      totalSeats: Number(newTicket.totalSeats || 0),
      availableSeats: Number(newTicket.availableSeats ?? newTicket.totalSeats ?? 0),
      status: (newTicket.status as TicketEvent["status"]) ?? "upcoming",
      image: newTicket.image || "",
      description: newTicket.description || "",
    };
    setTickets((prev) => [...prev, ticket]);
    setShowAddModal(false);
    setNewTicket({
      eventName: "",
      eventNameLao: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      venueLao: "",
      category: "concert",
      price: 0,
      totalSeats: 0,
      availableSeats: 0,
      status: "upcoming",
      image: "",
      description: "",
    });
    setImagePreview("");
  };

  const filteredTickets = tickets.filter((ticket) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.eventName.toLowerCase().includes(q) ||
      ticket.eventNameLao.toLowerCase().includes(q) ||
      ticket.venue.toLowerCase().includes(q);
    const matchesCategory = filterCategory === "all" || ticket.category === filterCategory;
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      "sold-out": "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
      upcoming: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "ເປີດຂາຍ",
      "sold-out": "ຂາຍໝົດແລ້ວ",
      cancelled: "ຍົກເລີກ",
      upcoming: "ກຳລັງມາເຖິງ",
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      concert: "ຄອນເສີດ",
      cultural: "ວັດທະນະທຳ",
      entertainment: "ບັນເທີງ",
      sports: "ກິລາ",
    };
    return labels[category] || category;
  };

  const totalEvents = tickets.length;
  const activeEvents = tickets.filter((t) => t.status === "active").length;
  const soldTickets = tickets.reduce((sum, t) => sum + (t.totalSeats - t.availableSeats), 0);
  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * (t.totalSeats - t.availableSeats), 0);

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <div className="p-8">
        <div className="bg-white shadow-md p-4 mb-6">
          <h2 className="text-2xl font-bold text-purple-900 lao-font">ລະບົບຈັດການງານ</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                <p className="text-2xl font-bold text-purple-900 lao-font">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Ticket size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ເປີດຂາຍ</p>
                <p className="text-2xl font-bold text-green-600 lao-font">{activeEvents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ປີ້ທີ່ຂາຍໄດ້</p>
                <p className="text-2xl font-bold text-blue-600 lao-font">{soldTickets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ລາຍຮັບ</p>
                <p className="text-2xl font-bold text-pink-600 lao-font">{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold text-purple-900 lao-font">ລາຍການງານ</h2>

              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 lao-font w-64"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 lao-font"
                >
                  <option value="all">ທຸກປະເພດ</option>
                  <option value="concert">ຄອນເສີດ</option>
                  <option value="cultural">ວັດທະນະທຳ</option>
                  <option value="entertainment">ບັນເທີງ</option>
                  <option value="sports">ກິລາ</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 lao-font"
                >
                  <option value="all">ທຸກສະຖານະ</option>
                  <option value="active">ເປີດຂາຍ</option>
                  <option value="sold-out">ຂາຍໝົດ</option>
                  <option value="upcoming">ກຳລັງມາເຖິງ</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 lao-font"
                >
                  <Plus size={20} />
                  ເພີ່ມງານ
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img src={ticket.image} alt={ticket.eventName} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)} lao-font`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.eventName}</h3>
                  <p className="text-sm text-gray-600 lao-font mb-3">{ticket.eventNameLao}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-purple-600" />
                      <span>{ticket.eventDate} | {ticket.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-600" />
                      <span className="lao-font">{ticket.venueLao}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-purple-600" />
                      <span className="lao-font">{getCategoryLabel(ticket.category)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 lao-font">ລາຄາ</p>
                      <p className="text-lg font-bold text-purple-600 lao-font">{ticket.price.toLocaleString()} ກີບ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 lao-font">ທີ່ນັ່ງເຫຼືອ</p>
                      <p className="text-lg font-bold text-gray-900">{ticket.availableSeats}/{ticket.totalSeats}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setSelectedTicket(ticket); setShowDetailModal(true); }}
                      className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      <span className="lao-font">ເບິ່ງ</span>
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2">
                      <Edit size={16} />
                      <span className="lao-font">ແກ້ໄຂ</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("ທ່ານຕ້ອງການລົບງານນີ້ແທ້ບໍ່?"))
                          setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal & Detail Modal (unchanged) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-bold lao-font">ເພີ່ມງານໃໝ່</h3>
              <button onClick={() => { setShowAddModal(false); setImagePreview(""); }} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">ອັບໂຫຼດຮູບພາບ/ແບນເນີ້</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                      <button
                        onClick={() => { setImagePreview(""); setNewTicket({ ...newTicket, image: "" }); }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <Upload size={48} className="text-gray-400 mb-2" />
                      <p className="text-gray-600 lao-font">ກົດເພື່ອອັບໂຫຼດຮູບພາບ</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">Event Name</label>
                  <input
                    type="text"
                    value={newTicket.eventName || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, eventName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ຊື່ງານ (ລາວ)</label>
                  <input
                    type="text"
                    value={newTicket.eventNameLao || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, eventNameLao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 lao-font"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ວັນທີ</label>
                  <input
                    type="date"
                    value={newTicket.eventDate || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ເວລາ</label>
                  <input
                    type="time"
                    value={newTicket.eventTime || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, eventTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">Venue</label>
                  <input
                    type="text"
                    value={newTicket.venue || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ສະຖານທີ່ (ລາວ)</label>
                  <input
                    type="text"
                    value={newTicket.venueLao || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, venueLao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 lao-font"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ປະເພດ</label>
                  <select
                    value={newTicket.category || "concert"}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 lao-font"
                  >
                    <option value="concert">ຄອນເສີດ</option>
                    <option value="cultural">ວັດທະນະທຳ</option>
                    <option value="entertainment">ບັນເທີງ</option>
                    <option value="sports">ກິລາ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ລາຄາ (ກີບ)</label>
                  <input
                    type="number"
                    value={newTicket.price ?? 0}
                    onChange={(e) => setNewTicket({ ...newTicket, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ທີ່ນັ່ງທັງໝົດ</label>
                  <input
                    type="number"
                    value={newTicket.totalSeats ?? 0}
                    onChange={(e) => setNewTicket({ ...newTicket, totalSeats: Number(e.target.value), availableSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ສະຖານະ</label>
                  <select
                    value={newTicket.status || "upcoming"}
                    onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value as TicketEvent["status"] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 lao-font"
                  >
                    <option value="upcoming">ກຳລັງມາເຖິງ</option>
                    <option value="active">ເປີດຂາຍ</option>
                    <option value="sold-out">ຂາຍໝົດ</option>
                    <option value="cancelled">ຍົກເລີກ</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 lao-font">ຄໍາອະທິບາຍ</label>
                  <textarea
                    value={newTicket.description || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => { setShowAddModal(false); setImagePreview(""); }} className="px-4 py-2 rounded-lg border border-gray-300 lao-font">
                  ຍົກເລີກ
                </button>
                <button onClick={handleAddTicket} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg lao-font">
                  ບັນທຶກ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold lao-font">{selectedTicket.eventName}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <img src={selectedTicket.image} alt={selectedTicket.eventName} className="w-full h-64 object-cover rounded-lg" />
              <p className="text-sm text-gray-700 lao-font">{selectedTicket.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 lao-font">ວັນທີ & ເວລາ</p>
                  <p className="font-medium">{selectedTicket.eventDate} | {selectedTicket.eventTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 lao-font">ທີ່ຈັດ</p>
                  <p className="font-medium lao-font">{selectedTicket.venueLao}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 lao-font">ສະຖານະ</p>
                  <p className="font-medium">{getStatusLabel(selectedTicket.status)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 lao-font">ລາຄາ</p>
                  <p className="font-medium">{selectedTicket.price.toLocaleString()} ກີບ</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg lao-font">ຂາຍຕອນນີ້</button>
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded-lg lao-font">ປິດ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}