"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, Package, AlertTriangle, DollarSign, TrendingDown } from "lucide-react";
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

export default function InventoryReport({ storeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    categories: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (storeId) {
      fetchInventory();
    }
  }, [storeId]);

  const fetchInventory = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/inventory/items/${storeId}`);
      if (response.data.success) {
        const inventoryItems = response.data.items;
        setItems(inventoryItems);
        
        const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
        const lowStock = inventoryItems.filter(item => item.currentStock <= item.minStock).length;
        const uniqueCategories = new Set(inventoryItems.map(item => item.category).filter(Boolean));
        
        setStats({
          totalItems: inventoryItems.length,
          totalValue,
          lowStockItems: lowStock,
          categories: uniqueCategories.size,
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const html = generateReportHTML();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExportExcel = () => {
    const excelData = [
      ['Inventory Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Item Name', 'Category', 'Current Stock', 'Unit', 'Min Stock', 'Price', 'Total Value', 'Status'],
      ...items.map(item => [
        item.name,
        item.category || 'N/A',
        item.currentStock,
        item.unit,
        item.minStock,
        item.price,
        item.currentStock * item.price,
        item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock',
      ]),
      [''],
      ['Summary'],
      ['Total Items', stats.totalItems],
      ['Total Stock Value', `₹${stats.totalValue.toLocaleString()}`],
      ['Low Stock Items', stats.lowStockItems],
      ['Categories', stats.categories],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
    XLSX.writeFile(wb, `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Report</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; flex: 1; margin: 0 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .low-stock { color: #e74c3c; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card"><h3>Total Items</h3><p>${stats.totalItems}</p></div>
            <div class="summary-card"><h3>Total Value</h3><p>₹${stats.totalValue.toLocaleString()}</p></div>
            <div class="summary-card"><h3>Low Stock</h3><p>${stats.lowStockItems}</p></div>
            <div class="summary-card"><h3>Categories</h3><p>${stats.categories}</p></div>
          </div>
          
          <table>
            <thead>
              <tr><th>Item Name</th><th>Category</th><th>Stock</th><th>Unit</th><th>Min Stock</th><th>Price</th><th>Total Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category || 'N/A'}</td>
                  <td>${item.currentStock}</td>
                  <td>${item.unit}</td>
                  <td>${item.minStock}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.currentStock * item.price}</td>
                  <td class="${item.currentStock <= item.minStock ? 'low-stock' : ''}">${item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>— End of Report —</p>
          </div>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className={clay.card + " p-8 text-center"}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm font-medium">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Report</h2>
          <p className="text-sm text-gray-400 mt-0.5">Current stock levels and inventory valuation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className={clay.btn.blue + " px-4 py-2 text-sm flex items-center gap-2"}>
            <Printer size={16} /> Print
          </button>
          <button onClick={handleExportExcel} className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}>
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Total Items</p><Package size={18} className="text-blue-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Total Value</p><DollarSign size={18} className="text-green-500" /></div>
          <p className="text-2xl font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Low Stock</p><AlertTriangle size={18} className="text-red-500" /></div>
          <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs font-semibold uppercase">Categories</p><TrendingDown size={18} className="text-purple-500" /></div>
          <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
        </div>
      </div>

      <div className={clay.card + " overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr className="bg-gray-50/80 border-b-2 border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Item Name</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Category</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Min Stock</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Price</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Total Value</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, idx) => (
                <motion.tr key={item._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className="hover:bg-[#f9fff0] transition-colors">
                  <td className="px-5 py-3 text-sm font-bold text-gray-800">{item.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{item.category || 'N/A'}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">{item.currentStock}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{item.unit}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{item.minStock}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-green-600">₹{item.price}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">₹{(item.currentStock * item.price).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-xl ${item.currentStock <= item.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div className="text-center py-12"><p className="text-gray-400 text-sm">No inventory items found</p></div>}
      </div>
    </div>
  );
}