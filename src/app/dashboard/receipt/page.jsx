"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import axios from "axios";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

const orderTypes = ["All", "dine_in", "pickup", "quick_bill"];

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
    blue:
      "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    outline:
      "bg-transparent border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl shadow-[0_4px_0_#e5e7eb] hover:shadow-[0_2px_0_#e5e7eb] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

export default function ReceiptsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    dineIn: 0,
    pickup: 0,
    quickBill: 0
  });
  const [storeId, setStoreId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get storeId from localStorage
  const getStoreIdFromStorage = () => {
    const storeDataStr = localStorage.getItem('storeData');
    if (storeDataStr) {
      try {
        const storeData = JSON.parse(storeDataStr);
        const id = storeData.id || storeData._id;
        if (id) {
          setStoreId(id);
          return id;
        }
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
    const directStoreId = localStorage.getItem('storeId');
    if (directStoreId) {
      setStoreId(directStoreId);
      return directStoreId;
    }
    return null;
  };

  // Fetch receipts
  const fetchReceipts = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('storeId', currentStoreId);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedOrderType !== 'All') params.append('mode', selectedOrderType);
      
      const response = await axios.get(`${API_URL}/api/receipts/?${params.toString()}`);
      if (response.data.success) {
        setReceipts(response.data.receipts);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;

    try {
      const response = await axios.get(`${API_URL}/api/receipts/stats/${currentStoreId}`);
      if (response.data.success) {
        const statsData = response.data.stats;
        setStats({
          total: statsData.total || 0,
          totalAmount: 0,
          dineIn: statsData.dineIn || 0,
          pickup: statsData.pickup || 0,
          quickBill: statsData.quickBill || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    getStoreIdFromStorage();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchReceipts();
      fetchStats();
    }
  }, [storeId, searchTerm, selectedOrderType]);

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateGST = (subtotal) => {
    return Math.round(subtotal * 0.05);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const printReceipt = async (receipt) => {
    setPrinting(true);
    setSelectedReceipt(receipt);
    
    const subtotal = calculateOrderTotal(receipt.items);
    const tax = calculateGST(subtotal);
    const total = subtotal + tax;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.orderNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; font-size: 12px; }
          .receipt { max-width: 300px; margin: 0 auto; padding: 10px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin: 5px 0; font-size: 18px; }
          .header p { margin: 3px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .items-table th, .items-table td { padding: 5px 0; text-align: left; }
          .items-table td:last-child { text-align: right; }
          .totals { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
          .totals p { margin: 5px 0; display: flex; justify-content: space-between; }
          .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 10px; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>🍽️ DineEat Restaurant</h2>
            <p>123 Restaurant Street, Food City</p>
            <p>Phone: +91 98765 43210</p>
            <p>GST: 27AAABC1234D1Z</p>
            <p>${new Date(receipt.createdAt).toLocaleDateString()} | ${new Date(receipt.createdAt).toLocaleTimeString()}</p>
            <p>Order #: ${receipt.orderNumber}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> ${receipt.customer}</p>
            <p><strong>Phone:</strong> ${receipt.phone}</p>
            ${receipt.tableId ? `<p><strong>Table:</strong> ${receipt.tableId}</p>` : ''}
            <p><strong>Order Type:</strong> ${receipt.mode?.toUpperCase() || 'DINE IN'}</p>
          </div>
          <table class="items-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${receipt.items?.map(item => `
                <tr><td>${item.name}</td><td>${item.qty}</td><td>₹${item.price}</td><td>₹${item.price * item.qty}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p><span>Subtotal:</span><span>₹${subtotal}</span></p>
            <p><span>GST (5%):</span><span>₹${tax}</span></p>
            <p style="font-size: 14px; font-weight: bold;"><span>Total:</span><span>₹${total}</span></p>
            <p><span>Payment Status:</span><span>${receipt.paymentStatus || 'Pending'}</span></p>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Visit again soon! 😊</p>
            <p>Powered by DineEat POS</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 1000); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      setPrinting(false);
    }, 2000);
  };

  const reprintReceipt = async (receipt) => {
    try {
      const response = await axios.get(`${API_URL}/api/receipts/reprint/${receipt._id}`);
      if (response.data.success) {
        printReceipt(response.data.receipt);
      }
    } catch (error) {
      console.error("Error reprinting receipt:", error);
      alert("Failed to reprint receipt");
    }
  };

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;
    
    const subtotal = calculateOrderTotal(receipt.items);
    const tax = calculateGST(subtotal);
    const total = subtotal + tax;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className={clay.modal + " max-w-2xl w-full max-h-[92vh] overflow-y-auto"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
              <p className="text-sm text-gray-400 mt-0.5">{receipt.orderNumber}</p>
            </div>
            <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm shadow-[0_4px_0_#e5e7eb]">
              <div className="text-center border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">🍽️ DineEat Restaurant</h2>
                <p className="text-xs text-gray-500">123 Restaurant Street, Food City</p>
                <p className="text-xs text-gray-500">Phone: +91 98765 43210</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(receipt.createdAt).toLocaleDateString()} | {new Date(receipt.createdAt).toLocaleTimeString()}</p>
                <p className="text-xs font-semibold text-gray-600 mt-1">Order: {receipt.orderNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Customer</p>
                  <p className="text-sm font-semibold text-gray-800">{receipt.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">{receipt.phone}</p>
                </div>
                {receipt.tableId && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Table</p>
                    <p className="text-sm font-semibold text-gray-800">{receipt.tableId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Order Type</p>
                  <p className="text-sm font-semibold text-gray-800">{receipt.mode?.toUpperCase() || 'DINE IN'}</p>
                </div>
              </div>
              
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Item</th>
                    <th className="text-center py-2 text-xs font-semibold text-gray-500">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Price</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{item.name}</td>
                      <td className="text-center py-2 text-gray-700">{item.qty}</td>
                      <td className="text-right py-2 text-gray-700">₹{item.price}</td>
                      <td className="text-right py-2 text-gray-700">₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="border-t border-gray-200 pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal:</span><span className="font-semibold">₹{subtotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">GST (5%):</span><span className="font-semibold">₹{tax}</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-gray-200"><span>Total:</span><span className="text-green-600">₹{total}</span></div>
                <div className="flex justify-between text-sm pt-2"><span className="text-gray-500">Status:</span><span className="text-green-600 font-semibold">{receipt.status || 'Completed'}</span></div>
              </div>
              
              <div className="text-center border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600">Thank you for dining with us!</p>
                <p className="text-xs text-gray-400 mt-1">Powered by DineEat POS</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => reprintReceipt(receipt)}
                className={clay.btn.primary + " flex-1 py-3 text-sm"}
              >
                🖨️ Reprint Receipt
              </button>
              <button
                onClick={onClose}
                className={clay.btn.secondary + " flex-1 py-3 text-sm"}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesOrderType = selectedOrderType === "All" || receipt.mode === selectedOrderType;
    const matchesDate = (!dateRange.start || new Date(receipt.createdAt) >= new Date(dateRange.start)) && 
                       (!dateRange.end || new Date(receipt.createdAt) <= new Date(dateRange.end));
    return matchesOrderType && matchesDate;
  });

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + calculateOrderTotal(r.items), 0);
  const dineInCount = filteredReceipts.filter(r => r.mode === 'dine_in').length;
  const pickupCount = filteredReceipts.filter(r => r.mode === 'pickup').length;
  const quickBillCount = filteredReceipts.filter(r => r.mode === 'quick_bill').length;

  const statColors = [
    { label: "Total Receipts", key: "total", color: "#93c5fd", textColor: "text-blue-600", icon: "🧾", value: filteredReceipts.length },
    { label: "Total Amount", key: "amount", color: "#86efac", textColor: "text-green-600", icon: "💰", value: formatCurrency(totalAmount) },
    { label: "Dine In", key: "dineIn", color: "#d8b4fe", textColor: "text-purple-600", icon: "🍽️", value: dineInCount },
    { label: "Pickup/Quick", key: "pickup", color: "#fdba74", textColor: "text-orange-600", icon: "🛵", value: pickupCount + quickBillCount },
  ];

  if (loading && receipts.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar 
        sidebarOpen={sidebarOpen} 
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"} ml-0`}>
        <div className="pt-24 pr-4 sm:pr-6 pb-8 pl-4 sm:pl-6">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Receipt Management</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">View and reprint customer receipts</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {printing && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-[0_4px_0_#e5e7eb] order-2 sm:order-1">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-[#a3e635] border-t-transparent"></div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Printing...</span>
                </div>
              )}
              <button
                onClick={() => router.push("/dashboard/receipt/receipt-layout-editor")}
                className={clay.btn.outline + " px-4 py-2 text-sm flex items-center gap-2 justify-center order-1 sm:order-2"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Receipt Layout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {statColors.map(({ label, color, textColor, icon, value }) => (
              <div key={label} className={clay.statCard(color)}>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{label}</p>
                  <span className="text-lg sm:text-xl">{icon}</span>
                </div>
                <p className={`text-lg sm:text-2xl font-semibold mt-1 ${textColor} truncate`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className={clay.card + " mb-6"}>
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clay.input + " pl-10 text-sm"}
                />
              </div>
            </div>
            
            <div className="p-3 sm:p-4 flex flex-wrap gap-2 sm:gap-3 items-center">
              <select
                value={selectedOrderType}
                onChange={(e) => setSelectedOrderType(e.target.value)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer"
              >
                {orderTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'dine_in' ? '🍽️ Dine In' : type === 'pickup' ? '🛍️ Pickup' : type === 'quick_bill' ? '⚡ Quick Bill' : '📋 All'}
                  </option>
                ))}
              </select>
              
              <input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
              />
              
              <input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
              />
              
              <button
                onClick={() => { setSearchTerm(""); setSelectedOrderType("All"); setDateRange({ start: "", end: "" }); }}
                className={clay.btn.ghost + " px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm"}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Receipts Table - Horizontal Scroll for Mobile */}
          <div className={clay.card + " overflow-hidden"}>
            <div className="overflow-x-auto">
              <table className="min-w-[800px] sm:min-w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Order #</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-5 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReceipts.map((receipt, idx) => {
                    const total = calculateOrderTotal(receipt.items);
                    return (
                      <motion.tr
                        key={receipt._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                        className="hover:bg-[#f9fff0] transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowReceiptModal(true);
                        }}
                      >
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="text-xs sm:text-sm font-bold text-gray-800">{receipt.orderNumber?.slice(-8)}</p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-none">{receipt.customer}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{receipt.phone}</p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className={`inline-flex px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold shadow-[0_2px_0_rgba(0,0,0,0.1)] whitespace-nowrap ${
                            receipt.mode === 'dine_in' ? 'bg-purple-100 text-purple-700' :
                            receipt.mode === 'pickup' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {receipt.mode === 'dine_in' ? '🍽️ Dine' : receipt.mode === 'pickup' ? '🛍️ Pickup' : '⚡ Quick'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className="inline-flex w-6 h-6 sm:w-8 sm:h-8 items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100 text-xs sm:text-sm font-bold text-gray-700 shadow-[0_2px_0_#d1d5db]">
                            {receipt.items?.length || 0}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">{formatCurrency(total)}</p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className="inline-flex px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7] whitespace-nowrap">
                            {receipt.status || 'Completed'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">{new Date(receipt.createdAt).toLocaleDateString()}</p>
                          <p className="text-[8px] sm:text-xs text-gray-400 mt-0.5">{new Date(receipt.createdAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <div className="flex gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setShowReceiptModal(true);
                              }}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-600 rounded-xl shadow-[0_2px_0_#93c5fd] hover:translate-y-[1px] hover:shadow-[0_1px_0_#93c5fd] transition-all"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => printReceipt(receipt)}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold bg-gray-100 text-gray-600 rounded-xl shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] hover:shadow-[0_1px_0_#d1d5db] transition-all"
                            >
                              🖨️
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredReceipts.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="text-4xl sm:text-5xl mb-3">🧾</div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">No receipts found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && selectedReceipt && (
          <ReceiptModal receipt={selectedReceipt} onClose={() => setShowReceiptModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}