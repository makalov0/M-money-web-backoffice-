import { useState } from "react";
import {
  Zap,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  FileText,
  X,
  Download,
  CreditCard
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";

interface ElectricityBill {
  id: number;
  billId: string;
  customerName: string;
  accountNumber: string;
  phoneNumber: string;
  address: string;
  district: string;
  billMonth: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: "cash" | "bank_transfer" | "bcel_one" | "card";
  status: "unpaid" | "paid" | "overdue" | "partial";
  receivedBy?: string;
  notes: string;
}

export default function ElectricityBillPayment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [selectedBill, setSelectedBill] = useState<ElectricityBill | null>(null);

  const [bills] = useState<ElectricityBill[]>([
    {
      id: 1,
      billId: "ELEC2025001234",
      customerName: "ນາງ ສົມຈິດ ວົງສະຫວັນ",
      accountNumber: "EDL-001234",
      phoneNumber: "020 5555 1234",
      address: "ບ້ານ ໂພນໄຊ, ເຮືອນເລກທີ 123",
      district: "ເມືອງ ໄຊເສດຖາ",
      billMonth: "ພະຈິກ 2025",
      previousReading: 1500,
      currentReading: 1750,
      consumption: 250,
      amount: 175000,
      dueDate: "2025-12-05",
      paymentDate: "2025-11-28",
      paymentMethod: "bcel_one",
      status: "paid",
      receivedBy: "ນາງ ແສງດາວ",
      notes: "ຊຳລະຄ່າໄຟປະຈຳເດືອນພະຈິກ"
    },
    {
      id: 2,
      billId: "ELEC2025001235",
      customerName: "ທ້າວ ບຸນມີ ພະຈັນທະວົງ",
      accountNumber: "EDL-001235",
      phoneNumber: "020 7777 5678",
      address: "ບ້ານ ນາຊາຍ, ເຮືອນເລກທີ 456",
      district: "ເມືອງ ສີສັດຕະນາກ",
      billMonth: "ພະຈິກ 2025",
      previousReading: 2000,
      currentReading: 2380,
      consumption: 380,
      amount: 266000,
      dueDate: "2025-12-05",
      status: "unpaid",
      notes: "ລໍຖ້າການຊຳລະ"
    },
    {
      id: 3,
      billId: "ELEC2025001236",
      customerName: "ນາງ ແສງດາວ ໄຊຍະວົງ",
      accountNumber: "EDL-001236",
      phoneNumber: "030 9999 8765",
      address: "ບ້ານ ດົງປາລານ, ເຮືອນເລກທີ 789",
      district: "ເມືອງ ຈັນທະບູລີ",
      billMonth: "ພະຈິກ 2025",
      previousReading: 1800,
      currentReading: 2050,
      consumption: 250,
      amount: 175000,
      dueDate: "2025-11-30",
      status: "overdue",
      notes: "ເກີນກຳນົດຊຳລະ 1 ວັນ"
    },
    {
      id: 4,
      billId: "ELEC2025001237",
      customerName: "ທ້າວ ທອງແດງ ພູວົງ",
      accountNumber: "EDL-001237",
      phoneNumber: "020 3333 4444",
      address: "ບ້ານ ໂພນທັນ, ເຮືອນເລກທີ 321",
      district: "ເມືອງ ສີໂຄດຕະບອງ",
      billMonth: "ຕຸລາ 2025",
      previousReading: 1200,
      currentReading: 1450,
      consumption: 250,
      amount: 175000,
      dueDate: "2025-11-05",
      paymentDate: "2025-11-02",
      paymentMethod: "cash",
      status: "paid",
      receivedBy: "ທ້າວ ບຸນມີ",
      notes: "ຊຳລະເປັນເງິນສົດ"
    },
    {
      id: 5,
      billId: "ELEC2025001238",
      customerName: "ນາງ ນາງຄຳ ສຸລິຍະວົງ",
      accountNumber: "EDL-001238",
      phoneNumber: "020 8888 9999",
      address: "ບ້ານ ວັດຕະໄນ, ເຮືອນເລກທີ 555",
      district: "ເມືອງ ໄຊເສດຖາ",
      billMonth: "ພະຈິກ 2025",
      previousReading: 3000,
      currentReading: 3500,
      consumption: 500,
      amount: 350000,
      dueDate: "2025-12-05",
      paymentDate: "2025-11-29",
      paymentMethod: "bank_transfer",
      status: "partial",
      receivedBy: "ນາງ ແສງດາວ",
      notes: "ຊຳລະບາງສ່ວນ 200,000 ກີບ"
    },
    {
      id: 6,
      billId: "ELEC2025001239",
      customerName: "ທ້າວ ພູມໃຈ ວົງວິໄລ",
      accountNumber: "EDL-001239",
      phoneNumber: "030 5555 6666",
      address: "ບ້ານ ໂພນສະຫວັນ, ເຮືອນເລກທີ 888",
      district: "ເມືອງ ຈັນທະບູລີ",
      billMonth: "ພະຈິກ 2025",
      previousReading: 2200,
      currentReading: 2450,
      consumption: 250,
      amount: 175000,
      dueDate: "2025-12-05",
      paymentDate: "2025-11-30",
      paymentMethod: "card",
      status: "paid",
      receivedBy: "ທ້າວ ວິໄລ",
      notes: "ຊຳລະດ້ວຍບັດເຄຣດິດ"
    }
  ]);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    const matchesMonth = !filterMonth || bill.billMonth.includes(filterMonth);
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "unpaid":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "partial":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} />;
      case "unpaid":
        return <Clock size={16} />;
      case "overdue":
        return <XCircle size={16} />;
      case "partial":
        return <DollarSign size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "ຊຳລະແລ້ວ";
      case "unpaid":
        return "ຍັງບໍ່ທັນຊຳລະ";
      case "overdue":
        return "ເກີນກຳນົດ";
      case "partial":
        return "ຊຳລະບາງສ່ວນ";
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return "-";
    switch (method) {
      case "cash":
        return "ເງິນສົດ";
      case "bank_transfer":
        return "ໂອນຜ່ານທະນາຄານ";
      case "bcel_one":
        return "BCEL One";
      case "card":
        return "ບັດເຄຣດິດ/ເດບິດ";
      default:
        return method;
    }
  };

  const totalPaid = bills.filter((b) => b.status === "paid").length;
  const totalUnpaid = bills.filter((b) => b.status === "unpaid").length;
  const totalOverdue = bills.filter((b) => b.status === "overdue").length;

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
            ການຊຳລະຄ່າໄຟຟ້າ
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
                    {bills.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຊຳລະແລ້ວ</p>
                  <p className="text-2xl font-bold text-green-600 lao-font">
                    {totalPaid}
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
                  <p className="text-gray-600 text-sm lao-font">ຍັງບໍ່ທັນຊຳລະ</p>
                  <p className="text-2xl font-bold text-yellow-600 lao-font">
                    {totalUnpaid}
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
                  <p className="text-gray-600 text-sm lao-font">ເກີນກຳນົດ</p>
                  <p className="text-2xl font-bold text-red-600 lao-font">
                    {totalOverdue}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Bill List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                    ບິນຄ່າໄຟຟ້າ
                  </h2>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 lao-font">
                    <Download size={20} />
                    ດາວໂຫຼດລາຍງານ
                  </button>
                </div>

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
                    <option value="paid">ຊຳລະແລ້ວ</option>
                    <option value="unpaid">ຍັງບໍ່ທັນຊຳລະ</option>
                    <option value="overdue">ເກີນກຳນົດ</option>
                    <option value="partial">ຊຳລະບາງສ່ວນ</option>
                  </select>

                  <input
                    type="text"
                    placeholder="ກອງເດືອນ..."
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
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
                      ລະຫັດບິນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ເດືອນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ຈຳນວນໃຊ້
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ຈຳນວນເງິນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase lao-font">
                      ກຳນົດຊຳລະ
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
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[#140F36]">
                            {bill.billId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bill.accountNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 lao-font">
                            {bill.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bill.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {bill.billMonth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.consumption} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#EF3328] lao-font">
                        {bill.amount.toLocaleString()} ກີບ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            bill.status
                          )} lao-font`}
                        >
                          {getStatusIcon(bill.status)}
                          {getStatusLabel(bill.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedBill(bill)}
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
          {selectedBill && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold lao-font mb-2">
                        ລາຍລະອຽດບິນຄ່າໄຟຟ້າ
                      </h2>
                      <p className="text-white/90">{selectedBill.billId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBill(null)}
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
                          {selectedBill.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເລກບັນຊີ:</span>
                        <span className="font-semibold">
                          {selectedBill.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເບີໂທ:</span>
                        <span className="font-semibold">
                          {selectedBill.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ທີ່ຢູ່:</span>
                        <span className="font-semibold lao-font text-right">
                          {selectedBill.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Info */}
                  <div>
                    <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                      <Zap size={20} />
                      ຂໍ້ມູນການໃຊ້ໄຟ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເດືອນ:</span>
                        <span className="font-semibold lao-font">
                          {selectedBill.billMonth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເລກມິເຕີກ່ອນໜ້າ:</span>
                        <span className="font-semibold">
                          {selectedBill.previousReading} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ເລກມິເຕີປັດຈຸບັນ:</span>
                        <span className="font-semibold">
                          {selectedBill.currentReading} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ຈຳນວນໃຊ້:</span>
                        <span className="font-semibold text-blue-600">
                          {selectedBill.consumption} kWh
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600 lao-font">ຈຳນວນເງິນທັງໝົດ:</span>
                        <span className="font-semibold text-[#EF3328] lao-font text-lg">
                          {selectedBill.amount.toLocaleString()} ກີບ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ກຳນົດຊຳລະ:</span>
                        <span className="font-semibold">
                          {selectedBill.dueDate}
                        </span>
                      </div>
                      {selectedBill.paymentDate && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600 lao-font">ວັນທີຊຳລະ:</span>
                            <span className="font-semibold">
                              {selectedBill.paymentDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 lao-font">ວິທີຊຳລະ:</span>
                            <span className="font-semibold lao-font">
                              {getPaymentMethodLabel(selectedBill.paymentMethod)}
                            </span>
                          </div>
                          {selectedBill.receivedBy && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 lao-font">ຮັບເງິນໂດຍ:</span>
                              <span className="font-semibold lao-font">
                                {selectedBill.receivedBy}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 lao-font">ສະຖານະ:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBill.status
                          )} lao-font`}
                        >
                          {getStatusIcon(selectedBill.status)}
                          {getStatusLabel(selectedBill.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedBill.notes && (
                    <div>
                      <h3 className="font-bold text-gray-700 lao-font mb-3 flex items-center gap-2">
                        <FileText size={20} />
                        ໝາຍເຫດ
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 lao-font">
                          {selectedBill.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md flex items-center justify-center gap-2 lao-font">
                      <Download size={20} />
                      ດາວໂຫຼດບິນ
                    </button>
                    {selectedBill.status === "unpaid" && (
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md flex items-center justify-center gap-2 lao-font">
                        <CreditCard size={20} />
                        ຊຳລະເງິນ
                      </button>
                    )}
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