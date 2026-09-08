"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import axios from "axios";
import * as XLSX from 'xlsx';

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

const orderTypes = [
  { id: "all", label: "All Orders", icon: "📋" },
  { id: "dine_in", label: "Dine In", icon: "🍽️" },
  { id: "pickup", label: "Takeaway", icon: "🛍️" },
  { id: "delivery", label: "Delivery", icon: "🛵" },
];

const statuses = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "served", label: "Served" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    danger:
      "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue:
      "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    purple:
      "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6b21a8,0_8px_16px_rgba(168,85,247,0.35)] hover:shadow-[0_3px_0_#6b21a8,0_4px_8px_rgba(168,85,247,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// Summary Preview Modal
function SummaryPreviewModal({ isOpen, onClose, summaryData, onPrint, onExport }) {
  if (!summaryData) return null;

  const { periodText, typeLabel, statusLabel, filteredOrders, groupedData, totalQty, subTotal, tax, grandTotal, dateStr, timeStr } = summaryData;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={clay.modal + " w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sales Summary Report</h2>
                <p className="text-sm text-gray-400 mt-0.5">{periodText}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onExport}
                  className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}
                >
                  📊 Export to Excel
                </button>
                <button
                  onClick={onPrint}
                  className={clay.btn.blue + " px-4 py-2 text-sm flex items-center gap-2"}
                >
                  🖨️ Print Report
                </button>
                <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Report Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Smile Restaurant</h1>
                <p className="text-sm text-gray-500">Mumbai, Maharashtra</p>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm font-semibold text-gray-700">Sales Summary Report</p>
                <p className="text-xs text-gray-400">{periodText}</p>
                <p className="text-xs text-gray-400 mt-1">Generated on: {dateStr} at {timeStr}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{typeLabel}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{statusLabel}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{filteredOrders.length} Orders</span>
                </div>
              </div>

              <hr className="my-4 border-dashed border-gray-200" />

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedData).map(([category, items]) => (
                      <>
                        <tr key={category} className="bg-gray-50">
                          <td colSpan="3" className="px-4 py-2 text-xs font-bold text-gray-700 uppercase border-b border-gray-200">
                            {category}
                          </td>
                        </tr>
                        {items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                            <td className="px-4 py-2 text-center text-sm text-gray-600">{item.qty}</td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-b border-dashed border-gray-200">
                          <td className="px-4 py-2 text-xs font-semibold text-gray-500">{category} Subtotal</td>
                          <td className="px-4 py-2 text-center text-xs font-semibold text-gray-500">{items.reduce((s, i) => s + i.qty, 0)}</td>
                          <td className="px-4 py-2 text-right text-xs font-semibold text-gray-500">₹{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-4 border-dashed border-gray-200" />

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Items Sold:</span>
                    <span className="font-semibold">{totalQty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Orders:</span>
                    <span className="font-semibold">{filteredOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sub Total:</span>
                    <span className="font-semibold">₹{subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (5%):</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <hr className="border-dashed border-gray-200" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Grand Total:</span>
                    <span className="text-green-600">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-400">— End of Report —</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Summary Filter Modal
function SummaryFilterModal({ isOpen, onClose, onApply }) {
  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const handleApply = () => {
    let filter = { period };
    if (period === "day") {
      filter.date = selectedDate;
    } else if (period === "week") {
      const start = new Date(selectedDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(start.setDate(diff));
      const weekEnd = new Date(start.setDate(diff + 6));
      filter.startDate = weekStart.toISOString().split("T")[0];
      filter.endDate = weekEnd.toISOString().split("T")[0];
    } else if (period === "month") {
      const start = new Date(selectedDate);
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      filter.startDate = monthStart.toISOString().split("T")[0];
      filter.endDate = monthEnd.toISOString().split("T")[0];
    } else if (period === "custom") {
      filter.startDate = startDate;
      filter.endDate = endDate;
    }
    onApply(filter);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={clay.modal + " max-w-md w-full"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Generate Summary Report</h2>
              <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Period</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "day", label: "Today" },
                    { id: "week", label: "This Week" },
                    { id: "month", label: "This Month" },
                    { id: "custom", label: "Custom" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        period === p.id
                          ? "bg-[#a3e635] text-gray-900 shadow-[0_3px_0_#6aaa00]"
                          : "bg-gray-100 text-gray-600 shadow-[0_2px_0_#d1d5db] hover:shadow-[0_1px_0_#d1d5db] hover:translate-y-[1px]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {period === "day" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={clay.input}
                  />
                </div>
              )}

              {(period === "week" || period === "month") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reference Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={clay.input}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {period === "week" ? "Shows summary for the week containing this date" : "Shows summary for the entire month"}
                  </p>
                </div>
              )}

              {period === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={clay.input}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={clay.input}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t-2 border-gray-100 flex gap-3">
              <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Cancel</button>
              <button onClick={handleApply} className={clay.btn.primary + " flex-1 py-3 text-sm"}>Generate Report</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [activeOrderType, setActiveOrderType] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [kotPrinting, setKotPrinting] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    dineIn: 0,
    takeaway: 0,
    active: 0,
    completed: 0,
    totalRevenue: 0
  });
  const [storeId, setStoreId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateGST = (subtotal) => {
    return Math.round(subtotal * 0.05);
  };

  useEffect(() => {
    const getStoreIdFromStorage = () => {
      const storeDataStr = localStorage.getItem('storeData');
      if (storeDataStr) {
        try {
          const storeData = JSON.parse(storeDataStr);
          const id = storeData.id || storeData._id;
          if (id) {
            setStoreId(id);
            return;
          }
        } catch (e) {
          console.error("Error parsing storeData:", e);
        }
      }
      
      const directStoreId = localStorage.getItem('storeId');
      if (directStoreId) {
        setStoreId(directStoreId);
        return;
      }
    };
    
    getStoreIdFromStorage();
  }, []);

  const [allOrders, setAllOrders] = useState([]);

  const fetchOrders = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('storeId', storeId);
      params.append('limit', 500);
      
      const response = await axios.get(`${API_URL}/api/admin-orders/?${params.toString()}`);
      if (response.data.success) {
        const ordersWithTotal = response.data.orders.map(order => ({
          ...order,
          calculatedTotal: calculateOrderTotal(order.items)
        }));
        setAllOrders(ordersWithTotal);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!storeId) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/admin-orders/stats/${storeId}`);
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          total: response.data.stats.total,
          dineIn: response.data.stats.dineIn,
          takeaway: response.data.stats.takeaway,
          active: response.data.stats.active,
          completed: response.data.stats.completed
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchOrders();
      fetchStats();
    }
  }, [storeId]);

  useEffect(() => {
    let filtered = allOrders;

    if (activeOrderType !== 'all') {
      filtered = filtered.filter(o => (o.mode || o.orderType) === activeOrderType);
    }

    if (activeStatus !== 'all') {
      filtered = filtered.filter(o => o.status === activeStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        (o.customer || '').toLowerCase().includes(term) ||
        (o.phone || '').toLowerCase().includes(term) ||
        (o.orderNumber || o.billNumber || '').toLowerCase().includes(term)
      );
    }

    setOrders(filtered);

    const totalRevenue = filtered.reduce((sum, order) => sum + order.calculatedTotal, 0);
    setStats(prev => ({ ...prev, totalRevenue }));
  }, [allOrders, activeOrderType, activeStatus, searchTerm]);

  const generateSummaryData = (filter) => {
    let filteredOrders = [...orders];
    
    if (filter.period === "day") {
      const targetDate = new Date(filter.date);
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === targetDate.toDateString();
      });
    } else if (filter.period === "week" || filter.period === "month" || filter.period === "custom") {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    if (filteredOrders.length === 0) {
      alert("No orders found for the selected period");
      return null;
    }

    // Aggregate item-wise sales
    const itemMap = new Map();

    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const key = `${item.name}__${item.category || "General"}`;
        if (itemMap.has(key)) {
          const existing = itemMap.get(key);
          existing.qty += item.qty;
          existing.amount += item.price * item.qty;
        } else {
          itemMap.set(key, {
            name: item.name,
            category: item.category || "General",
            qty: item.qty,
            amount: item.price * item.qty,
          });
        }
      });
    });

    // Group by category
    const grouped = {};
    itemMap.forEach(({ name, category, qty, amount }) => {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ name, qty, amount });
    });

    const totalQty = [...itemMap.values()].reduce((s, i) => s + i.qty, 0);
    const subTotal = [...itemMap.values()].reduce((s, i) => s + i.amount, 0);
    const tax = Math.round(subTotal * 0.05);
    const grandTotal = subTotal + tax;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    let periodText = "";
    if (filter.period === "day") {
      periodText = `Date: ${new Date(filter.date).toLocaleDateString("en-IN")}`;
    } else if (filter.period === "week") {
      periodText = `Week: ${filter.startDate} to ${filter.endDate}`;
    } else if (filter.period === "month") {
      periodText = `Month: ${filter.startDate} to ${filter.endDate}`;
    } else {
      periodText = `Custom Period: ${filter.startDate} to ${filter.endDate}`;
    }

    const typeLabel = orderTypes.find(t => t.id === activeOrderType)?.label || "All Orders";
    const statusLabel = statuses.find(s => s.id === activeStatus)?.label || "All";

    return {
      periodText,
      typeLabel,
      statusLabel,
      filteredOrders,
      groupedData: grouped,
      totalQty,
      subTotal,
      tax,
      grandTotal,
      dateStr,
      timeStr
    };
  };

  const handleGenerateReport = (filter) => {
    const data = generateSummaryData(filter);
    if (data) {
      setSummaryData(data);
      setShowSummaryModal(false);
      setShowPreviewModal(true);
    }
  };

  const handlePrintReport = () => {
    if (!summaryData) return;
    
    const { periodText, typeLabel, statusLabel, filteredOrders, groupedData, totalQty, subTotal, tax, grandTotal, dateStr, timeStr } = summaryData;

    const categoryRows = Object.entries(groupedData)
      .map(([cat, items]) => {
        const catTotal = items.reduce((s, i) => s + i.amount, 0);
        const catQty = items.reduce((s, i) => s + i.qty, 0);
        return `
          <tr>
            <td colspan="3" style="padding: 10px 0 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc;">
              ${cat}
            </td>
          </tr>
          ${items.map(item => `
            <tr>
              <td style="padding: 3px 0;">${item.name}</td>
              <td style="text-align: center; padding: 3px 0;">${item.qty}</td>
              <td style="text-align: right; padding: 3px 0;">₹${item.amount.toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
          <tr style="font-weight: bold; border-top: 1px dashed #ddd;">
            <td style="padding: 2px 0; font-size: 11px; color: #666;">${cat} subtotal</td>
            <td style="text-align: center; padding: 2px 0; font-size: 11px;">${catQty}</td>
            <td style="text-align: right; padding: 2px 0; font-size: 11px;">₹${catTotal.toLocaleString("en-IN")}</td>
          </tr>
        `;
      }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Summary Report</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; padding: 28px 32px; font-size: 13px; color: #111; }
            .center { text-align: center; }
            h1 { font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .sub { font-size: 12px; color: #444; margin: 2px 0; }
            .report-title { font-size: 13px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin: 8px 0 4px; }
            .divider-solid { border: none; border-top: 1.5px solid #111; margin: 10px 0; }
            .divider-dash { border: none; border-top: 1px dashed #aaa; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            .col-header th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; padding: 4px 0; border-bottom: 1px solid #ccc; }
            .col-header th:last-child { text-align: right; }
            .col-header th:nth-child(2) { text-align: center; }
            .summary-row td { padding: 4px 0; font-size: 13px; }
            .summary-row td:last-child { text-align: right; }
            .grand td { font-size: 15px; font-weight: bold; padding-top: 8px; }
            .grand td:last-child { text-align: right; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px dashed #aaa; padding-top: 12px; }
            .filter-badges { display: inline-block; border: 1px solid #ccc; padding: 1px 8px; border-radius: 3px; margin: 0 3px; font-size: 11px; }
            @media print { body { padding: 12px 16px; } }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>Smile Restaurant</h1>
            <p class="sub">Mumbai, Maharashtra</p>
            <hr class="divider-solid">
            <p class="report-title">Sales Summary Report</p>
            <p class="sub">${periodText}</p>
            <p class="sub">Printed: ${dateStr} at ${timeStr}</p>
            <p class="sub" style="margin-top:4px;">
              Filter: <span class="filter-badges">${typeLabel}</span>
              <span class="filter-badges">${statusLabel}</span>
              &nbsp;·&nbsp; ${filteredOrders.length} Orders
            </p>
          </div>

          <hr class="divider-dash">

          <table>
            <thead class="col-header">
              <tr>
                <th style="text-align:left;">Item Name</th>
                <th>Qty</th>
                <th style="text-align:right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>

          <hr class="divider-solid">

          <table>
            <tr class="summary-row"><td>Total Items Sold</td><td style="text-align:right;">${totalQty}</td></tr>
            <tr class="summary-row"><td>Total Orders</td><td style="text-align:right;">${filteredOrders.length}</td></tr>
            <tr class="summary-row"><td>Sub Total</td><td style="text-align:right;">₹${subTotal.toLocaleString("en-IN")}</td></tr>
            <tr class="summary-row"><td>GST (5%)</td><td style="text-align:right;">₹${tax.toLocaleString("en-IN")}</td></tr>
            <tr><td colspan="2"><hr class="divider-dash" style="margin:4px 0;"></td></tr>
            <tr class="grand"><td>Grand Total</td><td style="text-align:right;">₹${grandTotal.toLocaleString("en-IN")}</td></tr>
          </table>

          <div class="footer">
            <p>— End of Report —</p>
            <p style="margin-top:4px;">Generated on ${dateStr} at ${timeStr}</p>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=600,height=800");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const handleExportToExcel = () => {
    if (!summaryData) return;
    
    const { groupedData, totalQty, subTotal, tax, grandTotal, filteredOrders, periodText } = summaryData;
    
    // Prepare data for Excel
    const excelData = [];
    
    // Add header
    excelData.push(['Sales Summary Report']);
    excelData.push([periodText]);
    excelData.push([]);
    
    // Add category wise items
    Object.entries(groupedData).forEach(([category, items]) => {
      excelData.push([category]);
      excelData.push(['Item Name', 'Quantity', 'Amount (₹)']);
      items.forEach(item => {
        excelData.push([item.name, item.qty, item.amount]);
      });
      const categoryTotal = items.reduce((s, i) => s + i.amount, 0);
      const categoryQty = items.reduce((s, i) => s + i.qty, 0);
      excelData.push([`${category} Subtotal`, categoryQty, categoryTotal]);
      excelData.push([]);
    });
    
    // Add summary
    excelData.push(['Summary']);
    excelData.push(['Total Items Sold', totalQty]);
    excelData.push(['Total Orders', filteredOrders.length]);
    excelData.push(['Sub Total', subTotal]);
    excelData.push(['GST (5%)', tax]);
    excelData.push(['Grand Total', grandTotal]);
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Summary');
    XLSX.writeFile(wb, `sales_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getOrderTypeDetails = (type) => {
    switch(type) {
      case 'dine_in': return { icon: '🍽️', label: 'Dine In', bg: 'bg-blue-100', text: 'text-blue-700', shadow: 'shadow-[0_2px_0_#93c5fd]' };
      case 'pickup': return { icon: '🛍️', label: 'Takeaway', bg: 'bg-green-100', text: 'text-green-700', shadow: 'shadow-[0_2px_0_#86efac]' };
      case 'delivery': return { icon: '🛵', label: 'Delivery', bg: 'bg-orange-100', text: 'text-orange-700', shadow: 'shadow-[0_2px_0_#fdba74]' };
      default: return { icon: '📋', label: 'Other', bg: 'bg-gray-100', text: 'text-gray-700', shadow: 'shadow-[0_2px_0_#d1d5db]' };
    }
  };

  const getStatusDetails = (status) => {
    const styles = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', shadow: 'shadow-[0_2px_0_#fcd34d]' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', shadow: 'shadow-[0_2px_0_#93c5fd]' },
      preparing: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', shadow: 'shadow-[0_2px_0_#d8b4fe]' },
      ready: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', shadow: 'shadow-[0_2px_0_#86efac]' },
      served: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', shadow: 'shadow-[0_2px_0_#c7d2fe]' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', shadow: 'shadow-[0_2px_0_#6ee7b7]' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', shadow: 'shadow-[0_2px_0_#fca5a5]' }
    };
    return styles[status] || styles.pending;
  };

  const printKOT = async (order) => {
    setKotPrinting(order._id);
    try {
      const response = await axios.get(`${API_URL}/api/admin-orders/kot/${order._id}`);
      if (response.data.success) {
        const orderTotal = calculateOrderTotal(order.items);
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>KOT - ${order.orderNumber}</title>
              <style>
                body { font-family: monospace; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .items { width: 100%; border-collapse: collapse; }
                .items th, .items td { text-align: left; padding: 5px; border-bottom: 1px dashed #ccc; }
                .total { margin-top: 20px; text-align: right; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Kitchen Order Ticket</h2>
                <p>Order #: ${order.orderNumber}</p>
                <p>Customer: ${order.customer}</p>
                <p>Phone: ${order.phone}</p>
                <p>Table: ${order.tableId || 'N/A'}</p>
                <p>KOT #: ${order.kotCount || 1}</p>
              </div>
              <table class="items">
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.qty}</td>
                      <td>₹${item.price}</td>
                      <td>₹${item.price * item.qty}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="total">
                <p><strong>Total: ₹${orderTotal}</strong></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing KOT:', error);
      alert('Failed to print KOT');
    } finally {
      setTimeout(() => setKotPrinting(null), 500);
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/admin-orders/status/${orderId}`, {
        status: newStatus
      });
      if (response.data.success) {
        setAllOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
        fetchStats();
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusActions = (order) => {
    const actions = [];
    if (order.status === 'pending') {
      actions.push({ label: 'Confirm', status: 'confirmed', color: clay.btn.blue });
    }
    if (order.status === 'confirmed') {
      actions.push({ label: 'Start Preparing', status: 'preparing', color: clay.btn.purple });
    }
    if (order.status === 'preparing') {
      actions.push({ label: 'Mark Ready', status: 'ready', color: clay.btn.green });
    }
    if (order.status === 'ready') {
      actions.push({ label: 'Mark Served', status: 'served', color: clay.btn.blue });
    }
    if (order.status === 'served') {
      actions.push({ label: 'Complete', status: 'completed', color: clay.btn.green });
    }
    return actions;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statColors = [
    { label: "Total Orders", key: "total", color: "#d1d5db", textColor: "text-gray-900", icon: "📋" },
    { label: "Dine In", key: "dineIn", color: "#93c5fd", textColor: "text-blue-600", icon: "🍽️" },
    { label: "Takeaway", key: "takeaway", color: "#86efac", textColor: "text-green-600", icon: "🛍️" },
    { label: "Active Orders", key: "active", color: "#fde68a", textColor: "text-amber-600", icon: "⚡" },
    { label: "Completed", key: "completed", color: "#6ee7b7", textColor: "text-emerald-600", icon: "✓" },
    { label: "Total Revenue", key: "revenue", color: "#d8b4fe", textColor: "text-purple-600", icon: "💰" },
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading orders...</p>
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
      
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">
          
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Order Management</h1>
              <p className="text-gray-400 text-sm mt-1">Track and manage all your restaurant orders</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSummaryModal(true)}
                disabled={orders.length === 0}
                className={clay.btn.secondary + " px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"}
              >
                🖨️ Print Summary
              </button>
              <button className={clay.btn.secondary + " px-5 py-2.5 text-sm"}>
                📊 Export Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            {statColors.map(({ label, key, color, textColor, icon }) => (
              <div key={key} className={clay.statCard(color)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className={`text-2xl font-semibold mt-1 ${textColor}`}>
                  {key === "revenue" ? formatCurrency(stats.totalRevenue) : (stats[key] ?? 0)}
                </p>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className={clay.card + " mb-6"}>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clay.input + " pl-10"}
                />
              </div>
            </div>
            
            <div className="p-4 flex flex-wrap items-center gap-2">
              {orderTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveOrderType(type.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    activeOrderType === type.id
                      ? "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00] translate-y-0"
                      : "bg-gray-100 text-gray-600 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px]"
                  }`}
                >
                  <span className="mr-1.5">{type.icon}</span>
                  {type.label}
                </button>
              ))}
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              {statuses.map(status => (
                <button
                  key={status.id}
                  onClick={() => setActiveStatus(status.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    activeStatus === status.id
                      ? "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00] translate-y-0"
                      : "bg-gray-100 text-gray-600 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px]"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className={clay.card + " overflow-hidden"}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order, idx) => {
                    const orderType = getOrderTypeDetails(order.mode || order.orderType);
                    const statusDetails = getStatusDetails(order.status);
                    const orderTotal = calculateOrderTotal(order.items);
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                        className="hover:bg-[#f9fff0] transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800">{order.orderNumber || order._id.slice(-8)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold ${orderType.bg} ${orderType.text} ${orderType.shadow}`}>
                            <span>{orderType.icon}</span>
                            {orderType.label}
                          </span>
                          {order.tableId && (
                            <p className="text-xs text-gray-400 mt-1">Table: {order.tableId.slice(-4)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex w-8 h-8 items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-700 shadow-[0_2px_0_#d1d5db]">
                            {order.items?.length || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-green-600">{formatCurrency(orderTotal)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold ${statusDetails.bg} ${statusDetails.text} ${statusDetails.shadow}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dot}`}></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => printKOT(order)}
                              disabled={kotPrinting === order._id}
                              className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-xl shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] hover:shadow-[0_1px_0_#d1d5db] transition-all"
                              title="Print KOT"
                            >
                              🖨️ KOT
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-600 rounded-xl shadow-[0_2px_0_#93c5fd] hover:translate-y-[1px] hover:shadow-[0_1px_0_#93c5fd] transition-all"
                              title="View Details"
                            >
                              👁️ View
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {orders.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-400 text-sm font-medium">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Filter Modal */}
      <SummaryFilterModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onApply={handleGenerateReport}
      />

      {/* Summary Preview Modal */}
      <SummaryPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        summaryData={summaryData}
        onPrint={handlePrintReport}
        onExport={handleExportToExcel}
      />

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white max-w-2xl w-full max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</p>
                </div>
                <button 
                  onClick={() => setShowOrderDetails(false)} 
                  className="bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 w-9 h-9 flex items-center justify-center text-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Order Type</p>
                    <p className="text-sm font-semibold text-gray-800">{getOrderTypeDetails(selectedOrder.mode || selectedOrder.orderType).label}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Customer Name</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedOrder.customer}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedOrder.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Order Time</p>
                    <p className="text-sm font-semibold text-gray-800">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemTotal = item.price * item.qty;
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl shadow-[0_2px_0_#e5e7eb]">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty} × ₹{item.price}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-800">₹{itemTotal}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Bill Summary */}
                  {(() => {
                    const subtotal = calculateOrderTotal(selectedOrder.items);
                    const tax = calculateGST(subtotal);
                    const total = subtotal + tax;
                    return (
                      <div className="mt-4 pt-4 border-t-2 border-gray-100">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold text-gray-800">₹{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">GST (5%)</span>
                            <span className="font-semibold text-gray-800">₹{tax}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-dashed border-gray-200">
                            <span className="text-gray-900">Total Amount</span>
                            <span className="text-green-600">₹{total}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Status Actions */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {getStatusActions(selectedOrder).map(action => (
                      <button
                        key={action.status}
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, action.status);
                          setShowOrderDetails(false);
                        }}
                        className={`${action.color} px-4 py-2 text-sm`}
                      >
                        {action.label}
                      </button>
                    ))}
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order?')) {
                            updateOrderStatus(selectedOrder._id, 'cancelled');
                            setShowOrderDetails(false);
                          }
                        }}
                        className={clay.btn.danger + " px-4 py-2 text-sm"}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => printKOT(selectedOrder)}
                    disabled={kotPrinting === selectedOrder._id}
                    className={clay.btn.primary + " flex-1 py-3 text-sm"}
                  >
                    {kotPrinting === selectedOrder._id ? 'Printing...' : '🖨️ Print KOT'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}