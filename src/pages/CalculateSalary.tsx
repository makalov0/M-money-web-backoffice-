import React, { useState, useEffect } from 'react';
import { SalaryCut } from '../service/authservice';
import MainLayout from '../MainLayout';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { 
    Search, 
    Calculator, 
    ChevronLeft, 
    ChevronRight, 
    Loader2,
    Upload,
    FileSpreadsheet,
    Download,
    Calendar
} from 'lucide-react';

interface Employee {
    tran_id: string;
    emp_id: string;
    msisdn: string;
    credit_id: string;
    payment_date: string;
    amount: number;
    interest: number;
}

export default function CalculateSalary(): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [dateCut, setDateCut] = useState<string>('');
    const rowsPerPage = 15;
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!dateCut) return;
            
            setLoading(true);
            try {
                const response = await SalaryCut({ date_cut: dateCut });
                const data = response?.data;
                
                if (Array.isArray(data)) {
                    const validEmployees: Employee[] = data
                        .filter((item: unknown) => {
                            const emp = item as Partial<Employee>;
                            return emp.emp_id && emp.msisdn;
                        })
                        .map((item: unknown) => {
                            const emp = item as Partial<Employee>;
                            return {
                                tran_id: String(emp.tran_id || ''),
                                emp_id: String(emp.emp_id || ''),
                                msisdn: String(emp.msisdn || ''),
                                credit_id: String(emp.credit_id || ''),
                                payment_date: String(emp.payment_date || ''),
                                amount: Number(emp.amount || 0),
                                interest: Number(emp.interest || 0)
                            };
                        });
                    setEmployees(validEmployees);
                } else {
                    setEmployees([]);
                }
            } catch (error) {
                console.error("Error fetching employee data:", error);
                await Swal.fire({
                    title: 'ເກີດຂໍ້ຜິດພາດ',
                    text: 'ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້',
                    icon: 'error',
                    confirmButtonText: 'ຕົກລົງ'
                });
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateCut]);

    const filteredEmployees = employees.filter((emp) =>
        Object.values(emp).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!file) {
            await Swal.fire({
                title: 'ບໍ່ມີໄຟລ່',
                text: 'ກະລຸນາເລືອກໄຟລ່ Excel ກ່ອນ',
                icon: 'warning',
                confirmButtonText: 'ຕົກລົງ',
                customClass: { popup: 'rounded-lg' }
            });
            return;
        }

        const xjaideeMapping: Record<string, number> = {};
        filteredEmployees.forEach(emp => {
            const key = `${emp.emp_id}_${String(emp.msisdn).trim()}`;
            const xjaideeValue = emp.amount + emp.interest;
            xjaideeMapping[key] = xjaideeValue;
        });

        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();

        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            await workbook.xlsx.load(arrayBuffer);

            workbook.worksheets.forEach((worksheet) => {
                const headerRow = worksheet.getRow(1);
                let empidCol = 0;
                let msisdnCol = 0;
                let xjaideeCol = 0;

                headerRow.eachCell((cell, colNumber) => {
                    const header = String(cell.value).trim();
                    if (header === "ລະຫັດພະນັກງານ") empidCol = colNumber;
                    if (header === "msisdn" || header === "ເບີໂທລະສັບ") msisdnCol = colNumber;
                    if (header === "xjaidee") xjaideeCol = colNumber;
                });

                if (empidCol === 0 || msisdnCol === 0 || xjaideeCol === 0) {
                    console.warn(`Required columns not found in worksheet "${worksheet.name}"`);
                    return;
                }

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;

                    const empidValue = String(row.getCell(empidCol).value).trim();
                    const msisdnValue = String(row.getCell(msisdnCol).value).trim();
                    const key = `${empidValue}_${msisdnValue}`;

                    if (xjaideeMapping[key] !== undefined) {
                        row.getCell(xjaideeCol).value = xjaideeMapping[key];
                    }
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            saveAs(blob, file.name);

            await Swal.fire({
                title: 'ສຳເລັດ',
                text: 'ປະມວນຜົນແລະສົ່ງອອກສຳເລັດແລ້ວ',
                icon: 'success',
                confirmButtonText: 'ຕົກລົງ'
            });
        };

        reader.readAsArrayBuffer(file);
    };

    const handleExportData = async () => {
        if (filteredEmployees.length === 0) {
            await Swal.fire({
                title: 'ບໍ່ມີຂໍ້ມູນ',
                text: 'ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ',
                icon: 'info',
                confirmButtonText: 'ຕົກລົງ'
            });
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Xjaidee Report');

        const headerRow = worksheet.addRow([
            'ລຳດັບ',
            'ລະຫັດພະນັກງານ',
            'ເບີໂທ',
            'ລະຫັດສິນເຊື່ອ',
            'ວັນທີຊຳລະ',
            'ຈຳນວນເງິນ',
            'ດອກເບ້ຍ',
            'ລວມທັງໝົດ',
        ]);

        headerRow.eachCell((cell) => {
            cell.font = { name: 'Noto Sans Lao', size: 12, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDC2626' }
            };
            cell.font.color = { argb: 'FFFFFFFF' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        filteredEmployees.forEach((emp, index) => {
            const row = worksheet.addRow([
                indexOfFirstRow + index + 1,
                emp.emp_id,
                parseInt(emp.msisdn),
                parseInt(emp.credit_id),
                emp.payment_date,
                emp.amount,
                emp.interest,
                emp.amount + emp.interest,
            ]);

            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Noto Sans Lao', size: 11 };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if ([6, 7, 8].includes(colNumber)) {
                    cell.numFmt = '#,##0';
                }
            });
        });

        worksheet.columns.forEach((column) => {
            column.width = 18;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `Xjaidee_Report_${dateCut || 'all'}.xlsx`);

        await Swal.fire({
            title: 'ສຳເລັດ',
            text: 'ສົ່ງອອກຂໍ້ມູນສຳເລັດແລ້ວ',
            icon: 'success',
            confirmButtonText: 'ຕົກລົງ'
        });
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
                                <Calculator className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 lao-font">
                                    ຄິດໄລ່ສິນເຊື່ອ Xjaidee
                                </h1>
                                <p className="text-gray-600 text-sm lao-font">ລະບົບຄິດໄລ່ສິນເຊື່ອ Xjaidee</p>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Date Picker */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    value={dateCut}
                                    onChange={(e) => {
                                        setDateCut(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                                />
                            </div>

                            {/* Search Field */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="ຄົ້ນຫາຕາມຊື່, ລະຫັດ, ເບີໂທ..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {/* File Upload */}
                            <div className="relative">
                                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 lao-font"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleProcess}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 lao-font"
                            >
                                <FileSpreadsheet size={20} />
                                ປະມວນຜົນແລະສົ່ງອອກ
                            </button>

                            <button
                                onClick={handleExportData}
                                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 lao-font"
                            >
                                <Download size={20} />
                                ສົ່ງອອກຂໍ້ມູນຕາຕະລາງ
                            </button>
                        </div>

                        {/* Info Bar */}
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                            <span className="lao-font">ທັງໝົດ: <span className="font-semibold text-gray-800">{filteredEmployees.length}</span> ລາຍການ</span>
                            {file && (
                                <span className="flex items-center gap-2 text-green-600 lao-font">
                                    <FileSpreadsheet size={16} />
                                    {file.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                            <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
                            <p className="text-gray-600 font-medium lao-font">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
                        </div>
                    ) : !dateCut ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                            <Calendar className="text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium lao-font">ກະລຸນາເລືອກວັນທີເພື່ອເບິ່ງຂໍ້ມູນ</p>
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
                                                {['ລະຫັດພະນັກງານ', 'ເບີໂທ', 'ລະຫັດສິນເຊື່ອ', 'ວັນທີຊຳລະ', 'ຈຳນວນເງິນ', 'ດອກເບ້ຍ', 'ລວມທັງໝົດ'].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className="px-4 py-4 text-center text-sm font-bold text-white lao-font"
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {currentRows.length > 0 ? (
                                                currentRows.map((emp, index) => (
                                                    <tr
                                                        key={emp.tran_id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-4 text-center font-medium text-gray-700">
                                                            {indexOfFirstRow + index + 1}
                                                        </td>
                                                        <td className="px-4 py-4 text-center font-semibold text-red-600">
                                                            {emp.emp_id}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 font-medium">
                                                            {emp.msisdn}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700">
                                                            {emp.credit_id}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 text-sm">
                                                            {emp.payment_date}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-blue-600 font-bold lao-font">
                                                                {emp.amount?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-orange-600 font-bold lao-font">
                                                                {emp.interest?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-red-600 font-bold text-lg lao-font">
                                                                {(emp.amount + emp.interest).toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-12">
                                                        <div className="flex flex-col items-center">
                                                            <Search className="text-gray-300 mb-3" size={48} />
                                                            <p className="text-gray-500 font-medium lao-font">
                                                                ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ
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
                                        onClick={handlePrevPage}
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
                                        onClick={handleNextPage}
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