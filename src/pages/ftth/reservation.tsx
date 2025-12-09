import { useState } from "react";
import {
  Calendar,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  X,
  Home,
  AlertCircle
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";

interface Reservation {
  id: number;
  reservationId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  district: string;
  packageName: string;
  installationDate: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  requestDate: string;
  notes: string;
  technician?: string;
}

export default function FTTHReservation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const [reservations] = useState<Reservation[]>([
    {
      id: 1,
      reservationId: "RSV2025001234",
      customerName: "ນາງ ສົມຈິດ ວົງສະຫວັນ",
      phoneNumber: "020 5555 1234",
      email: "somjit@example.com",
      address: "ບ້ານ ໂພນໄຊ, ຫ້ອງ 301, ຕຶກ A",
      district: "ເມືອງ ໄຊເສດຖາ",
      packageName: "Premium 50Mbps",
      installationDate: "2025-12-05",
      timeSlot: "09:00 - 12:00",
      status: "confirmed",
      requestDate: "2025-11-28",
      notes: "ຕ້ອງການຕິດຕັ້ງຕອນເຊົ້າ",
      technician: "ທ້າວ ບຸນມີ"
    },
    {
      id: 2,
      reservationId: "RSV2025001235",
      customerName: "ທ້າວ ບຸນມີ ພະຈັນທະວົງ",
      phoneNumber: "020 7777 5678",
      email: "bounmee@example.com",
      address: "ບ້ານ ນາຊາຍ, ເຮືອນເລກທີ 123",
      district: "ເມືອງ ສີສັດຕະນາກ",
      packageName: "Ultra 100Mbps",
      installationDate: "2025-12-06",
      timeSlot: "13:00 - 16:00",
      status: "pending",
      requestDate: "2025-11-29",
      notes: "ຕ້ອງການປຶກສາກ່ອນຕິດຕັ້ງ"
    },
    {
      id: 3,
      reservationId: "RSV2025001236",
      customerName: "ນາງ ແສງດາວ ໄຊຍະວົງ",
      phoneNumber: "030 9999 8765",
      email: "saengdao@example.com",
      address: "ບ້ານ ດົງປາລານ, ເຮືອນ 45/2",
      district: "ເມືອງ ຈັນທະບູລີ",
      packageName: "Gigabit 1Gbps",
      installationDate: "2025-12-04",
      timeSlot: "09:00 - 12:00",
      status: "in_progress",
      requestDate: "2025-11-25",
      notes: "ກຳລັງຕິດຕັ້ງ",
      technician: "ທ້າວ ວິໄລ"
    },
    {
      id: 4,
      reservationId: "RSV2025001237",
      customerName: "ທ້າວ ທອງແດງ ພູວົງ",
      phoneNumber: "020 3333 4444",
      email: "thongdaeng@example.com",
      address: "ບ້ານ ໂພນທັນ, ເຮືອນເລກທີ 78",
      district: "ເມືອງ ສີໂຄດຕະບອງ",
      packageName: "Standard 30Mbps",
      installationDate: "2025-11-30",
      timeSlot: "13:00 - 16:00",
      status: "completed",
      requestDate: "2025-11-20",
      notes: "ຕິດຕັ້ງສຳເລັດແລ້ວ",
      technician: "ທ້າວ ບຸນມີ"
    },
    {
      id: 5,
      reservationId: "RSV2025001238",
      customerName: "ນາງ ນາງຄຳ ສຸລິຍະວົງ",
      phoneNumber: "020 8888 9999",
      email: "nangkham@example.com",
      address: "ບ້ານ ວັດຕະໄນ, ຫ້ອງ 502",
      district: "ເມືອງ ໄຊເສດຖາ",
      packageName: "Basic 10Mbps",
      installationDate: "2025-12-08",
      timeSlot: "09:00 - 12:00",
      status: "pending",
      requestDate: "2025-11-30",
      notes: "ຕ້ອງການຕິດຕັ້ງໃນອາທິດໜ້າ"
    },
    {
      id: 6,
      reservationId: "RSV2025001239",
      customerName: "ທ້າວ ພູມໃຈ ວົງວິໄລ",
      phoneNumber: "030 5555 6666",
      email: "phoumjai@example.com",
      address: "ບ້ານ ໂພນສະຫວັນ, ເຮືອນ 99",
      district: "ເມືອງ ຈັນທະບູລີ",
      packageName: "Premium 50Mbps",
      installationDate: "2025-12-03",
      timeSlot: "13:00 - 16:00",
      status: "cancelled",
      requestDate: "2025-11-22",
      notes: "ລູກຄ້າຍົກເລີກການຈອງ"
    }
  ]);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || reservation.status === filterStatus;
    const matchesDate = !filterDate || reservation.installationDate === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "in_progress":
        return <Clock size={16} />;
      case "pending":
        return <AlertCircle size={16} />;
      case "confirmed":
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "ລໍຖ້າຢືນຢັນ";
      case "confirmed":
        return "ຢືນຢັນແລ້ວ";
      case "in_progress":
        return "ກຳລັງຕິດຕັ້ງ";
      case "completed":
        return "ສຳເລັດ";
      case "cancelled":
        return "ຍົກເລີກ";
      default:
        return status;
    }
  };

  const totalPending = reservations.filter((r) => r.status === "pending").length;
  const totalConfirmed = reservations.filter((r) => r.status === "confirmed").length;
  const totalCompleted = reservations.filter((r) => r.status === "completed").length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <Sidebar onToggle={(isOpen) => setSidebarOpen(isOpen)} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <div className="bg-white shadow-md p-4">
          <h1 className="text-2xl font-bold text-[#140F36] lao-font">
            ການຈອງຕິດຕັ້ງ FTTH
          </h1>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {reservations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ລໍຖ້າຢືນຢັນ</p>
                  <p className="text-2xl font-bold text-yellow-600 lao-font">
                    {totalPending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຢືນຢັນແລ້ວ</p>
                  <p className="text-2xl font-bold text-blue-600 lao-font">
                    {totalConfirmed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ສຳເລັດ</p>
                  <p className="text-2xl font-bold text-green-600 lao-font">
                    {totalCompleted}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Reservation List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                  ລາຍການຈອງຕິດຕັ້ງ
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  >
                    <option value="all">ທຸກສະຖານະ</option>
                    <option value="pending">ລໍຖ້າຢືນຢັນ</option>
                    <option value="confirmed">ຢືນຢັນແລ້ວ</option>
                    <option value="in_progress">ກຳລັງຕິດຕັ້ງ</option>
                    <option value="completed">ສຳເລັດ</option>
                    <option value="cancelled">ຍົກເລີກ</option>
                  </select>

                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ລະຫັດການຈອງ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ແພັກເກັດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ວັນທີຕິດຕັ້ງ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ເວລາ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ການດຳເນີນການ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#140F36]">
                          {reservation.reservationId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 lao-font">
                            {reservation.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reservation.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reservation.packageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.installationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.timeSlot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            reservation.status
                          )} lao-font`}
                        >
                          {getStatusIcon(reservation.status)}
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 lao-font"
                        >
                          <FileText size={16} />
                          ລາຍລະອຽດ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Modal */}
          {selectedReservation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold lao-font mb-2">
                        ລາຍລະອຽດການຈອງ
                      </h2>
                      <p className="text-white/90">{selectedReservation.reservationId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedReservation(null)}
                      className="text-white hover:bg-white/20 rounded-lg p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <User size={20} />
                      ຂໍ້ມູນລູກຄ້າ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ຊື່:</span>
                        <span className="font-semibold lao-font">
                          {selectedReservation.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເບີໂທ:</span>
                        <span className="font-semibold">
                          {selectedReservation.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ອີເມວ:</span>
                        <span className="font-semibold">
                          {selectedReservation.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Installation Info */}
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <Home size={20} />
                      ຂໍ້ມູນການຕິດຕັ້ງ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ທີ່ຢູ່:</span>
                        <span className="font-semibold lao-font text-right">
                          {selectedReservation.address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເມືອງ:</span>
                        <span className="font-semibold lao-font">
                          {selectedReservation.district}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ແພັກເກັດ:</span>
                        <span className="font-semibold">
                          {selectedReservation.packageName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ວັນທີຕິດຕັ້ງ:</span>
                        <span className="font-semibold">
                          {selectedReservation.installationDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເວລາ:</span>
                        <span className="font-semibold">
                          {selectedReservation.timeSlot}
                        </span>
                      </div>
                      {selectedReservation.technician && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 lao-font">ຊ່າງເທັກນິກ:</span>
                          <span className="font-semibold lao-font">
                            {selectedReservation.technician}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ສະຖານະ:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            selectedReservation.status
                          )} lao-font`}
                        >
                          {getStatusIcon(selectedReservation.status)}
                          {getStatusLabel(selectedReservation.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedReservation.notes && (
                    <div>
                      <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                        <FileText size={20} />
                        ໝາຍເຫດ
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 lao-font">
                          {selectedReservation.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {selectedReservation.status === "pending" && (
                      <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors lao-font font-semibold">
                        ຢືນຢັນການຈອງ
                      </button>
                    )}
                    {(selectedReservation.status === "pending" || selectedReservation.status === "confirmed") && (
                      <button className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors lao-font font-semibold">
                        ຍົກເລີກການຈອງ
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedReservation(null)}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors lao-font font-semibold"
                    >
                      ປິດ
                    </button>
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