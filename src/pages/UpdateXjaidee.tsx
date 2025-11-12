import React, { useState, useEffect } from 'react';
import { updateXjaidee, insertXjaidee } from '../service/authservice';
import MainLayout from '../MainLayout';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { 
    Search, 
    Pencil, 
    ChevronLeft, 
    ChevronRight, 
    Loader2,
    Calendar,
    Clock,
    Download,
    Database
} from 'lucide-react';

interface Employee {
    credit_id: string;
    msisdn: string;
    amount: number;
    month_to_repay: number;
    monthly_payment: number;
    interest: number;
}

export default function UpdateXjaidee(): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const rowsPerPage = 15;
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [insertDateTime, setInsertDateTime] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;

            setLoading(true);
            try {
                const response = await updateXjaidee({
                    date_start: startDate,
                    date_end: endDate
                });
                const data = response?.data;

                if (Array.isArray(data)) {
                    const validEmployees: Employee[] = data
                        .filter((item: unknown) => {
                            const emp = item as Partial<Employee>;
                            return emp.msisdn && emp.credit_id;
                        })
                        .map((item: unknown) => {
                            const emp = item as Partial<Employee>;
                            return {
                                credit_id: String(emp.credit_id || ''),
                                msisdn: String(emp.msisdn || ''),
                                amount: Number(emp.amount || 0),
                                month_to_repay: Number(emp.month_to_repay || 0),
                                monthly_payment: Number(emp.monthly_payment || 0),
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
    }, [startDate, endDate]);

    const handleInsert = async () => {
        try {
            if (filteredEmployees.length === 0) {
                await Swal.fire({
                    title: 'ບໍ່ມີຂໍ້ມູນ',
                    text: 'ບໍ່ມີຂໍ້ມູນໃຫ້ແກ້ໄຂ',
                    icon: 'warning',
                    confirmButtonText: 'ຕົກລົງ'
                });
                return;
            }

            if (!insertDateTime) {
                await Swal.fire({
                    title: 'ກະລຸນາເລືອກວັນທີ',
                    text: 'ກະລຸນາເລືອກວັນທີ ແລະ ເວລາກ່ອນທີ່ຈະແາ້',
                    icon: 'warning',
                    confirmButtonText: 'ຕົກລົງ'
                });
                return;
            }

            const confirmInsert = await Swal.fire({
                title: 'ທ່ານແນ່ໃຈບໍ?',
                text: 'ທ່ານຕ້ອງການແາ້ຂໍ້ມູນນີ້ບໍ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ແາ້ແທ້',
                cancelButtonText: 'ຍົກເລີກ'
            });

            if (!confirmInsert.isConfirmed) return;

            // typed shape for the insert response to avoid using `any`
            type InsertResponse = {
                status?: boolean;
                [key: string]: unknown;
            };

            for (const emp of filteredEmployees) {
                const payload = {
                    msisdn: emp.msisdn,
                    amount: emp.monthly_payment,
                    credit_id: emp.credit_id,
                    interest: emp.interest,
                    payment_date: insertDateTime
                };

                const response = await insertXjaidee(payload);
                const respData = response?.data as InsertResponse | undefined;

                if (respData?.status) {
                    console.log(`✅ Inserted msisdn ${emp.msisdn} successfully!`);
                } else {
                    console.error(`❌ Insert failed for msisdn ${emp.msisdn}`);
                }
            }

            await Swal.fire({
                title: 'ສຳເລັດ',
                text: 'ລະບົບແາ້ຂໍ້ມູນສຳເລັດແລ້ວ',
                icon: 'success',
                confirmButtonText: 'ຕົກລົງ'
            });

        } catch (error) {
            console.error("Error inserting data:", error);
            await Swal.fire({
                title: 'ຜິດພາດ',
                text: 'ແກ້ຂໍ້ມູນບໍ່ສຳເລັດ',
                icon: 'error',
                confirmButtonText: 'ຕົກລົງ'
            });
        }
    };

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

    const handleExport = async () => {
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
        const worksheet = workbook.addWorksheet('Xjaidee Data');

        const headerRow = worksheet.addRow([
            'ລຳດັບ',
            'ເບີໂທ',
            'ລະຫັດສິນເຊື່ອ',
            'ຈຳນວນເງິນ',
            'ເດືອນຄ່າງາມ',
            'ຈ່າຍລາຍເດືອນ',
            'ດອກເບ້ຍ'
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
                parseInt(emp.msisdn),
                emp.credit_id,
                emp.amount,
                emp.month_to_repay,
                emp.monthly_payment,
                emp.interest
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

                if ([4, 5, 6, 7].includes(colNumber)) {
                    cell.numFmt = '#,##0';
                }
            });
        });

        worksheet.columns.forEach((column) => {
            column.width = 18;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `Xjaidee_Data_${startDate}_to_${endDate}.xlsx`);

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
                                <Pencil className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 lao-font">
                                    ອັບເດດ Xjaidee
                                </h1>
                                <p className="text-gray-600 text-sm lao-font">ລະບົບອັບເດດຂໍ້ມູນ Xjaidee</p>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Start Date */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
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
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
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
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {/* DateTime */}
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="datetime-local"
                                    value={insertDateTime}
                                    onChange={(e) => setInsertDateTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors lao-font"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleExport}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 lao-font"
                            >
                                <Download size={20} />
                                ສົ່ງອອກ Excel
                            </button>

                            <button
                                onClick={handleInsert}
                                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 lao-font"
                            >
                                <Database size={20} />
                                ແກ້ໄຂຂໍ້ມູນ
                            </button>
                        </div>

                        {/* Info Bar */}
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                            <span className="lao-font">ທັງໝົດ: <span className="font-semibold text-gray-800">{filteredEmployees.length}</span> ລາຍການ</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                            <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
                            <p className="text-gray-600 font-medium lao-font">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
                        </div>
                    ) : (!startDate || !endDate) ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                            <Calendar className="text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium lao-font">ກະລຸນາເລືອກວັນທີທັງສອງເພື່ອເບິ່ງຂໍ້ມູນ</p>
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
                                                {['ເບີໂທ', 'ລະຫັດສິນເຊື່ອ', 'ຈຳນວນເງິນ', 'ເດືອນຄ່າງາມ', 'ຈ່າຍລາຍເດືອນ', 'ດອກເບ້ຍ'].map((heading) => (
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
                                                        key={emp.credit_id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-4 text-center font-medium text-gray-700">
                                                            {indexOfFirstRow + index + 1}
                                                        </td>
                                                        <td className="px-4 py-4 text-center font-semibold text-red-600">
                                                            {emp.msisdn}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 font-medium">
                                                            {emp.credit_id}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-blue-600 font-bold lao-font">
                                                                {emp.amount?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700">
                                                            {emp.month_to_repay}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-orange-600 font-bold lao-font">
                                                                {emp.monthly_payment?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-red-600 font-bold text-lg lao-font">
                                                                {emp.interest?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-12">
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