// src/pages/report.tsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import axios, { AxiosError } from "axios";
import {
  Search,
  Download,
  Filter,
  FileText,

  Eye,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

type LogWebMmoney = {
  id: number;
  tranid: string | null;
  bank: string | null;
  amount: string | null; // varchar in DB
  type: string | null;
  msisdn: string | null;
  created: string | null; // varchar in DB (timestamp string)
  tranid_packages: string | null;
};

type ReportMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  filters: {
    q: string;
    bank: string;
    type: string;
    dateFrom: string;
    dateTo: string;
  };
};

type ReportStats = {
  total: number;
  totalAmount: number;
  uniqueMsisdn: number;
};

type ReportResponse = {
  success: boolean;
  data: LogWebMmoney[];
  meta: ReportMeta;
  stats: ReportStats;
  message?: string;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function safeNumber(v?: string | null) {
  if (!v) return 0;
  const cleaned = v.toString().replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);

  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? "" : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  return lines.join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message || ax.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function Report() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // server data
  const [logs, setLogs] = useState<LogWebMmoney[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBank, setFilterBank] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // sort
  const [sortField, setSortField] = useState<keyof LogWebMmoney>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // pagination (server-side)
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // stats from server
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    totalAmount: 0,
    uniqueMsisdn: 0,
  });

  // detail modal
  const [selected, setSelected] = useState<LogWebMmoney | null>(null);

  // debounce for search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchLogs(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterBank, filterType, dateFrom, dateTo, sortField, sortDirection]);

  // initial load
  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async (pageToLoad = page) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("q", searchTerm);
      params.set("bank", filterBank);
      params.set("type", filterType);
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
      params.set("page", String(pageToLoad));
      params.set("limit", String(limit));
      params.set("sortBy", String(sortField));
      params.set("sortDir", sortDirection);

      const res = await axios.get<ReportResponse>(`${API}/reports/log-web-mmoney?${params.toString()}`);

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to load report");
        setLogs([]);
        return;
      }

      setLogs(Array.isArray(res.data.data) ? res.data.data : []);
      setTotal(res.data.meta?.total ?? 0);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setStats(res.data.stats ?? { total: 0, totalAmount: 0, uniqueMsisdn: 0 });

      setPage(pageToLoad);
    } catch (error: unknown) {
      console.error("fetchLogs error:", error);
      toast.error(getErrorMessage(error, "Failed to load report data"));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const banks = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => {
      if (l.bank) s.add(l.bank);
    });
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const types = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => {
      if (l.type) s.add(l.type);
    });
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const handleSort = (field: keyof LogWebMmoney) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = async () => {
    try {
      // ✅ server export (best)
      const params = new URLSearchParams();
      params.set("q", searchTerm);
      params.set("bank", filterBank);
      params.set("type", filterType);
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
      params.set("sortBy", String(sortField));
      params.set("sortDir", sortDirection);

      // download via browser
      window.open(`${API}/reports/log-web-mmoney/export?${params.toString()}`, "_blank");

      toast.success("Export CSV ກຳລັງດາວໂຫຼດ...");
    } catch (error: unknown) {
      // fallback client export
      console.error("export error:", error);
      toast.error(getErrorMessage(error, "Export failed, using local export"));

      if (!logs.length) return;

      const rows = logs.map((l) => ({
        id: l.id,
        tranid: l.tranid,
        bank: l.bank,
        amount: l.amount,
        type: l.type,
        msisdn: l.msisdn,
        created: l.created,
        tranid_packages: l.tranid_packages,
      }));

      const csv = toCSV(rows as Record<string, unknown>[]);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadTextFile(`Report_mmoney_${stamp}.csv`, csv);
    }
  };

  // today count is not returned by API (optional), so we compute from current page only
 
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <Sidebar onToggle={setSidebarOpen} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="ລາຍງານ" />

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຈຳນວນທັງໝົດ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-[#EF3328]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">ຍອດລວມ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">
                    {Number(stats.totalAmount || 0).toLocaleString()} ກີບ
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Filter size={24} className="text-green-600" />
                </div>
              </div>
            </div>

          

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm lao-font">MSISDN ບໍ່ຊ້ຳ</p>
                  <p className="text-2xl font-bold text-[#140F36] lao-font">{stats.uniqueMsisdn}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາ: tranid, msisdn, bank, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  />
                </div>

                {/* Bank */}
                <select
                  value={filterBank}
                  onChange={(e) => setFilterBank(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                >
                  {banks.map((b) => (
                    <option key={b} value={b}>
                      {b === "all" ? "ທະນາຄານທັງໝົດ" : b}
                    </option>
                  ))}
                </select>

                {/* Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "ປະເພດທັງໝົດ" : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 lao-font"
                >
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => fetchLogs(page)}
                  className="px-4 py-2 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 lao-font"
                >
                  <FileText size={20} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Date range */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 lao-font">ວັນທີເລີ່ມ:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 lao-font">ຫາ:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBank("all");
                  setFilterType("all");
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                  fetchLogs(1);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors lao-font self-start"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3328]"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white">
                      <tr>
                        {(
                          [
                            ["id", "ID"],
                            ["tranid", "TranID"],
                            ["bank", "Bank"],
                            ["amount", "Amount"],
                            ["type", "Type"],
                            ["msisdn", "MSISDN"],
                            ["created", "Created"],
                            ["tranid_packages", "TranID Packages"],
                          ] as Array<[keyof LogWebMmoney, string]>
                        ).map(([field, label]) => (
                          <th key={String(field)} className="px-6 py-4 text-left text-sm font-semibold lao-font">
                            <button
                              onClick={() => handleSort(field)}
                              className="flex items-center gap-2 hover:text-white/80"
                            >
                              {label}
                              {sortField === field &&
                                (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </button>
                          </th>
                        ))}
                        <th className="px-6 py-4 text-center text-sm font-semibold lao-font">ເບິ່ງ</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-lg lao-font">ບໍ່ພົບຂໍ້ມູນ</p>
                          </td>
                        </tr>
                      ) : (
                        logs.map((l) => (
                          <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-[#140F36] font-semibold">{l.id}</td>
                            <td className="px-6 py-4 text-gray-700">{l.tranid || "-"}</td>
                            <td className="px-6 py-4 text-gray-700">{l.bank || "-"}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-[#140F36] lao-font">
                                {safeNumber(l.amount).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{l.type || "-"}</td>
                            <td className="px-6 py-4 text-gray-700">{l.msisdn || "-"}</td>
                            <td className="px-6 py-4 text-gray-700">{l.created || "-"}</td>
                            <td className="px-6 py-4 text-gray-700">{l.tranid_packages || "-"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => setSelected(l)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="ລາຍລະອຽດ"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (server) */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-600 lao-font">
                    ສະແດງ {logs.length} ຈາກ {total} ລາຍການ
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchLogs(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-3 py-2 rounded-lg border lao-font ${
                        page === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      ກ່ອນໜ້າ
                    </button>

                    <span className="text-sm text-gray-700 lao-font">
                      ໜ້າ {page} / {totalPages}
                    </span>

                    <button
                      onClick={() => fetchLogs(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className={`px-3 py-2 rounded-lg border lao-font ${
                        page >= totalPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      ຖັດໄປ
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white lao-font">ລາຍລະອຽດ Log</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    ["ID", selected.id],
                    ["TranID", selected.tranid],
                    ["Bank", selected.bank],
                    ["Amount", safeNumber(selected.amount).toLocaleString()],
                    ["Type", selected.type],
                    ["MSISDN", selected.msisdn],
                    ["Created", selected.created],
                    ["TranID Packages", selected.tranid_packages],
                  ] as Array<[string, unknown]>
                ).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 lao-font">{k}</p>
                    <p className="text-sm font-semibold text-[#140F36] break-all">{(v ?? "-") as string}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setSelected(null)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 lao-font"
                >
                  ປິດ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
