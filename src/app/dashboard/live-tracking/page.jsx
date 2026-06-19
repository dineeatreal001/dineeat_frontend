"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import axios from "axios";
import socket from "@/lib/socket";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

export default function LiveTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [tables, setTables] = useState([]);
  const [takeawayOrdersList, setTakeawayOrdersList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [selectedTakeaway, setSelectedTakeaway] = useState(null);
  const [showTakeawayDetails, setShowTakeawayDetails] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  const [liveTrackingData, setLiveTrackingData] = useState({});
  const [liveTakeaway, setLiveTakeaway] = useState({});

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

  // Fetch live tracking data from API
  const fetchLiveTrackingData = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;

    try {
      const response = await axios.get(`${API_URL}/api/live-tracking/${currentStoreId}`);
      if (response.data.success && response.data.tables) {
        const map = {};
        response.data.tables.forEach((table) => {
          map[table.tableId.toString()] = {
            trackId: table.trackId,
            tableId: table.tableId,
            tableName: table.tableName,
            customer: table.customerName,
            phone: table.phone,
            total: table.total,
            itemCount: table.itemCount,
            kotCount: table.kotCount,
            orderTime: table.orderTime,
            status: table.status,
            occupiedAt: table.occupiedAt,
            lastActivityAt: table.lastActivityAt
          };
        });
        setLiveTrackingData(map);
      }
    } catch (error) {
      console.error("Error fetching live tracking data:", error);
    }
  };

  // Fetch tables from API
  const fetchTables = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;

    try {
      const response = await axios.get(`${API_URL}/api/tables/${currentStoreId}`);
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // Fetch takeaway orders
  const fetchTakeawayOrders = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;

    try {
      const response = await axios.get(`${API_URL}/api/admin-orders/?storeId=${currentStoreId}&orderType=pickup&limit=50`);
      if (response.data.success) {
        const activeOrders = response.data.orders.filter(
          order => order.status !== 'completed' && order.status !== 'cancelled'
        );
        setTakeawayOrdersList(activeOrders);
      }
    } catch (error) {
      console.error("Error fetching takeaway orders:", error);
    }
  };

  // Socket.IO Connection for real-time updates
  useEffect(() => {
    const currentStoreId = getStoreIdFromStorage();
    
    socket.on("connect", () => {
      console.log("🟢 Socket Connected", socket.id);
      if (currentStoreId) {
        console.log("🏪 Joining Store:", currentStoreId);
        socket.emit("join-store", currentStoreId);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    socket.on("table-updated", (tablesData) => {
      console.log("📡 Live Table Update:", tablesData);
      const map = { ...liveTrackingData };
      tablesData.forEach((t) => {
        map[t.tableId.toString()] = {
          ...map[t.tableId.toString()],
          status: t.status,
          customer: t.customer,
          phone: t.phone,
          total: t.total,
          itemCount: t.itemCount,
          kotCount: t.kotCount
        };
      });
      setLiveTrackingData(map);
    });

    socket.on("takeaway-updated", (takeawayData) => {
      console.log("📡 Live Takeaway Update:", takeawayData);
      const map = {};
      takeawayData.forEach((t) => {
        map[t.orderId] = t;
      });
      setLiveTakeaway(map);
      
      setTakeawayOrdersList(prev => {
        const updated = [...prev];
        takeawayData.forEach(update => {
          const index = updated.findIndex(o => o._id === update.orderId);
          if (index !== -1) {
            updated[index] = { ...updated[index], status: update.status };
          }
        });
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("table-updated");
      socket.off("takeaway-updated");
    };
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await getStoreIdFromStorage();
      await Promise.all([
        fetchTables(),
        fetchTakeawayOrders(),
        fetchLiveTrackingData()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Update live time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTakeawayStatusColor = (status) => {
    switch(status) {
      case 'ready': return 'bg-green-100 text-green-700 shadow-[0_2px_0_#86efac]';
      case 'preparing': return 'bg-blue-100 text-blue-700 shadow-[0_2px_0_#93c5fd]';
      case 'pending': return 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]';
      case 'collected': return 'bg-gray-100 text-gray-700 shadow-[0_2px_0_#d1d5db]';
      default: return 'bg-gray-100 text-gray-700 shadow-[0_2px_0_#d1d5db]';
    }
  };

  const updateTakeawayStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin-orders/status/${orderId}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating takeaway status:", error);
    }
  };

  const TableDetailsModal = ({ table, onClose }) => {
    if (!table) return null;
    const liveData = liveTrackingData[table._id];
    
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
          className={clay.modal + " max-w-md w-full"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{table.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">Table Details</p>
            </div>
            <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold ${
                  liveData?.status === 'active' ? 'bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]' :
                  table.status === 'reserved' ? 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]' :
                  'bg-green-100 text-green-700 shadow-[0_2px_0_#86efac]'
                }`}>
                  {liveData?.status === 'active' ? 'Occupied' : (table.status === 'reserved' ? 'Reserved' : 'Available')}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Capacity</p>
                <p className="text-sm font-bold text-gray-800">{table.capacity} guests</p>
              </div>
            </div>

            {liveData?.status === 'active' && (
              <>
                <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Customer Name</p>
                  <p className="text-sm font-bold text-gray-800">{liveData.customer || 'Guest'}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-gray-800">{liveData.phone || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Order Time</p>
                    <p className="text-sm font-bold text-gray-800">
                      {liveData.orderTime ? new Date(liveData.orderTime).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Items</p>
                    <p className="text-sm font-bold text-gray-800">{liveData.itemCount || 0} items</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Order Value</p>
                    <p className="text-sm font-bold text-green-600">₹{liveData.total || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">KOT Count</p>
                    <p className="text-sm font-bold text-gray-800">{liveData.kotCount || 0}</p>
                  </div>
                </div>
              </>
            )}

            {table.location && (
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-bold text-gray-800">{table.location}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {(liveData?.status === 'active' || table.status === 'occupied') && (
                <>
                  <button className={clay.btn.primary + " flex-1 py-3 text-sm"}>
                    View Bill
                  </button>
                  <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>
                    Close
                  </button>
                </>
              )}
              {table.status === 'reserved' && (
                <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>
                  Close
                </button>
              )}
              {(!liveData && table.status !== 'reserved') && (
                <button className={clay.btn.primary + " flex-1 py-3 text-sm"}>
                  New Order
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const TakeawayDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
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
          className={clay.modal + " max-w-md w-full"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Takeaway Order</h2>
              <p className="text-sm text-gray-400 mt-0.5">Order ID: {order.orderNumber}</p>
            </div>
            <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold ${getTakeawayStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Items</p>
                <p className="text-sm font-bold text-gray-800">{order.items?.length || 0} items</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Customer Name</p>
              <p className="text-sm font-bold text-gray-800">{order.customer}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Phone Number</p>
              <p className="text-sm font-bold text-gray-800">{order.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Order Time</p>
                <p className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-sm font-bold text-green-600">₹{order.total}</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-700">{item.name} × {item.qty}</span>
                    <span className="font-semibold text-gray-800">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {order.status === 'pending' && (
                <button 
                  onClick={() => {
                    updateTakeawayStatus(order._id, 'preparing');
                    onClose();
                  }}
                  className={clay.btn.blue + " flex-1 py-3 text-sm"}
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button 
                  onClick={() => {
                    updateTakeawayStatus(order._id, 'ready');
                    onClose();
                  }}
                  className={clay.btn.green + " flex-1 py-3 text-sm"}
                >
                  Mark as Ready
                </button>
              )}
              {order.status === 'ready' && (
                <button 
                  onClick={() => {
                    updateTakeawayStatus(order._id, 'collected');
                    onClose();
                  }}
                  className={clay.btn.primary + " flex-1 py-3 text-sm"}
                >
                  Mark as Collected
                </button>
              )}
              <button className={clay.btn.secondary + " flex-1 py-3 text-sm"}>
                Print Bill
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const getLiveTakeawayStatus = (orderId) => {
    return liveTakeaway[orderId]?.status || null;
  };

  const getTableLiveData = (tableId) => {
    return liveTrackingData[tableId] || null;
  };

  const activeTakeawayOrders = takeawayOrdersList.filter(o => o.status !== 'collected');
  const readyTakeawayOrders = takeawayOrdersList.filter(o => o.status === 'ready');
  
  const occupiedTables = tables.filter(t => getTableLiveData(t._id)?.status === 'active').length;
  const availableTables = tables.filter(t => !getTableLiveData(t._id) && t.status !== 'reserved').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;

  const statColors = [
    { label: "Occupied Tables", key: "occupied", color: "#fca5a5", textColor: "text-red-600", icon: "🪑", value: occupiedTables },
    { label: "Available Tables", key: "available", color: "#86efac", textColor: "text-green-600", icon: "🪑", value: availableTables },
    { label: "Reserved Tables", key: "reserved", color: "#fde68a", textColor: "text-amber-600", icon: "📅", value: reservedTables },
    { label: "Active Takeaway", key: "active", color: "#93c5fd", textColor: "text-blue-600", icon: "🛍️", value: activeTakeawayOrders.length },
    { label: "Ready for Pickup", key: "ready", color: "#86efac", textColor: "text-green-600", icon: "✅", value: readyTakeawayOrders.length },
  ];

  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading live tracking...</p>
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
          <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Live Tracking</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time table and order status</p>
            </div>
            <div className="bg-white rounded-2xl px-5 py-2.5 shadow-[0_4px_0_#e5e7eb]">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Last updated</p>
              <p className="text-sm font-bold text-gray-800">{liveTime.toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statColors.map(({ label, color, textColor, icon, value }) => (
              <div key={label} className={clay.statCard(color)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className={`text-2xl font-semibold mt-1 ${textColor}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tables Section - Improved Responsive Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Dining Tables</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tables.map((table) => {
                const liveData = getTableLiveData(table._id);
                const isOccupied = liveData?.status === 'active';
                const isReserved = table.status === 'reserved';
                const status = isOccupied ? 'occupied' : (isReserved ? 'reserved' : 'available');
                const orderTotal = liveData?.total || 0;
                const itemCount = liveData?.itemCount || 0;
                const kotCount = liveData?.kotCount || 0;
                
                return (
                  <motion.button
                    key={table._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setSelectedTable(table);
                      setShowTableDetails(true);
                    }}
                    className={`relative rounded-2xl p-4 text-left transition-all cursor-pointer shadow-[0_6px_0_rgba(0,0,0,0.2)] hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]
                      ${status === 'available' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : status === 'occupied'
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                        : 'bg-gradient-to-br from-amber-500 to-amber-600'
                      }
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-white text-lg">{table.name}</span>
                      {table.capacity && (
                        <span className="text-xs text-white/60">
                          👥 {table.capacity} guests
                        </span>
                      )}
                      {table.location && (
                        <span className="text-xs text-white/40">
                          📍 {table.location}
                        </span>
                      )}
                      
                      {status === 'occupied' && liveData && (
                        <>
                          <span className="text-xs text-white font-medium mt-2 truncate">
                            👤 {liveData.customer || "Guest"}
                          </span>
                          {liveData.phone && (
                            <span className="text-[10px] text-white/50 truncate">
                              📱 {liveData.phone}
                            </span>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-white/70">
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            <span className="text-sm font-bold text-green-300 font-mono">
                              ₹{orderTotal.toLocaleString()}
                            </span>
                          </div>
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-orange-500/30 text-orange-200 rounded-xl text-[10px] font-semibold">
                            KOT {kotCount}
                          </span>
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-red-500/30 text-red-200 rounded-xl text-[10px] font-semibold">
                            Occupied
                          </span>
                        </>
                      )}
                      
                      {status === 'reserved' && (
                        <>
                          <span className="text-xs text-white font-medium mt-2 truncate">
                            👤 Reserved
                          </span>
                          <span className="text-xs text-white/50 mt-1">✨ Coming soon</span>
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/30 text-amber-200 rounded-xl text-[10px] font-semibold">
                            Reserved
                          </span>
                        </>
                      )}
                      
                      {status === 'available' && (
                        <div className="mt-2">
                          <span className="text-xs text-white/60">✨ Available</span>
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-white/20 text-white rounded-xl text-[10px] font-semibold">
                            Free
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Takeaway Orders Section */}
          {activeTakeawayOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Takeaway Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTakeawayOrders.map((order) => {
                  const liveStatus = getLiveTakeawayStatus(order._id);
                  const displayStatus = liveStatus || order.status;
                  
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        setSelectedTakeaway(order);
                        setShowTakeawayDetails(true);
                      }}
                      className="bg-white rounded-2xl p-4 cursor-pointer transition-all shadow-[0_6px_0_#e5e7eb,0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.06)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{order.customer}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold ${getTakeawayStatusColor(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">{order.phone}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{order.items?.length || 0} items</span>
                        <span className="text-sm font-bold text-green-600">₹{order.total}</span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t-2 border-gray-100">
                        <p className="text-xs text-gray-400">Order Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTableDetails && selectedTable && (
          <TableDetailsModal table={selectedTable} onClose={() => setShowTableDetails(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTakeawayDetails && selectedTakeaway && (
          <TakeawayDetailsModal order={selectedTakeaway} onClose={() => setShowTakeawayDetails(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}