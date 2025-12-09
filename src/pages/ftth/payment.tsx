import { useState } from "react";
import {
  CreditCard,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  FileText,  
  X
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";

interface Payment {
  id: number;
  paymentId: string;
  serviceId: string;
  customerName: string;
  phoneNumber: string;
  packageName: string;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "bcel_one" | "card";
  status: "completed" | "pending" | "failed" | "refunded";
  paymentDate: string;
  dueDate: string;
  invoiceNumber: string;
  period: string;
  receivedBy: string;
  notes: string;
}

export default function FTTHPayment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSidebarToggle = (isOpen: boolean) => {setSidebarOpen(isOpen)};

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [payments] = useState<Payment[]>([
    {
      id: 1,
      paymentId: "PAY2025001234",
      serviceId: "FTTH2025001234",
      customerName: "ນາງ ສົມຈິດ ວົງສະຫວັນ",
      phoneNumber: "020 5555 1234",
      packageName: "Premium 50Mbps",
      amount: 299000,
      paymentMethod: "bcel_one",
      status: "completed",
      paymentDate: "2025-11-01",
      dueDate: "2025-11-05",
      invoiceNumber: "INV-2025-001234",
      period: "ພະຈິກ 2025",
      receivedBy: "ນາງ ແສງດາວ",
      notes: "ຊຳລະຄ່າບໍລິການປະຈຳເດືອນພະຈິກ",
    },
    {
      id: 2,
      paymentId: "PAY2025001235",
      serviceId: "FTTH2025001235",
      customerName: "ທ້າວ ບຸນມີ ພະຈັນທະວົງ",
      phoneNumber: "020 7777 5678",
      packageName: "Ultra 100Mbps",
      amount: 499000,
      paymentMethod: "bank_transfer",
      status: "completed",
      paymentDate: "2025-11-05",
      dueDate: "2025-11-10",
      invoiceNumber: "INV-2025-001235",
      period: "ພະຈິກ 2025",
      receivedBy: "ທ້າວ ບຸນມີ",
      notes: "ຊຳລະຄ່າບໍລິການປະຈຳເດືອນພະຈິກ",
    },
    {
      id: 3,
      paymentId: "PAY2025001236",
      serviceId: "FTTH2025001236",
      customerName: "ນາງ ແສງດາວ ໄຊຍະວົງ",
      phoneNumber: "030 9999 8765",
      packageName: "Standard 30Mbps",
      amount: 199000,
      paymentMethod: "cash",
      status: "pending",
      paymentDate: "2025-11-28",
      dueDate: "2025-11-30",
      invoiceNumber: "INV-2025-001236",
      period: "ພະຈິກ 2025",
      receivedBy: "",
      notes: "ລໍຖ້າການຊຳລະ",
    },
    {
      id: 4,
      paymentId: "PAY2025001237",
      serviceId: "FTTH2025001237",
      customerName: "ທ້າວ ພູມໃຈ ລາວົງ",
      phoneNumber: "020 4444 3210",
      packageName: "Basic 10Mbps",
      amount: 99000,
      paymentMethod: "cash",
      status: "failed",
      paymentDate: "2025-10-15",
      dueDate: "2025-10-20",
      invoiceNumber: "INV-2025-001237",
      period: "ຕຸລາ 2025",
      receivedBy: "",
      notes: "ການຊຳລະບໍ່ສຳເລັດ - ເງິນບໍ່ພຽງພໍ",
    },
    {
      id: 5,
      paymentId: "PAY2025001238",
      serviceId: "FTTH2025001238",
      customerName: "ນາງ ນາງຄຳ ສຸລິຍະວົງ",
      phoneNumber: "020 8888 9999",
      packageName: "Gigabit 1Gbps",
      amount: 899000,
      paymentMethod: "card",
      status: "completed",
      paymentDate: "2025-11-01",
      dueDate: "2025-11-05",
      invoiceNumber: "INV-2025-001238",
      period: "ພະຈິກ 2025",
      receivedBy: "ນາງ ແສງດາວ",
      notes: "ຊຳລະຄ່າບໍລິການປະຈຳເດືອນພະຈິກ",
    },
    {
      id: 6,
      paymentId: "PAY2025001239",
      serviceId: "FTTH2025001239",
      customerName: "ທ້າວ ທອງແດງ ພູວົງ",
      phoneNumber: "030 7777 6666",
      packageName: "Premium 50Mbps",
      amount: 299000,
      paymentMethod: "bcel_one",
      status: "refunded",
      paymentDate: "2025-10-25",
      dueDate: "2025-10-30",
      invoiceNumber: "INV-2025-001239",
      period: "ຕຸລາ 2025",
      receivedBy: "ທ້າວ ວິໄລ",
      notes: "ຄືນເງິນເນື່ອງຈາກຍົກເລີກບໍລິການ",
    },
    {
      id: 7,
      paymentId: "PAY2025001240",
      serviceId: "FTTH2025001240",
      customerName: "ນາງ ສີດາ ພົມມະສອນ",
      phoneNumber: "020 3333 4444",
      packageName: "Standard 30Mbps",
      amount: 199000,
      paymentMethod: "bank_transfer",
      status: "completed",
      paymentDate: "2025-11-10",
      dueDate: "2025-11-15",
      invoiceNumber: "INV-2025-001240",
      period: "ພະຈິກ 2025",
      receivedBy: "ທ້າວ ບຸນມີ",
      notes: "ຊຳລະຄ່າບໍລິການປະຈຳເດືອນພະຈິກ",
    },
    {
      id: 8,
      paymentId: "PAY2025001241",
      serviceId: "FTTH2025001241",
      customerName: "ທ້າວ ຄຳພອນ ວົງວິໄລ",
      phoneNumber: "030 5555 6666",
      packageName: "Ultra 100Mbps",
      amount: 499000,
      paymentMethod: "cash",
      status: "completed",
      paymentDate: "2025-11-08",
      dueDate: "2025-11-12",
      invoiceNumber: "INV-2025-001241",
      period: "ພະຈິກ 2025",
      receivedBy: "ນາງ ແສງດາວ",
      notes: "ຊຳລະເປັນເງິນສົດ",
    },
  ]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesMethod = filterMethod === "all" || payment.paymentMethod === filterMethod;
    
    const matchesDateFrom = !dateFrom || payment.paymentDate >= dateFrom;
    const matchesDateTo = !dateTo || payment.paymentDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDateFrom && matchesDateTo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "failed":
        return <XCircle size={16} />;
      case "refunded":
        return <DollarSign size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "ສຳເລັດ";
      case "pending":
        return "ລໍຖ້າຊຳລະ";
      case "failed":
        return "ລົ້ມເຫລວ";
      case "refunded":
        return "ຄືນເງິນແລ້ວ";
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "ເງິນສົດ";
      case "bank_transfer":
        return "ໂອນເງິນຜ່ານທະນາຄານ";
      case "bcel_one":
        return "BCEL One";
      case "card":
        return "ບັດເຄຣດິດ/ເດບິດ";
      default:
        return method;
    }
  };

  const totalCompleted = payments.filter((p) => p.status === "completed").length;
  const totalPending = payments.filter((p) => p.status === "pending").length;
  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
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
      <Sidebar onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        {/* Navbar */}
        <div className="bg-white shadow-md p-4">
          <h1 className="text-2xl font-bold text-[#140F36] lao-font">
            ການຊຳລະເງິນ FTTH
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
                    {payments.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} className="text-purple-600" />
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

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ລໍຖ້າຊຳລະ</p>
                  <p className="text-2xl font-bold text-yellow-600 lao-font">
                    {totalPending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-yellow-600" />
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

          {/* Payment List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                    ປະຫວັດການຊຳລະເງິນ
                  </h2>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 lao-font">
                    <Download size={20} />
                    ດາວໂຫຼດລາຍງານ
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                    <option value="completed">ສຳເລັດ</option>
                    <option value="pending">ລໍຖ້າຊຳລະ</option>
                    <option value="failed">ລົ້ມເຫລວ</option>
                    <option value="refunded">ຄືນເງິນແລ້ວ</option>
                  </select>

                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  >
                    <option value="all">ທຸກວິທີຊຳລະ</option>
                    <option value="cash">ເງິນສົດ</option>
                    <option value="bank_transfer">ໂອນຜ່ານທະນາຄານ</option>
                    <option value="bcel_one">BCEL One</option>
                    <option value="card">ບັດເຄຣດິດ/ເດບິດ</option>
                  </select>

                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                    placeholder="ຈາກວັນທີ"
                  />

                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                    placeholder="ຫາວັນທີ"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ລະຫັດການຊຳລະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ແພັກເກັດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ຈຳນວນເງິນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ວິທີຊຳລະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ວັນທີຊຳລະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ການດຳເນີນການ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[#140F36]">
                            {payment.paymentId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 lao-font">
                            {payment.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.packageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#EF3328] lao-font">
                        {payment.amount.toLocaleString()} ກີບ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            payment.status
                          )} lao-font`}
                        >
                          {getStatusIcon(payment.status)}
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetail(payment)}
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
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold lao-font mb-2">
                        ລາຍລະອຽດການຊຳລະເງິນ
                      </h2>
                      <p className="text-white/90">{selectedPayment.paymentId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPayment(null)}
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
                          {selectedPayment.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເບີໂທ:</span>
                        <span className="font-semibold">
                          {selectedPayment.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ລະຫັດບໍລິການ:</span>
                        <span className="font-semibold">
                          {selectedPayment.serviceId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <CreditCard size={20} />
                      ຂໍ້ມູນການຊຳລະ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ແພັກເກັດ:</span>
                        <span className="font-semibold">
                          {selectedPayment.packageName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ໄລຍະເວລາ:</span>
                        <span className="font-semibold lao-font">
                          {selectedPayment.period}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ຈຳນວນເງິນ:</span>
                        <span className="font-semibold text-[#EF3328] lao-font text-lg">
                          {selectedPayment.amount.toLocaleString()} ກີບ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ວິທີຊຳລະ:</span>
                        <span className="font-semibold lao-font">
                          {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ວັນທີຊຳລະ:</span>
                        <span className="font-semibold">
                          {selectedPayment.paymentDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ກຳນົດຊຳລະ:</span>
                        <span className="font-semibold">
                          {selectedPayment.dueDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເລກທີໃບແຈ້ງໜີ້:</span>
                        <span className="font-semibold">
                          {selectedPayment.invoiceNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ສະຖານະ:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            selectedPayment.status
                          )} lao-font`}
                        >
                          {getStatusIcon(selectedPayment.status)}
                          {getStatusLabel(selectedPayment.status)}
                        </span>
                      </div>
                      {selectedPayment.receivedBy && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 lao-font">ຮັບເງິນໂດຍ:</span>
                          <span className="font-semibold lao-font">
                            {selectedPayment.receivedBy}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPayment.notes && (
                    <div>
                      <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                        <FileText size={20} />
                        ໝາຍເຫດ
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 lao-font">
                          {selectedPayment.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2.5 bg-[#EF3328] text-white rounded-lg hover:bg-[#d62a20] transition-colors flex items-center justify-center gap-2 lao-font font-semibold">
                      <Download size={20} />
                      ດາວໂຫຼດໃບເສັດ
                    </button>
                    <button
                      onClick={() => setSelectedPayment(null)}
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