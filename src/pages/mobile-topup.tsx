import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Smartphone,
  DollarSign,
  Search,
  
  CheckCircle,
  Clock,
  XCircle,
  Download
} from "lucide-react";

interface TopupTransaction {
  id: number;
  phoneNumber: string;
  customerName: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
  time: string;
  operator: "unitel" | "etl" | "laotel" | "beeline";
  transactionId: string;
}

export default function MobileTopup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showTopupForm, setShowTopupForm] = useState(false);

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  const operators = [
    { id: "unitel", name: "Unitel", color: "from-red-500 to-red-600" },
    { id: "etl", name: "ETL", color: "from-blue-500 to-blue-600" },
    { id: "laotel", name: "LaoTel", color: "from-green-500 to-green-600" },
    { id: "beeline", name: "Beeline", color: "from-yellow-500 to-yellow-600" },
  ];

  const [transactions, setTransactions] = useState<TopupTransaction[]>([
    {
      id: 1,
      phoneNumber: "020 5555 1234",
      customerName: "ນາງ ສົມຈິດ",
      amount: 50000,
      status: "success",
      date: "2025-11-23",
      time: "14:30",
      operator: "unitel",
      transactionId: "TXN001234",
    },
    {
      id: 2,
      phoneNumber: "020 7777 5678",
      customerName: "ທ້າວ ບຸນມີ",
      amount: 100000,
      status: "success",
      date: "2025-11-23",
      time: "13:15",
      operator: "etl",
      transactionId: "TXN001235",
    },
    {
      id: 3,
      phoneNumber: "030 9999 8765",
      customerName: "ນາງ ແສງດາວ",
      amount: 20000,
      status: "pending",
      date: "2025-11-23",
      time: "12:45",
      operator: "laotel",
      transactionId: "TXN001236",
    },
    {
      id: 4,
      phoneNumber: "020 4444 3210",
      customerName: "ທ້າວ ພູມໃຈ",
      amount: 50000,
      status: "failed",
      date: "2025-11-23",
      time: "11:20",
      operator: "beeline",
      transactionId: "TXN001237",
    },
  ]);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !amount || !selectedOperator) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    const newTransaction: TopupTransaction = {
      id: transactions.length + 1,
      phoneNumber,
      customerName: "ລູກຄ້າໃໝ່",
      amount: parseInt(amount),
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("lo-LA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      operator: selectedOperator as "unitel" | "etl" | "laotel" | "beeline",
      transactionId: `TXN${String(transactions.length + 1).padStart(6, "0")}`,
    };

    setTransactions([newTransaction, ...transactions]);
    setPhoneNumber("");
    setAmount("");
    setSelectedOperator("");
    setShowTopupForm(false);

    // Simulate transaction processing
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.id === newTransaction.id ? { ...txn, status: "success" } : txn
        )
      );
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "failed":
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "ສຳເລັດ";
      case "pending":
        return "ກຳລັງດຳເນີນການ";
      case "failed":
        return "ລົ້ມເຫລວ";
      default:
        return status;
    }
  };

  const getOperatorLabel = (operator: string) => {
    const op = operators.find((o) => o.id === operator);
    return op ? op.name : operator;
  };

  const totalSuccess = transactions.filter((t) => t.status === "success").length;
  const totalPending = transactions.filter((t) => t.status === "pending").length;
  const totalAmount = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

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
        <Navbar title="ເຕີມເງິນມືຖື" />

        {/* Page Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {transactions.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ສຳເລັດ</p>
                  <p className="text-2xl font-bold text-green-600 lao-font">
                    {totalSuccess}
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
                  <p className="text-gray-600 text-sm lao-font">ກຳລັງດຳເນີນການ</p>
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

          {/* Topup Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                ເຕີມເງິນມືຖື
              </h2>
              <button
                onClick={() => setShowTopupForm(!showTopupForm)}
                className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all duration-300 lao-font"
              >
                {showTopupForm ? "ປິດແບບຟອມ" : "ເຕີມເງິນ"}
              </button>
            </div>

            {showTopupForm && (
              <form onSubmit={handleTopup} className="space-y-6">
                {/* Operator Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 lao-font">
                    ເລືອກເຄືອຂ່າຍ
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {operators.map((operator) => (
                      <button
                        key={operator.id}
                        type="button"
                        onClick={() => setSelectedOperator(operator.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedOperator === operator.id
                            ? "border-[#EF3328] bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${operator.color} flex items-center justify-center text-white font-bold`}
                        >
                          {operator.name.charAt(0)}
                        </div>
                        <p className="text-center font-semibold text-[#140F36]">
                          {operator.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ເບີໂທລະສັບ
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="020 XXXX XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                {/* Quick Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 lao-font">
                    ເລືອກຈຳນວນເງິນ
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 lao-font font-semibold ${
                          amount === amt.toString()
                            ? "border-[#EF3328] bg-red-50 text-[#EF3328]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {amt.toLocaleString()} ກີບ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                    ຫຼືປ້ອນຈຳນວນເງິນເອງ
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ປ້ອນຈຳນວນເງິນ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold lao-font"
                >
                  ຢືນຢັນການເຕີມເງິນ
                </button>
              </form>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                  ປະຫວັດການເຕີມເງິນ
                </h2>

                <div className="flex gap-2">
                  {/* Search */}
                  <div className="relative flex-1 md:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  >
                    <option value="all">ທັງໝົດ</option>
                    <option value="success">ສຳເລັດ</option>
                    <option value="pending">ກຳລັງດຳເນີນການ</option>
                    <option value="failed">ລົ້ມເຫລວ</option>
                  </select>

                  {/* Export */}
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ລະຫັດທຸລະກຳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ເບີໂທ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ຊື່ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ເຄືອຂ່າຍ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ຈຳນວນເງິນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ວັນທີ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ສະຖານະ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#140F36]">
                        {txn.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {txn.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {txn.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getOperatorLabel(txn.operator)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#EF3328] lao-font">
                        {txn.amount.toLocaleString()} ກີບ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 lao-font">
                        {txn.date} {txn.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            txn.status
                          )} lao-font`}
                        >
                          {getStatusIcon(txn.status)}
                          {getStatusLabel(txn.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}