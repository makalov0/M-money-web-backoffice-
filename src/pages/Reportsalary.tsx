import { useState, useEffect } from "react";
import {
  Report_Xjaidee_All,
  Report_Xjaidee_Paid,
} from "../service/authservice";
import MainLayout from "../MainLayout";
import * as ExcelJS from "exceljs";
import * as FileSaver from "file-saver";
import {
  Download,
  Calendar,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

const normalizeDate = (v: string): string => {
  if (!v) return "";
  if (v.includes("/")) {
    const [dd, mm, yyyy] = v.split("/");
    if (dd && mm && yyyy)
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return v;
};

export default function ReportSalary() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employeesAll, setEmployeesAll] = useState<Record<string, unknown>[]>([]);
  const [employeesPaid, setEmployeesPaid] = useState<Record<string, unknown>[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "paid">("all");

  const rowsPerPage = 15;
  const [currentPageAll, setCurrentPageAll] = useState<number>(1);
  const [currentPagePaid, setCurrentPagePaid] = useState<number>(1);

  const hasDates = Boolean(startDate && endDate);

  useEffect(() => {
    if (!hasDates) return;

    setIsFetching(true);
    (async () => {
      try {
        const resAll: unknown = await Report_Xjaidee_All({ date_start: startDate, date_end: endDate });
        const resPaid: unknown = await Report_Xjaidee_Paid({ date_start: startDate, date_end: endDate });

        const extractArray = (res: unknown): Record<string, unknown>[] => {
          const top = (res as unknown as { data?: unknown }).data;
          if (Array.isArray(top)) return top as Record<string, unknown>[];
          if (top && typeof top === "object") {
            const inner = (top as unknown as { data?: unknown }).data;
            if (Array.isArray(inner)) return inner as Record<string, unknown>[];
          }
          return [];
        };

        const dataAll = extractArray(resAll);
        const dataPaid = extractArray(resPaid);

        setEmployeesAll(dataAll);
        setEmployeesPaid(dataPaid);

        setCurrentPageAll(1);
        setCurrentPagePaid(1);
      } catch (e) {
        console.error("Error fetching data:", e);
        setEmployeesAll([]);
        setEmployeesPaid([]);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [hasDates, startDate, endDate]);

  const filterData = (list: Record<string, unknown>[]): Record<string, unknown>[] =>
    Array.isArray(list)
      ? list.filter((emp) =>
          Object.values(emp).some((val) => {
            const raw = String(val ?? "").toLowerCase();
            const formatted =
              typeof val === "number"
                ? (val as number).toLocaleString("de-DE").toLowerCase()
                : raw;
            const q = searchTerm.toLowerCase();
            return raw.includes(q) || formatted.includes(q);
          })
        )
      : [];

  const filteredAll = filterData(employeesAll);
  const filteredPaid = filterData(employeesPaid);

  const totalPagesAll = Math.max(1, Math.ceil(filteredAll.length / rowsPerPage));
  const indexOfLastRowAll = currentPageAll * rowsPerPage;
  const indexOfFirstRowAll = indexOfLastRowAll - rowsPerPage;
  const currentRowsAll = filteredAll.slice(indexOfFirstRowAll, indexOfLastRowAll);

  const totalPagesPaid = Math.max(1, Math.ceil(filteredPaid.length / rowsPerPage));
  const indexOfLastRowPaid = currentPagePaid * rowsPerPage;
  const indexOfFirstRowPaid = indexOfLastRowPaid - rowsPerPage;
  const currentRowsPaid = filteredPaid.slice(indexOfFirstRowPaid, indexOfLastRowPaid);

  const handlePrev = () => {
    if (activeTab === "all") setCurrentPageAll((p) => Math.max(1, p - 1));
    else setCurrentPagePaid((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    if (activeTab === "all")
      setCurrentPageAll((p) => Math.min(totalPagesAll, p + 1));
    else setCurrentPagePaid((p) => Math.min(totalPagesPaid, p + 1));
  };

  const handleExport = async () => {
    if (employeesAll.length === 0 && employeesPaid.length === 0) return;

    const workbook = new ExcelJS.Workbook();

    const addSheet = (name: string, rows: Record<string, unknown>[]) => {
      if (!rows.length) return;
      const sheet = workbook.addWorksheet(name);
      const headers = Object.keys(rows[0]);
      const headerRow = sheet.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = { name: "Noto Sans Lao", bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: name === "ຂໍ້ມູນທັງໝົດ" ? "FFDC2626" : "FF22c55e" },
        } as ExcelJS.Fill;
        const alignment: Partial<ExcelJS.Alignment> = { horizontal: "center", vertical: "middle" };
        cell.alignment = alignment;
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rows.forEach((r) =>
        sheet.addRow(
          Object.values(r).map((v) =>
            typeof v === "number" ? (v as number).toLocaleString("de-DE") : String(v ?? "")
          )
        )
      );
      sheet.columns.forEach((c) => (c.width = 20));
    };

    addSheet("ຂໍ້ມູນທັງໝົດ", employeesAll);
    addSheet("ຂໍ້ມູນທີ່ຈ່າຍແລ້ວ", employeesPaid);

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `ລາຍງານ_${startDate}_ຫາ_${endDate}.xlsx`
    );
  };

  const renderTable = (rows: Record<string, unknown>[], startIndex: number, headerKeys: string[]) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 to-red-700">
              <th className="px-4 py-4 text-center text-sm font-bold text-white lao-font">
                ລຳດັບ
              </th>
              {headerKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-4 text-center text-sm font-bold text-white lao-font"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-4 text-center font-medium text-gray-700 lao-font">
                    {startIndex + i + 1}
                  </td>

                  {headerKeys.map((key, idx) => {
                    const val = row[key];
                    const isNum = typeof val === "number";
                    let cls = "px-4 py-4 text-center font-medium lao-font ";
                    cls += isNum ? "text-blue-600" : "text-gray-700";
                    if (String(key).toLowerCase().includes("date"))
                      cls += " text-green-600";
                    if (key === "remaining" && isNum && (val as number) > 0)
                      cls += " text-red-600 font-bold";

                    return (
                      <td key={idx} className={cls}>
                        {isNum
                          ? (val as number).toLocaleString("de-DE")
                          : String(val ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headerKeys.length + 1}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center">
                    <Search className="text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500 font-medium lao-font">
                      ບໍ່ພົວຂໍ້ມູນທີ່ຄົ້ນຫາ
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const isAll = activeTab === "all";
  const currentRows = isAll ? currentRowsAll : currentRowsPaid;
  const totalPages = isAll ? totalPagesAll : totalPagesPaid;
  const currentPage = isAll ? currentPageAll : currentPagePaid;
  const pageStartIndex = isAll ? indexOfFirstRowAll : indexOfFirstRowPaid;
  const headerKeys = isAll
    ? employeesAll[0]
      ? Object.keys(employeesAll[0])
      : []
    : employeesPaid[0]
    ? Object.keys(employeesPaid[0])
    : [];

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 pt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 lao-font">
                  ລາຍງານ Xjaidee
                </h1>
                <p className="text-gray-600 text-sm lao-font">ລະບົບລາຍງານຂໍ້ມູນ Xjaidee ທັງໝົດ</p>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Start Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(normalizeDate(e.target.value));
                    setCurrentPageAll(1);
                    setCurrentPagePaid(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                />
              </div>

              {/* End Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(normalizeDate(e.target.value));
                    setCurrentPageAll(1);
                    setCurrentPagePaid(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຕາມຫຼາກຫຼາຍດ້ານ..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPageAll(1);
                    setCurrentPagePaid(1);
                  }}
                />
              </div>
            </div>

            {/* Action Button + Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <button
                onClick={handleExport}
                disabled={!hasDates || (employeesAll.length === 0 && employeesPaid.length === 0)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 lao-font"
              >
                <Download size={20} />
                ສົ່ງອອກ Excel
              </button>

              <div className="flex gap-2 ml-auto w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 lao-font ${
                    activeTab === "all"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ຂໍ້ມູນທັງໝົດ
                </button>
                <button
                  onClick={() => setActiveTab("paid")}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 lao-font ${
                    activeTab === "paid"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ຂໍ້ມູນທີ່ຈ່າຍແລ້ວ
                </button>
              </div>
            </div>

            {/* Info Bar */}
            <div className="mt-3 text-sm text-gray-600 lao-font">
              ທັງໝົດ: <span className="font-semibold text-gray-800">{currentRows.length}</span> ລາຍການ
            </div>
          </div>

          {/* Content */}
          {!hasDates ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
              <Calendar className="text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium lao-font">ກະລຸນາເລືອກວັນທີເພື່ອເບິ່ງຂໍ້ມູນ</p>
            </div>
          ) : isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
              <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
              <p className="text-gray-600 font-medium lao-font">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
            </div>
          ) : (
            <>
              {renderTable(currentRows, pageStartIndex, headerKeys)}

              {/* Pagination */}
              <div className="bg-white rounded-2xl shadow-lg p-5 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 lao-font"
                  >
                    <ChevronLeft size={20} />
                    ກ່ອນໜ້າ
                  </button>

                  <div className="flex items-center gap-2 lao-font">
                    <span className="text-sm text-gray-600">ໜ້າທີ່</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl min-w-[50px] text-center">
                      {currentPage}
                    </span>
                    <span className="text-sm text-gray-600">ຈາກ</span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl min-w-[50px] text-center">
                      {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 lao-font"
                  >
                    ຕໍ່ໄປ
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 lao-font">
                  © 2025 Lao Telecom - ເຊື່ອມຕໍ່ທຸກຄົນ ເຊື່ອມຕໍ່ອະນາຄົດ
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}