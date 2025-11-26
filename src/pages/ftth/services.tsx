import { useState, type JSX } from "react";
import {
  Wifi,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Zap,
  Phone,
  MapPin,
  X,
  Package,
  Calendar,
  User,
} from "lucide-react";
import MainLayout from "../../MainLayout";

interface FTTHService {
  id: number;
  serviceId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  packageName: string;
  speed: string;
  price: number;
  installDate: string;
  status: "active" | "pending" | "suspended" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "overdue";
  nextBillDate: string;
  technician: string;
  notes: string;
}

export default function FTTHServices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<FTTHService | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [services, setServices] = useState<FTTHService[]>([
    {
      id: 1,
      serviceId: "FTTH2025001",
      customerName: "ນາງ ສົມຈິດ ວົງສະຫວັນ",
      phoneNumber: "020 5555 1234",
      address: "ບ້ານ ໂພນໄຊ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ",
      packageName: "Premium 50Mbps",
      speed: "50Mbps",
      price: 350000,
      installDate: "2025-01-15",
      status: "active",
      paymentStatus: "paid",
      nextBillDate: "2025-12-15",
      technician: "ທ້າວ ບຸນມີ",
      notes: "ລູກຄ້າດີ ຈ່າຍເງິນຕາມເວລາ",
    },
    {
      id: 2,
      serviceId: "FTTH2025002",
      customerName: "ທ້າວ ພູມໃຈ ສີສະຫວາດ",
      phoneNumber: "020 7777 5678",
      address: "ບ້ານ ດົງປາລານ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ",
      packageName: "Ultra 100Mbps",
      speed: "100Mbps",
      price: 500000,
      installDate: "2025-02-20",
      status: "active",
      paymentStatus: "unpaid",
      nextBillDate: "2025-11-20",
      technician: "ນາງ ແສງດາວ",
      notes: "ຕິດຕັ້ງສຳເລັດ ລໍຖ້າການຊຳລະເງິນ",
    },
    {
      id: 3,
      serviceId: "FTTH2025003",
      customerName: "ນາງ ວັນດີ ພົມມະຈັນ",
      phoneNumber: "020 9999 8765",
      address: "ບ້ານ ໂນນສະຫວ່າງ, ເມືອງ ໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ",
      packageName: "Standard 30Mbps",
      speed: "30Mbps",
      price: 250000,
      installDate: "2024-12-10",
      status: "suspended",
      paymentStatus: "overdue",
      nextBillDate: "2025-10-10",
      technician: "ທ້າວ ວິໄລ",
      notes: "ຄ້າງຄ່າບໍລິການ 2 ເດືອນ",
    },
    {
      id: 4,
      serviceId: "FTTH2025004",
      customerName: "ທ້າວ ສົມບູນ ລີວົງ",
      phoneNumber: "020 4444 3210",
      address: "ບ້ານ ນາຊາຍ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ",
      packageName: "Extreme 200Mbps",
      speed: "200Mbps",
      price: 800000,
      installDate: "2025-03-01",
      status: "pending",
      paymentStatus: "paid",
      nextBillDate: "2025-12-01",
      technician: "ທ້າວ ບຸນມີ",
      notes: "ກຳລັງດຳເນີນການຕິດຕັ້ງ",
    },
  ]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || service.status === filterStatus;
    const matchesPayment = filterPayment === "all" || service.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: FTTHService["status"]) => {
    const colors: Record<FTTHService["status"], string> = {
      active: "bg-green-100 text-green-700",
      pending: "bg-blue-100 text-blue-700",
      suspended: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] ?? "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: FTTHService["status"]) => {
    const icons: Record<FTTHService["status"], JSX.Element> = {
      active: <CheckCircle size={16} />,
      pending: <Clock size={16} />,
      suspended: <XCircle size={16} />,
      cancelled: <XCircle size={16} />,
    };
    return icons[status] ?? null;
  };

  const getStatusLabel = (status: FTTHService["status"]) => {
    const labels: Record<FTTHService["status"], string> = {
      active: "ໃຊ້ງານຢູ່",
      pending: "ລໍຖ້າຕິດຕັ້ງ",
      suspended: "ລະງັບຊົ່ວຄາວ",
      cancelled: "ຍົກເລີກແລ້ວ",
    };
    return labels[status] ?? status;
  };

  const getPaymentColor = (payment: FTTHService["paymentStatus"]) => {
    const colors: Record<FTTHService["paymentStatus"], string> = {
      paid: "bg-green-100 text-green-700",
      unpaid: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
    };
    return colors[payment] ?? "bg-gray-100 text-gray-700";
  };

  const getPaymentLabel = (payment: FTTHService["paymentStatus"]) => {
    const labels: Record<FTTHService["paymentStatus"], string> = {
      paid: "ຈ່າຍແລ້ວ",
      unpaid: "ຍັງບໍ່ຈ່າຍ",
      overdue: "ເກີນກຳນົດ",
    };
    return labels[payment] ?? payment;
  };

  const totalActive = services.filter((s) => s.status === "active").length;
  const totalPending = services.filter((s) => s.status === "pending").length;
  const totalRevenue = services.filter((s) => s.status === "active").reduce((sum, s) => sum + s.price, 0);

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <div className="p-8">
        {/* Header */}
        <div className="bg-white shadow-md p-4 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-[#140F36] lao-font">ບໍລິການ FTTH</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                <p className="text-2xl font-bold text-[#140F36] lao-font">{services.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wifi size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ໃຊ້ງານຢູ່</p>
                <p className="text-2xl font-bold text-green-600 lao-font">{totalActive}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ລໍຖ້າຕິດຕັ້ງ</p>
                <p className="text-2xl font-bold text-blue-600 lao-font">{totalPending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm lao-font">ລາຍຮັບ/ເດືອນ</p>
                <p className="text-2xl font-bold text-[#EF3328] lao-font">{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-[#EF3328]" />
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#140F36] lao-font">ລາຍການບໍລິການ</h2>

              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                >
                  <option value="all">ທຸກສະຖານະ</option>
                  <option value="active">ໃຊ້ງານຢູ່</option>
                  <option value="pending">ລໍຖ້າຕິດຕັ້ງ</option>
                  <option value="suspended">ລະງັບຊົ່ວຄາວ</option>
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                >
                  <option value="all">ທຸກການຊຳລະ</option>
                  <option value="paid">ຈ່າຍແລ້ວ</option>
                  <option value="unpaid">ຍັງບໍ່ຈ່າຍ</option>
                  <option value="overdue">ເກີນກຳນົດ</option>
                </select>

                <button className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 lao-font">
                  <Plus size={20} />
                  ເພີ່ມບໍລິການ
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ລະຫັດ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ລູກຄ້າ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ເບີໂທ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ແພັກເກັດ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ລາຄາ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ສະຖານະ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ການຊຳລະ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#140F36]">{service.serviceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">{service.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.packageName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#EF3328] lao-font">
                      {service.price.toLocaleString()} ກີບ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)} lao-font`}>
                        {getStatusIcon(service.status)}
                        {getStatusLabel(service.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentColor(service.paymentStatus)} lao-font`}>
                        {getPaymentLabel(service.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedService(service); setShowDetailModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye size={18} />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { if (confirm("ທ່ານຕ້ອງການລົບບໍລິການນີ້ແທ້ບໍ່?")) setServices(services.filter((s) => s.id !== service.id)); }} className="p-1 text-red-600 hover:bg-red-100 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-[#140F36] to-[#1f1854] text-white flex justify-between items-center">
              <h3 className="text-2xl font-bold lao-font">ລາຍລະອຽດບໍລິການ</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 lao-font">ລະຫັດບໍລິການ</label>
                  <p className="text-lg font-semibold text-[#140F36]">{selectedService.serviceId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font">ສະຖານະ</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedService.status)} lao-font`}>
                      {getStatusIcon(selectedService.status)}
                      {getStatusLabel(selectedService.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <User size={16} />
                    ຊື່ລູກຄ້າ
                  </label>
                  <p className="text-lg font-semibold text-[#140F36] lao-font">{selectedService.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <Phone size={16} />
                    ເບີໂທ
                  </label>
                  <p className="text-lg font-semibold text-[#140F36]">{selectedService.phoneNumber}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <MapPin size={16} />
                    ທີ່ຢູ່
                  </label>
                  <p className="text-lg font-semibold text-[#140F36] lao-font">{selectedService.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <Package size={16} />
                    ແພັກເກັດ
                  </label>
                  <p className="text-lg font-semibold text-[#140F36]">{selectedService.packageName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <Zap size={16} />
                    ຄວາມໄວ
                  </label>
                  <p className="text-lg font-semibold text-blue-600">{selectedService.speed}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <DollarSign size={16} />
                    ລາຄາ
                  </label>
                  <p className="text-lg font-semibold text-[#EF3328] lao-font">{selectedService.price.toLocaleString()} ກີບ</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font flex items-center gap-2">
                    <Calendar size={16} />
                    ວັນຕິດຕັ້ງ
                  </label>
                  <p className="text-lg font-semibold text-[#140F36]">{selectedService.installDate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font">ການຊຳລະ</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(selectedService.paymentStatus)} lao-font`}>
                      {getPaymentLabel(selectedService.paymentStatus)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font">ວັນຈ່າຍຄ່າງວດຕໍ່ໄປ</label>
                  <p className="text-lg font-semibold text-[#140F36]">{selectedService.nextBillDate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 lao-font">ຊ່າງຕິດຕັ້ງ</label>
                  <p className="text-lg font-semibold text-[#140F36] lao-font">{selectedService.technician}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 lao-font">ໝາຍເຫດ</label>
                  <p className="text-base text-gray-700 lao-font">{selectedService.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}