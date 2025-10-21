import { useState, useEffect } from "react";
import MainLayout from "../MainLayout";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { 
    Download, 
    Calendar, 
    MapPin, 
    Loader2,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Search
} from "lucide-react";
import { Report_Xjaidee_Amount_All } from "../service/authservice";

const PROVINCES = [
  { code: "ALL", name: "ທັງໝົດ" },
  { code: "XKH", name: "ຊຽງຂວາງ" },
  { code: "BOK", name: "ບໍ່ແກ້ວ" },
  { code: "XAY", name: "ໄຊຍະບູລີ" },
  { code: "VTP", name: "ແຂວງວຽງຈັນ" },
  { code: "XSB", name: "ໄຊສົມບູນ" },
  { code: "ATP", name: "ອັດຕະປື" },
  { code: "LNT", name: "ຫຼວງນ້ຳທາ" },
  { code: "KMN", name: "ຄຳມ່ວນ" },
  { code: "LPB", name: "ຫຼວງພະບາງ" },
  { code: "HUP", name: "ຫົວພັນ" },
  { code: "SLV", name: "ສາລະວັນ" },
  { code: "UDX", name: "ອຸດົມໄຊ" },
  { code: "XEK", name: "ເຊກອງ" },
  { code: "PSL", name: "ຜົ້ງສາລີ" },
  { code: "BOL", name: "ບໍລິຄຳໄຊ" },
  { code: "CPS", name: "ຈຳປາສັກ" },
  { code: "SVK", name: "ສະຫວັນນະເຂດ" },
  { code: "VTE", name: "ນະຄອນຫຼວງວຽງຈັນ" },
  { code: "LMM", name: "ຫຼວງນ້ຳທາ" },
  { code: "VIP", name: "ວຽງຈັນ" }
];

const normalizeDate = (v: string): string => {
  if (!v) return "";
  if (typeof v === "string" && v.includes("/")) {
    const [dd, mm, yyyy] = v.split("/");
    if (dd && mm && yyyy)
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return v;
};

const getProvinceName = (code: string): string => {
  const province = PROVINCES.find(p => p.code === code);
  return province ? province.name : code;
};

const toRowArray = (res: unknown): Record<string, unknown>[] => {
  if (res == null) return [];
  const asObj = res as Record<string, unknown>;
  const maybeData = asObj.data as unknown;
  const d = (maybeData && (maybeData as Record<string, unknown>).data) ?? asObj.data;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === "object") return [d as Record<string, unknown>];
  return [];
};

export default function AmountAll() {
  type Row = Record<string, unknown>;
  const [rowsAll, setRowsAll] = useState<Row[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15;
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [province, setProvince] = useState<string>("ALL");

  const hasDates = Boolean(startDate && endDate);

  useEffect(() => {
    if (!hasDates) return;
    setIsFetching(true);
    (async () => {
      try {
        const payload = { date_start: startDate, date_end: endDate, province };

        const resAll = await Report_Xjaidee_Amount_All(payload);
        const dataAll = toRowArray(resAll);

        setRowsAll(dataAll);
        setCurrentPage(1);

        console.log("payload:", payload, "all:", dataAll);
      } catch (e) {
        console.error("ເກີດຄວາມຜິດພາດໃນການດຶງຂໍ້ມູນ:", e);
        setRowsAll([]);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [hasDates, startDate, endDate, province]);

  const totalPages = Math.max(1, Math.ceil(rowsAll.length / rowsPerPage));
  const idxLast = currentPage * rowsPerPage;
  const idxFirst = idxLast - rowsPerPage;
  const currentRows = rowsAll.slice(idxFirst, idxLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleExport = async () => {
    if (rowsAll.length === 0) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ລາຍງານເງິນເດືອນ');

    if (rowsAll.length === 0) return;

    const headers = Object.keys(rowsAll[0]);
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Noto Sans Lao', size: 12, bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDC2626" },
      };
      cell.font.color = { argb: "FFFFFFFF" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    rowsAll.forEach((r) =>
      worksheet.addRow(
        Object.values(r).map((v) =>
          typeof v === "number" ? v.toLocaleString("de-DE") : v
        )
      )
    );

    worksheet.columns.forEach((c) => {
      c.width = Math.min(40, Math.max(12, c.header?.toString().length || 20));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const provinceName = PROVINCES.find(p => p.code === province)?.name || province;
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `ລາຍງານ_ເງິນເດືອນ_${provinceName}_${startDate}_ຫາ_${endDate}.xlsx`
    );
  };

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
                <BarChart3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 lao-font">
                  ລາຍງານເງິນເດືອນ Xjaidee
                </h1>
                <p className="text-gray-600 text-sm lao-font">ລະບົບລາຍງານຕາມແຂວງ</p>
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
                    setCurrentPage(1);
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
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                />
              </div>

              {/* Province */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors bg-white lao-font appearance-none"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExport}
                disabled={!hasDates || rowsAll.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 lao-font"
              >
                <Download size={20} />
                ສົ່ງອອກ Excel
              </button>
            </div>

            {/* Info Bar */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span className="lao-font">ທັງໝົດ: <span className="font-semibold text-gray-800">{rowsAll.length}</span> ລາຍການ</span>
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
              {/* Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-600 to-red-700">
                        <th className="px-4 py-4 text-center text-sm font-bold text-white lao-font">
                          ລຳດັບ
                        </th>
                        {currentRows[0] && Object.keys(currentRows[0]).map((key) => (
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
                      {currentRows.length > 0 ? (
                        currentRows.map((row, i) => {
                          const headerKeys = Object.keys(row);
                          return (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="px-4 py-4 text-center font-medium text-gray-700 lao-font">
                                {idxFirst + i + 1}
                              </td>
                              {headerKeys.map((key, idx) => {
                                const val = row[key];
                                const isNum = typeof val === "number";
                                let cls = "px-4 py-4 text-center font-medium lao-font ";
                                cls += isNum ? "text-blue-600" : "text-gray-700";
                                if (String(key).toLowerCase().includes("date")) cls += " text-green-600";
                                if (key === "remaining" && isNum && val > 0) cls += " text-red-600 font-bold";
                                
                                // Convert province code to Lao name
                                const displayValue = key.toLowerCase() === "province" 
                                  ? getProvinceName(String(val ?? ""))
                                  : (isNum ? val.toLocaleString("de-DE") : String(val ?? ""));
                                
                                return (
                                  <td key={idx} className={cls}>
                                    {displayValue}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={100} className="text-center py-12">
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