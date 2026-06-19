"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, Users, UserPlus, Star, Phone, Mail } from "lucide-react";
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

export default function CustomerReport({ storeId }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    topSpenders: [],
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (storeId) {
      fetchCustomers();
    }
  }, [storeId]);

  const fetchCustomers = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/customers/${storeId}`);
      if (response.data.success) {
        const customerData = response.data.customers;
        setCustomers(customerData);
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const newCustomers = customerData.filter(c => new Date(c.createdAt) > oneMonthAgo).length;
        
        const topSpenders = [...customerData].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 5);
        
        setStats({
          total: customerData.length,
          newThisMonth: newCustomers,
          topSpenders,
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      ['Customer Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent', 'Last Visit', 'Joined Date'],
      ...customers.map(c => [
        c.name,
        c.phone,
        c.email || 'N/A',
        c.totalOrders || 0,
        c.totalSpent || 0,
        c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'N/A',
        new Date(c.createdAt).toLocaleDateString(),
      ]),
      [''],
      ['Summary'],
      ['Total Customers', stats.total],
      ['New This Month', stats.newThisMonth],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Report');
    XLSX.writeFile(wb, `customer_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateReportHTML = () => `
    <!DOCTYPE html><html><head><title>Customer Report</title><meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;padding:20px;}h1{text-align:center;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style>
    </head><body>
    <div style="text-align:center"><h1>Customer Report</h1><p>Generated: ${new Date().toLocaleString()}</p></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>Total Customers</h3><p>${stats.total}</p></div>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;margin:0 5px"><h3>New This Month</h3><p>${stats.newThisMonth}</p></div>
    </div>
    <table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Total Orders</th><th>Total Spent</th><th>Joined Date</th></tr></thead>
    <tbody>${customers.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email || 'N/A'}</td><td>${c.totalOrders || 0}</td><td>₹${(c.totalSpent || 0).toLocaleString()}</td><td>${new Date(c.createdAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>
    <div style="text-align:center;margin-top:20px;font-size:12px;color:#666;"><p>— End of Report —</p></div>
    </body></html>
  `;

  if (loading) {
    return <div className={clay.card + " p-8 text-center"}><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div><p className="text-gray-500 text-sm font-medium">Loading customer data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h2 className="text-xl font-bold text-gray-900">Customer Report</h2><p className="text-sm text-gray-400 mt-0.5">Customer analytics and insights</p></div>
        <div className="flex gap-2"><button onClick={handlePrint} className={clay.btn.blue + " px-4 py-2 text-sm flex items-center gap-2"}><Printer size={16} /> Print</button><button onClick={handleExportExcel} className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}><Download size={16} /> Export Excel</button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Total Customers</p><Users size={18} className="text-blue-500" /></div><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div>
        <div className={clay.card + " p-4"}><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">New This Month</p><UserPlus size={18} className="text-green-500" /></div><p className="text-2xl font-bold text-green-600">{stats.newThisMonth}</p></div>
      </div>

      {stats.topSpenders.length > 0 && (
        <div className={clay.card + " p-4"}>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Top Spenders</h3>
          <div className="space-y-2">{stats.topSpenders.map((c, idx) => (<div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"><div className="flex items-center gap-3"><span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">#{idx + 1}</span><div><p className="text-sm font-semibold text-gray-800">{c.name}</p><p className="text-xs text-gray-400">{c.phone}</p></div></div><p className="text-sm font-bold text-green-600">₹{(c.totalSpent || 0).toLocaleString()}</p></div>))}</div>
        </div>
      )}

      <div className={clay.card + " overflow-hidden"}>
        <div className="overflow-x-auto"><table className="min-w-full"><thead><tr className="bg-gray-50/80 border-b-2 border-gray-100"><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Name</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Phone</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Email</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Orders</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Total Spent</th><th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Joined</th></tr></thead>
        <tbody className="divide-y divide-gray-50">{customers.map((c, idx) => (<motion.tr key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className="hover:bg-[#f9fff0] transition-colors"><td className="px-5 py-3 text-sm font-semibold text-gray-800">{c.name}</td><td className="px-5 py-3 text-sm text-gray-600">{c.phone}</td><td className="px-5 py-3 text-sm text-gray-600">{c.email || 'N/A'}</td><td className="px-5 py-3 text-sm text-gray-600">{c.totalOrders || 0}</td><td className="px-5 py-3 text-sm font-bold text-green-600">₹{(c.totalSpent || 0).toLocaleString()}</td><td className="px-5 py-3 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td></motion.tr>))}</tbody></table></div>
        {customers.length === 0 && <div className="text-center py-12"><p className="text-gray-400 text-sm">No customers found</p></div>}
      </div>
    </div>
  );
}