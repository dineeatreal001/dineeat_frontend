"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, Users, UserCheck, UserX, Calendar, Clock } from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx';

const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue: "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green: "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
};

export default function StaffReport({ storeId }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roles: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (storeId) {
      fetchStaff();
    }
  }, [storeId]);

  const fetchStaff = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/staff/${storeId}`);
      if (response.data.success) {
        const staffData = response.data.staff;
        setStaff(staffData);
        
        const activeCount = staffData.filter(s => s.status === 'active').length;
        const inactiveCount = staffData.filter(s => s.status === 'inactive').length;
        const uniqueRoles = new Set(staffData.map(s => s.role)).size;
        
        setStats({
          total: staffData.length,
          active: activeCount,
          inactive: inactiveCount,
          roles: uniqueRoles,
        });
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateReportHTML());
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExportExcel = () => {
    const excelData = [
      ['Staff Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Name', 'Email', 'Phone', 'Role', 'Shift', 'Status', 'Join Date', 'Salary'],
      ...staff.map(s => [
        s.name,
        s.email,
        s.phone,
        s.role,
        s.shift || 'N/A',
        s.status,
        s.joinDate,
        s.salary || 'N/A',
      ]),
      [''],
      ['Summary'],
      ['Total Staff', stats.total],
      ['Active', stats.active],
      ['Inactive', stats.inactive],
      ['Roles', stats.roles],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Report');
    XLSX.writeFile(wb, `staff_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateReportHTML = () => `
    <!DOCTYPE html><html><head><title>Staff Report</title><meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;padding:20px;}h1{text-align:center;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style>
    </head><body>
    <div style="text-align:center"><h1>Staff Report</h1><p>Generated: ${new Date().toLocaleString()}</p></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>Total Staff</h3><p>${stats.total}</p></div>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>Active</h3><p>${stats.active}</p></div>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>Inactive</h3><p>${stats.inactive}</p></div>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>Roles</h3><p>${stats.roles}</p></div>
    </div>
    <table><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Shift</th><th>Status</th><th>Join Date</th></tr></thead>
    <tbody>${staff.map(s => `<tr><td>${s.name}</td><td>${s.role}</td><td>${s.phone}</td><td>${s.shift || 'N/A'}</td><td>${s.status}</td><td>${s.joinDate}</td></tr>`).join('')}</tbody></table>
    <div style="text-align:center;margin-top:20px;font-size:12px;color:#666;"><p>— End of Report —</p></div>
    </body></html>
  `;

  if (loading) {
    return <div className={clay.card + " p-8 text-center"}><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div><p className="text-gray-500 text-sm font-medium">Loading staff data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h2 className="text-xl font-bold text-gray-900">Staff Report</h2><p className="text-sm text-gray-400 mt-0.5">Staff performance and attendance analytics</p></div>
        <div className="flex gap-2"><button onClick={handlePrint} className={clay.btn.blue + " px-4 py-2 text-sm flex items-center gap-2"}><Printer size={16} /> Print</button><button onClick={handleExportExcel} className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}><Download size={16} /> Export Excel</button></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Total Staff</p><Users size={18} className="text-blue-500" /></div><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div>
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Active</p><UserCheck size={18} className="text-green-500" /></div><p className="text-2xl font-bold text-green-600">{stats.active}</p></div>
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Inactive</p><UserX size={18} className="text-red-500" /></div><p className="text-2xl font-bold text-red-600">{stats.inactive}</p></div>
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Roles</p><Clock size={18} className="text-purple-500" /></div><p className="text-2xl font-bold text-purple-600">{stats.roles}</p></div>
      </div>

      <div className={clay.card + " overflow-hidden"}>
        <div className="overflow-x-auto"><table className="min-w-full"><thead><tr className="bg-gray-50/80 border-b-2 border-gray-100"><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Name</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Email</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Role</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Shift</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Join Date</th></tr></thead>
        <tbody className="divide-y divide-gray-50">{staff.map((s, idx) => (<motion.tr key={s._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className="hover:bg-[#f9fff0] transition-colors"><td className="px-5 py-3 text-sm font-bold text-gray-800">{s.name}</td><td className="px-5 py-3 text-sm text-gray-600">{s.email}</td><td className="px-5 py-3 text-sm font-semibold text-gray-800">{s.role}</td><td className="px-5 py-3 text-sm text-gray-600">{s.shift || 'N/A'}</td><td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-xl ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.status}</span></td><td className="px-5 py-3 text-sm text-gray-600">{s.joinDate}</td></motion.tr>))}</tbody></table></div>
        {staff.length === 0 && <div className="text-center py-12"><p className="text-gray-400 text-sm">No staff members found</p></div>}
      </div>
    </div>
  );
}