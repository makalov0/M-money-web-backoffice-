import { useState } from "react";
import {
  XCircle,
  Search,
  AlertTriangle,
  Phone,
  Mail,
  RefreshCw,
  FileText,
  X,
  DollarSign,
  User,
  Calendar
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";

interface FailedPayment {
  id: number;
  paymentId: string;
  serviceId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  packageName: string;
  amount: number;
  attemptDate: string;
  dueDate: string;
  failureReason: string;
  retryCount: number;
  status: "pending_retry" | "contact_required" | "suspended";
}

export default function FailedPayments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<FailedPayment | null>(null);

  const [failedPayments] = useState<FailedPayment[]>([
    {
      id: 1,
      paymentId: "PAY2025001250",
      serviceId: "FTTH2025001250",
      customerName: "ທ້າວ ພູມໃຈ ລາວົງ",
      phoneNumber: "020 4444 3210",
      email: "phoumjai@example.com",
      packageName: "Basic 10Mbps",
      amount: 99000,
      attemptDate: "2025-11-28",
      dueDate: "2025-11-20",
      failureReason: "ເງິນໃນບັນຊີບໍ່ພຽງພໍ",
      retryCount: 2,
      status: "pending_retry"
    },
    {
      id: 2,
      paymentId: "PAY2025001251",
      serviceId: "FTTH2025001251",
      customerName: "ນາງ ສີດາ ວົງສະຫວັນ",
      phoneNumber: "030 5555 7777",
      email: "seeda@example.com",
      packageName: "Standard 30Mbps",
      amount: 199000,
      attemptDate: "2025-11-27",
      dueDate: "2025-11-15",
      failureReason: "ບັດໝົດອາຍຸ",
      retryCount: 3,
      status: "contact_required"
    },
    {
      id: 3,
      paymentId: "PAY2025001252",
      serviceId: "FTTH2025001252",
      customerName: "ທ້າວ ບຸນມີ ພົມມະສອນ",
      phoneNumber: "020 8888 1111",
      email: "bounmee@example.com",
      packageName: "Premium 50Mbps",
      amount: 299000,
      attemptDate: "2025-11-25",
      dueDate: "2025-11-10",
      failureReason: "ການຊຳລະຖືກປະຕິເສດໂດຍທະນາຄານ",
      retryCount: 5,
      status: "suspended"
    },
    {
      id: 4,
      paymentId: "PAY2025001253",
      serviceId: "FTTH2025001253",
      customerName: "ນາງ ແສງດາວ ໄຊຍະວົງ",
      phoneNumber: "030 9999 2222",
      email: "saengdao@example.com",
      packageName: "Ultra 100Mbps",
      amount: 499000,
      attemptDate: "2025-11-26",
      dueDate: "2025-11-18",
      failureReason: "ຂໍ້ມູນບັດບໍ່ຖືກຕ້ອງ",
      retryCount: 1,
      status: "pending_retry"
    },
    {
      id: 5,
      paymentId: "PAY2025001254",
      serviceId: "FTTH2025001254",
      customerName: "ທ້າວ ທອງແດງ ວົງວິໄລ",
      phoneNumber: "020 3333 4444",
      email: "thongdaeng@example.com",
      packageName: "Gigabit 1Gbps",
      amount: 899000,
      attemptDate: "2025-11-24",
      dueDate: "2025-11-12",
      failureReason: "ບັນຊີຖືກປິດ",
      retryCount: 4,
      status: "contact_required"
    }
  ]);

  const filteredPayments = failedPayments.filter((payment) => {
    const matchesSearch =
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_retry":
        return "bg-yellow-100 text-yellow-700";
      case "contact_required":
        return "bg-orange-100 text-orange-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_retry":
        return "ລໍຖ້າລອງໃໝ່";
      case "contact_required":
        return "ຕ້ອງຕິດຕໍ່";
      case "suspended":
        return "ຖືກລະງັບ";
      default:
        return status;
    }
  };

  const totalFailed = failedPayments.length;
  const totalAmount = failedPayments.reduce((sum, p) => sum + p.amount, 0);
  const needContact = failedPayments.filter(p => p.status === "contact_required").length;

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
            ການຊຳລະລົ້ມເຫລວ
          </h1>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-red-600 lao-font">{totalFailed}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຕ້ອງຕິດຕໍ່</p>
                  <p className="text-2xl font-bold text-orange-600 lao-font">{needContact}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຍອດລວມ</p>
                  <p className="text-2xl font-bold text-[#EF3328] lao-font">
                    {totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-[#EF3328]" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                  ລາຍການຊຳລະລົ້ມເຫລວ
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                    <option value="pending_retry">ລໍຖ້າລອງໃໝ່</option>
                    <option value="contact_required">ຟ້ອງຕິດຕໍ່</option>
                    <option value="suspended">ຖືກລະງັບ</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ແພັກເກັດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ຈຳນວນເງິນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ສາເຫດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ລອງແລ້ວ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      สະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ການດຳເນີນການ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 lao-font">
                            {payment.customerName}
                          </div>
                          <div className="text-xs text-gray-500">{payment.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{payment.packageName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#EF3328] lao-font">
                        {payment.amount.toLocaleString()} ກີບ
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 lao-font">
                        {payment.failureReason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.retryCount} ຄັ້ງ
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)} lao-font`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
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
          {selectedPayment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold lao-font mb-2">ລາຍລະອຽດການຊຳລະລົ້ມເຫລວ</h2>
                      <p className="text-white/90">{selectedPayment.paymentId}</p>
                    </div>
                    <button onClick={() => setSelectedPayment(null)} className="text-white hover:bg-white/20 rounded-lg p-2">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <User size={20} />
                      ຂໍ້ມູນລູກຄ້າ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ຊື່:</span>
                        <span className="font-semibold lao-font">{selectedPayment.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເບີໂທ:</span>
                        <span className="font-semibold">{selectedPayment.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ອີເມວ:</span>
                        <span className="font-semibold">{selectedPayment.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <Calendar size={20} />
                      ຂໍ້ມູນການຊຳລະ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ແພັກເກັດ:</span>
                        <span className="font-semibold">{selectedPayment.packageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ຈຳນວນເງິນ:</span>
                        <span className="font-semibold text-[#EF3328] lao-font">
                          {selectedPayment.amount.toLocaleString()} ກີບ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ກຳນົດຊຳລະ:</span>
                        <span className="font-semibold">{selectedPayment.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ສາເຫດລົ້ມເຫລວ:</span>
                        <span className="font-semibold text-red-600 lao-font">{selectedPayment.failureReason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ພະຍາຍາມແລ້ວ:</span>
                        <span className="font-semibold">{selectedPayment.retryCount} ຄັ້ງ</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 lao-font font-semibold">
                      <Phone size={20} />
                      ໂທຫາລູກຄ້າ
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 lao-font font-semibold">
                      <Mail size={20} />
                      ສົ່ງອີເມວ
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 lao-font font-semibold">
                      <RefreshCw size={20} />
                      ລອງໃໝ່
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