import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Wifi,
  Globe,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  CreditCard,
  Calendar,
  MapPin,
} from "lucide-react";

interface ESIMTransaction {
  id: number;
  customerName: string;
  email: string;
  package: string;
  country: string;
  dataAmount: string;
  validity: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
  time: string;
  transactionId: string;
}

export default function ESIMService() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const countries = [
    { id: "thailand", name: "ປະເທດໄທ", flag: "🇹🇭" },
    { id: "vietnam", name: "ປະເທດຫວຽດນາມ", flag: "🇻🇳" },
    { id: "china", name: "ປະເທດຈີນ", flag: "🇨🇳" },
    { id: "japan", name: "ປະເທດຍີ່ປຸ່ນ", flag: "🇯🇵" },
    { id: "korea", name: "ປະເທດເກົາຫຼີ", flag: "🇰🇷" },
    { id: "singapore", name: "ປະເທດສິງກະໂປ", flag: "🇸🇬" },
  ];

  const packages = [
    {
      id: "1gb-7days",
      name: "1GB - 7 ມື້",
      data: "1GB",
      validity: "7 ມື້",
      price: 50000,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "3gb-15days",
      name: "3GB - 15 ມື້",
      data: "3GB",
      validity: "15 ມື້",
      price: 120000,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "5gb-30days",
      name: "5GB - 30 ມື້",
      data: "5GB",
      validity: "30 ມື້",
      price: 200000,
      color: "from-green-500 to-green-600",
    },
    {
      id: "10gb-30days",
      name: "10GB - 30 ມື້",
      data: "10GB",
      validity: "30 ມື້",
      price: 350000,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const [transactions, setTransactions] = useState<ESIMTransaction[]>([
    {
      id: 1,
      customerName: "ນາງ ສົມຈິດ",
      email: "somjit@example.com",
      package: "5GB - 30 ມື້",
      country: "ປະເທດໄທ",
      dataAmount: "5GB",
      validity: "30 ມື້",
      amount: 200000,
      status: "success",
      date: "2025-11-23",
      time: "14:30",
      transactionId: "ESIM001234",
    },
    {
      id: 2,
      customerName: "ທ້າວ ບຸນມີ",
      email: "bounmy@example.com",
      package: "3GB - 15 ມື້",
      country: "ປະເທດຫວຽດນາມ",
      dataAmount: "3GB",
      validity: "15 ມື້",
      amount: 120000,
      status: "success",
      date: "2025-11-23",
      time: "13:15",
      transactionId: "ESIM001235",
    },
    {
      id: 3,
      customerName: "ນາງ ແສງດາວ",
      email: "saengdao@example.com",
      package: "10GB - 30 ມື້",
      country: "ປະເທດຍີ່ປຸ່ນ",
      dataAmount: "10GB",
      validity: "30 ມື້",
      amount: 350000,
      status: "pending",
      date: "2025-11-23",
      time: "12:45",
      transactionId: "ESIM001236",
    },
    {
      id: 4,
      customerName: "ທ້າວ ພູມໃຈ",
      email: "phoumjai@example.com",
      package: "1GB - 7 ມື້",
      country: "ປະເທດຈີນ",
      dataAmount: "1GB",
      validity: "7 ມື້",
      amount: 50000,
      status: "failed",
      date: "2025-11-23",
      time: "11:20",
      transactionId: "ESIM001237",
    },
  ]);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePurchase = () => {
    if (!customerName || !email || !selectedPackage || !selectedCountry) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    const selectedPkg = packages.find((p) => p.id === selectedPackage);
    const selectedCtry = countries.find((c) => c.id === selectedCountry);

    if (!selectedPkg || !selectedCtry) return;

    const newTransaction: ESIMTransaction = {
      id: transactions.length + 1,
      customerName,
      email,
      package: selectedPkg.name,
      country: selectedCtry.name,
      dataAmount: selectedPkg.data,
      validity: selectedPkg.validity,
      amount: selectedPkg.price,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("lo-LA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transactionId: `ESIM${String(transactions.length + 1).padStart(6, "0")}`,
    };

    setTransactions([newTransaction, ...transactions]);
    setCustomerName("");
    setEmail("");
    setSelectedPackage("");
    setSelectedCountry("");
    setShowPurchaseForm(false);

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
        <Navbar title="ບໍລິການ eSIM" />

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
                  <Wifi size={24} className="text-blue-600" />
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
                  <CreditCard size={24} className="text-[#EF3328]" />
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                ຊື້ແພັກເກັດ eSIM
              </h2>
              <button
                onClick={() => setShowPurchaseForm(!showPurchaseForm)}
                className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-lg hover:shadow-lg transition-all duration-300 lao-font"
              >
                {showPurchaseForm ? "ປິດແບບຟອມ" : "ຊື້ eSIM"}
              </button>
            </div>

            {showPurchaseForm && (
              <div className="space-y-6">
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 lao-font">
                    ເລືອກປະເທດປາຍທາງ
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => setSelectedCountry(country.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedCountry === country.id
                            ? "border-[#EF3328] bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-4xl mb-2">{country.flag}</div>
                        <p className="text-center font-semibold text-[#140F36] lao-font">
                          {country.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 lao-font">
                    ເລືອກແພັກເກັດ
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedPackage === pkg.id
                            ? "border-[#EF3328] bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white font-bold text-xl`}
                        >
                          {pkg.data}
                        </div>
                        <p className="text-center font-semibold text-[#140F36] mb-2 lao-font">
                          {pkg.name}
                        </p>
                        <p className="text-center text-[#EF3328] font-bold lao-font">
                          {pkg.price.toLocaleString()} ກີບ
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ຊື່ລູກຄ້າ
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ປ້ອນຊື່ຂອງທ່ານ"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 lao-font">
                      ອີເມວ
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328]"
                      required
                    />
                  </div>
                </div>

                {/* Summary */}
                {selectedPackage && selectedCountry && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="font-bold text-[#140F36] mb-4 lao-font">
                      ສະຫຼຸບການສັ່ງຊື້
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 lao-font flex items-center gap-2">
                          <MapPin size={16} />
                          ປະເທດ:
                        </span>
                        <span className="font-semibold lao-font">
                          {countries.find((c) => c.id === selectedCountry)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 lao-font flex items-center gap-2">
                          <Globe size={16} />
                          ແພັກເກັດ:
                        </span>
                        <span className="font-semibold lao-font">
                          {packages.find((p) => p.id === selectedPackage)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 lao-font flex items-center gap-2">
                          <Calendar size={16} />
                          ໄລຍະເວລາ:
                        </span>
                        <span className="font-semibold lao-font">
                          {packages.find((p) => p.id === selectedPackage)?.validity}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-[#140F36] lao-font">
                            ລາຄາລວມ:
                          </span>
                          <span className="text-2xl font-bold text-[#EF3328] lao-font">
                            {packages
                              .find((p) => p.id === selectedPackage)
                              ?.price.toLocaleString()}{" "}
                            ກີບ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handlePurchase}
                  className="w-full py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold lao-font"
                >
                  ຢືນຢັນການຊື້
                </button>
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#140F36] lao-font">
                  ປະຫວັດການສັ່ງຊື້
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
                      ຊື່ລູກຄ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ອີເມວ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      ປະເທດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lao-font">
                      แພັກເກັດ
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
                        {txn.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {txn.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {txn.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 lao-font">
                        {txn.package}
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