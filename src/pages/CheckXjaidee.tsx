import React, { useState, useEffect } from 'react';
import { CheckXjaidee } from '../service/authservice';
import MainLayout from '../MainLayout';
import { Search, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Employee {
    emp_id: string;
    name: string;
    surname: string;
    department: string;
    section: string;
    msisdn: string;
    amount: number;
    status: 'approved' | 'pending' | 'rejected';
}

export default function CheckLoaner(): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const rowsPerPage = 15;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await CheckXjaidee();
                const data = response?.data;
                
                if (Array.isArray(data)) {
                    const validEmployees: Employee[] = data
                        .filter((item: Partial<Employee>) =>
                            item.emp_id !== null && item.emp_id !== undefined &&
                            item.name !== null && item.name !== undefined &&
                            item.surname !== null && item.surname !== undefined
                        )
                        .map((item: Partial<Employee>) => ({
                            emp_id: String(item.emp_id || ''),
                            name: String(item.name || ''),
                            surname: String(item.surname || ''),
                            department: String(item.department || ''),
                            section: String(item.section || ''),
                            msisdn: String(item.msisdn || ''),
                            amount: Number(item.amount || 0),
                            status: (item.status === 'approved' || item.status === 'pending' || item.status === 'rejected') 
                                ? item.status 
                                : 'pending'
                        } as Employee));
                    setEmployees(validEmployees);
                } else {
                    setEmployees([]);
                }
            } catch (error) {
                console.error("Error fetching employee data:", error);
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const getStatusStyles = (status: Employee['status']): string => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default:
                return 'bg-red-100 text-red-700 border-red-300';
        }
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
                                <Users className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 lao-font">
                                    Xjaidee Loaner
                                </h1>
                                <p className="text-gray-600 text-sm lao-font">ລະບົບກວດສອບຂໍ້ມູນການກູ້ຢືມ Xjaidee</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ຄົ້ນຫາຕາມຊື່, ລະຫັດ, ພະແນກ, ເບີໂທ..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors lao-font"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                            <span className="lao-font">ທັງໝົດ: <span className="font-semibold text-gray-800">{filteredEmployees.length}</span> ລາຍການ</span>
                        </div>
                    </div>

                    {loading ? (
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
                                                {['ລະຫັດພະນັກງານ', 'ຊື່', 'ນາມສະກຸນ', 'ພະແນກ', 'ຕຳແໜ່ງ', 'ເບີໂທ', 'ຈຳນວນເງິນ', 'ສະຖານະ'].map((heading) => (
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
                                                        key={emp.emp_id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-4 text-center font-medium text-gray-700">
                                                            {indexOfFirstRow + index + 1}
                                                        </td>
                                                        <td className="px-4 py-4 text-center font-semibold text-red-600">
                                                            {emp.emp_id}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-800 lao-font">
                                                            {emp.name}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-800 lao-font">
                                                            {emp.surname}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 text-sm lao-font">
                                                            {emp.department}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 text-sm lao-font">
                                                            {emp.section}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-gray-700 font-medium">
                                                            {emp.msisdn}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-red-600 font-bold text-base lao-font">
                                                                {emp.amount?.toLocaleString()} ₭
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase ${getStatusStyles(emp.status)}`}
                                                            >
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="text-center py-12">
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