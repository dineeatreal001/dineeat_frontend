"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import OrderPanel from './OrderPanel';
import axios from 'axios';
import socket from '@/lib/socket';

// Clay Design Tokens
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
  },
  card: "bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb,0_8px_20px_rgba(0,0,0,0.06)] border border-white/80",
};

// Password Modal Component
function PasswordModal({ isOpen, onClose, onVerify, title = "Authentication Required" }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (password === '1234') {
      onVerify(true);
      onClose();
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            This action requires manager authorization. Please enter the password to continue.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Password</label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter 4-digit password"
              maxLength={4}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white transition-all"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (num === '⌫') {
                    setPassword(prev => prev.slice(0, -1));
                  } else if (num !== '') {
                    if (password.length < 4) setPassword(prev => prev + num);
                  }
                }}
                className={`py-3 rounded-xl text-xl font-bold transition-all ${
                  num === '⌫' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : num === '' ? 'bg-transparent cursor-default'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                }`}
              >
                {num === '⌫' ? '⌫' : num}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 bg-[#a3e635] text-gray-900 rounded-xl font-semibold hover:bg-[#bef264] transition">
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Change Table Modal Component - Now user selects both source and target tables
function ChangeTableModal({ isOpen, onClose, tables, onConfirm }) {
  const [sourceTableId, setSourceTableId] = useState('');
  const [targetTableId, setTargetTableId] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSourceTableId('');
      setTargetTableId('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!sourceTableId) {
      alert('Please select a source table to transfer from');
      return;
    }
    if (!targetTableId) {
      alert('Please select a target table to transfer to');
      return;
    }
    if (sourceTableId === targetTableId) {
      alert('Source and target tables cannot be the same');
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordVerified = () => {
    const sourceTable = tables.find(t => t._id === sourceTableId);
    const targetTable = tables.find(t => t._id === targetTableId);
    if (sourceTable && targetTable) {
      onConfirm(sourceTable, targetTable);
      onClose();
      setSourceTableId('');
      setTargetTableId('');
    }
  };

  if (!isOpen) return null;

  const sourceTable = tables.find(t => t._id === sourceTableId);
  const hasOrderItems = sourceTable && (sourceTable.hasActiveOrder || (sourceTable.items && sourceTable.items.length > 0));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="bg-white rounded-2xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Transfer Order</h3>
                  <p className="text-xs text-blue-200">Move order from one table to another</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-xl text-white hover:bg-white/30 transition text-lg font-bold">×</button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* From → To visual */}
            <div className="flex items-center gap-3">
              {/* Source Table Selection */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">From</p>
                <select
                  value={sourceTableId}
                  onChange={(e) => setSourceTableId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a3e635] transition-all"
                >
                  <option value="">Select source table</option>
                  {tables.filter(t => t.isActive !== false).map(table => (
                    <option key={table._id} value={table._id}>
                      {table.name} {table.location ? `(${table.location})` : ''}
                    </option>
                  ))}
                </select>
                {sourceTableId && !hasOrderItems && (
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> No active order on this table
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="flex-shrink-0 mt-5">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </div>
              </div>

              {/* Target Table Selection */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">To</p>
                <select
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a3e635] transition-all"
                  disabled={!sourceTableId}
                >
                  <option value="">Select target table</option>
                  {tables
                    .filter(t => t._id !== sourceTableId && t.isActive !== false)
                    .map(table => (
                      <option key={table._id} value={table._id}>
                        {table.name} {table.location ? `(${table.location})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Warning */}
            {sourceTableId && targetTableId && (
              <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 border border-amber-200">
                <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 leading-snug">
                  All items, KOT history, and customer details will be moved from <strong>{sourceTable?.name}</strong> to <strong>{tables.find(t => t._id === targetTableId)?.name}</strong>.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition shadow-[0_3px_0_#d1d5db] active:translate-y-[2px]">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!sourceTableId || !targetTableId || sourceTableId === targetTableId || !hasOrderItems}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-[0_3px_0_#1d4ed8] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
                Transfer Order
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onVerify={handlePasswordVerified}
        title="Manager Authorization Required"
      />
    </>
  );
}

export default function Tables({ ctx }) {
  const { orders, selectedTable, setSelectedTable, mode, setMode, storeId, activeTab, setActiveTab, updateTableOrder, getTableOrder } = ctx;
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('all');
  const [sections, setSections] = useState([{ id: 'all', name: 'All Tables' }]);
  const [error, setError] = useState(null);
  const [liveTrackingData, setLiveTrackingData] = useState({});
  const [localStorageOrders, setLocalStorageOrders] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showChangeTableModal, setShowChangeTableModal] = useState(false);

  const liveTrackingDataRef = useRef(liveTrackingData);
  const tablesRef = useRef(tables);
  const isConnectedRef = useRef(isConnected);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { liveTrackingDataRef.current = liveTrackingData; }, [liveTrackingData]);
  useEffect(() => { tablesRef.current = tables; }, [tables]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);

  const getStoreId = () => {
    if (storeId) return storeId;
    if (typeof window !== 'undefined') {
      const storeData = localStorage.getItem("storeData");
      if (storeData) {
        try { const parsed = JSON.parse(storeData); return parsed.id || parsed._id; } catch (e) {}
      }
      const directStoreId = localStorage.getItem("storeId");
      if (directStoreId) return directStoreId;
    }
    return null;
  };

  const actualStoreId = getStoreId();

  const loadLocalStorageOrders = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem("_orders");
      if (storedOrders) {
        try {
          const parsed = JSON.parse(storedOrders);
          setLocalStorageOrders(parsed);
          return parsed;
        } catch (e) {}
      }
    }
    return {};
  }, []);

  // Check if a table has any items (used to determine if transfer is possible)
  const hasOrderItems = useCallback((tableId) => {
    if (ctx?.orders) {
      const ctxOrder = ctx.orders.get ? ctx.orders.get(tableId) : ctx.orders[tableId];
      if (ctxOrder?.items?.length > 0) return true;
    }
    if (localStorageOrders[tableId]?.items?.length > 0) return true;
    return false;
  }, [ctx?.orders, localStorageOrders]);

  const getTableOrderData = useCallback((tableId) => {
    if (ctx?.orders) {
      const ctxOrder = ctx.orders.get ? ctx.orders.get(tableId) : ctx.orders[tableId];
      if (ctxOrder?.items?.length > 0) return ctxOrder;
    }
    if (localStorageOrders[tableId]?.items?.length > 0) return localStorageOrders[tableId];
    return null;
  }, [ctx?.orders, localStorageOrders]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'hotel_pos_orders') {
        if (e.newValue) {
          try { setLocalStorageOrders(JSON.parse(e.newValue)); } catch (e) {}
        } else {
          setLocalStorageOrders({});
        }
      }
    };
    const handleOrdersUpdated = () => loadLocalStorageOrders();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, [loadLocalStorageOrders]);

  const fetchLiveTrackingData = useCallback(async () => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) return;
    try {
      const response = await axios.get(`${API_URL}/api/live-tracking/${currentStoreId}`);
      if (response.data.success && response.data.tables) {
        const map = {};
        response.data.tables.forEach((table) => {
          map[table.tableId.toString()] = {
            customer: table.customerName, phone: table.phone, total: table.total,
            itemCount: table.itemCount, kotCount: table.kotCount, orderTime: table.orderTime,
            status: table.status, occupiedAt: table.occupiedAt, lastActivityAt: table.lastActivityAt,
            tableName: table.tableName, trackId: table.trackId
          };
        });
        setLiveTrackingData(prev => ({ ...prev, ...map }));
      }
    } catch (error) { console.error("Error fetching live tracking data:", error); }
  }, [API_URL]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const onConnect = () => {
      setIsConnected(true);
      if (actualStoreId) socket.emit("join-store", actualStoreId);
    };
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [actualStoreId]);

  useEffect(() => {
    if (!actualStoreId || !isConnected) return;
    socket.emit("join-store", actualStoreId);

    const handleNewOrder = (orderData) => {
      if (!orderData.tableId) return;
      const tableId = orderData.tableId.toString();
      setLiveTrackingData(prev => {
        const existing = prev[tableId] || {};
        return {
          ...prev,
          [tableId]: {
            ...existing, status: 'active',
            customer: orderData.customerName || existing.customer || "Guest",
            phone: orderData.phone || existing.phone || "",
            total: orderData.total || existing.total || 0,
            itemCount: orderData.itemCount || (orderData.items?.length || 0),
            kotCount: (existing.kotCount || 0) + (orderData.kotCount || 1),
            orderTime: new Date().toISOString(), occupiedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString()
          }
        };
      });
    };

    const handleTablesUpdate = (tablesData) => {
      if (!tablesData || !Array.isArray(tablesData)) return;
      setLiveTrackingData(prev => {
        const newData = { ...prev };
        let hasChanges = false;
        tablesData.forEach((t) => {
          if (t?.tableId) {
            const tableId = t.tableId.toString();
            const existing = newData[tableId] || {};
            if (existing.status !== t.status || existing.total !== t.total || existing.itemCount !== t.itemCount) {
              hasChanges = true;
              newData[tableId] = { ...existing, status: t.status, customer: t.customer || existing.customer, phone: t.phone || existing.phone, total: t.total || existing.total, itemCount: t.itemCount || existing.itemCount, kotCount: t.kotCount || existing.kotCount, lastActivityAt: new Date().toISOString() };
            }
          }
        });
        return hasChanges ? newData : prev;
      });
    };

    const handleOrderCompleted = ({ tableId }) => {
      if (tableId) {
        const tableIdStr = tableId.toString();
        setLiveTrackingData(prev => ({ ...prev, [tableIdStr]: { ...prev[tableIdStr], status: 'completed', lastActivityAt: new Date().toISOString() } }));
      }
    };

    socket.on("new-order", handleNewOrder);
    socket.on("table-updated", handleTablesUpdate);
    socket.on("order-completed", handleOrderCompleted);
    socket.on("order-placed", handleNewOrder);
    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("table-updated", handleTablesUpdate);
      socket.off("order-completed", handleOrderCompleted);
      socket.off("order-placed", handleNewOrder);
    };
  }, [actualStoreId, isConnected]);

  const fetchTables = useCallback(async () => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) { setLoading(false); setError("Store ID not found. Please login again."); return; }
    try {
      setLoading(true); setError(null);
      const storedOrders = loadLocalStorageOrders();
      const [tablesRes, liveTrackingRes] = await Promise.all([
        axios.get(`${API_URL}/api/tables/${currentStoreId}`),
        axios.get(`${API_URL}/api/live-tracking/${currentStoreId}`)
      ]);
      if (tablesRes.data.success) {
        const activeTables = tablesRes.data.tables.map(table => ({
          ...table,
          hasActiveOrder: hasOrderItems(table._id)
        }));
        setTables(activeTables);
        const uniqueLocations = [...new Set(activeTables.map(t => t.location).filter(l => l && l !== ""))];
        setSections([{ id: 'all', name: 'All Tables' }, ...uniqueLocations.map(loc => ({ id: loc, name: loc }))]);
      } else { setError("Failed to load tables"); }
      if (liveTrackingRes.data.success && liveTrackingRes.data.tables) {
        const map = {};
        liveTrackingRes.data.tables.forEach((table) => {
          map[table.tableId.toString()] = { customer: table.customerName, phone: table.phone, total: table.total, itemCount: table.itemCount, kotCount: table.kotCount, orderTime: table.orderTime, status: table.status, occupiedAt: table.occupiedAt, lastActivityAt: table.lastActivityAt, tableName: table.tableName, trackId: table.trackId };
        });
        setLiveTrackingData(map);
      }
    } catch (error) { setError(error.response?.data?.message || "Failed to load data"); }
    finally { setLoading(false); }
  }, [API_URL, loadLocalStorageOrders, hasOrderItems]);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(() => fetchLiveTrackingData(), 5000);
    return () => clearInterval(interval);
  }, [fetchTables, fetchLiveTrackingData]);

  const getTableLiveData = useCallback((tableId) => liveTrackingData[tableId.toString()] || null, [liveTrackingData]);

  const getTableStatus = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.status === 'active') return "occupied";
    if (hasOrderItems(tableId)) return "occupied";
    return "free";
  }, [getTableLiveData, hasOrderItems]);

  const getTableOrderTotal = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.total > 0) return liveData.total;
    const orderData = getTableOrderData(tableId);
    return orderData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0;
  }, [getTableLiveData, getTableOrderData]);

  const getTableItemCount = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.itemCount > 0) return liveData.itemCount;
    const orderData = getTableOrderData(tableId);
    return orderData?.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
  }, [getTableLiveData, getTableOrderData]);

  const getTableKotCount = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.kotCount > 0) return liveData.kotCount;
    return getTableOrderData(tableId)?.kotCount || 0;
  }, [getTableLiveData, getTableOrderData]);

  const getTableCustomer = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.customer && liveData.customer !== "Guest") return liveData.customer;
    return getTableOrderData(tableId)?.customer || "Guest";
  }, [getTableLiveData, getTableOrderData]);

  const getTablePhone = useCallback((tableId) => {
    const liveData = getTableLiveData(tableId);
    if (liveData?.phone) return liveData.phone;
    return getTableOrderData(tableId)?.phone || "";
  }, [getTableLiveData, getTableOrderData]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    localStorage.setItem("selectedTable", JSON.stringify({ tableId: table._id, tableName: table.name }));
    if (ctx?.updateTableOrder) {
      ctx.updateTableOrder(table._id, prev => ({ ...prev, tableId: table._id, tableName: table.name }));
    }
    if (isMobile) setShowOrderPanel(true);
    if (setActiveTab) setActiveTab("order");
  };

  const handleChangeTable = (sourceTable, targetTable) => {
    if (!updateTableOrder || !getTableOrder) return;
    const sourceTableId = sourceTable._id;
    const targetTableId = targetTable._id;
    const sourceOrder = getTableOrder(sourceTableId);
    if (sourceOrder?.items?.length > 0) {
      updateTableOrder(targetTableId, () => ({ ...sourceOrder, tableId: targetTableId, tableName: targetTable.name, kotCount: sourceOrder.kotCount || 0, items: [...(sourceOrder.items || [])], customer: sourceOrder.customer || '', phone: sourceOrder.phone || '', address: sourceOrder.address || '', kotNote: sourceOrder.kotNote || '', covers: sourceOrder.covers || '' }));
      updateTableOrder(sourceTableId, () => ({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 }));
      setLiveTrackingData(prev => {
        const newData = { ...prev };
        newData[sourceTableId] = { ...newData[sourceTableId], status: 'completed', lastActivityAt: new Date().toISOString() };
        newData[targetTableId] = { ...newData[targetTableId], status: 'active', customer: sourceOrder.customer || "Guest", phone: sourceOrder.phone || "", total: sourceOrder.items?.reduce((sum, i) => sum + (i.price * i.qty), 0) || 0, itemCount: sourceOrder.items?.reduce((sum, i) => sum + i.qty, 0) || 0, kotCount: sourceOrder.kotCount || 0, lastActivityAt: new Date().toISOString() };
        return newData;
      });
      // Update tables list to refresh hasActiveOrder flag
      setTables(prev => prev.map(t => ({
        ...t,
        hasActiveOrder: (t._id === targetTableId) || (t._id === sourceTableId ? false : t.hasActiveOrder)
      })));
      alert(`✅ Order transferred from ${sourceTable.name} to ${targetTable.name}`);
    } else {
      alert("No active order to transfer from this table");
    }
  };

  const filteredTables = section === 'all' ? tables : tables.filter(t => t.location === section);
  const occupiedCount = tables.filter(t => getTableStatus(t._id) === 'occupied').length;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f5f5f0] p-4">
        <div className={clay.card + " text-center p-6 max-w-md w-full"}>
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchTables(); }} className={clay.btn.primary + " px-5 py-2 text-sm"}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f5f5f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm font-medium">Loading tables...</p>
        </div>
      </div>
    );
  }

  // ─── Mobile View ──────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-[#f5f5f0]">
        {!isConnected && (
          <div className="bg-amber-500 text-gray-900 text-xs font-semibold py-1.5 px-3 text-center shadow-[0_2px_0_#b45309]">
            ⚡ Reconnecting...
          </div>
        )}

        {/* Header with Change Table button */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-100 shadow-[0_2px_0_#e5e7eb]">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${section === s.id ? "bg-[#a3e635] text-gray-900 shadow-[0_2px_0_#6aaa00]" : "bg-gray-100 text-gray-600 shadow-[0_2px_0_#d1d5db]"}`}>
                {s.name}
              </button>
            ))}
          </div>
          {/* Change Table button - always visible */}
          <button
            onClick={() => setShowChangeTableModal(true)}
            className="ml-2 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-[0_3px_0_#1d4ed8] active:shadow-none active:translate-y-[3px] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
            Transfer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredTables.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className={clay.card + " text-center p-8 w-full"}>
                <div className="text-5xl mb-3">🪑</div>
                <p className="text-gray-400 text-sm mb-3">No tables found</p>
                {section !== 'all' && <button onClick={() => setSection('all')} className="text-[#a3e635] text-sm font-semibold block mb-2">View all tables</button>}
                <button onClick={() => window.location.href = '/dashboard/settings'} className="text-blue-500 text-sm font-semibold">+ Add tables</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTables.map((table, idx) => {
                const status = getTableStatus(table._id);
                const total = getTableOrderTotal(table._id);
                const itemCount = getTableItemCount(table._id);
                const kotCount = getTableKotCount(table._id);
                const customerName = getTableCustomer(table._id);
                return (
                  <motion.button key={table._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.98 }} transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    onClick={() => handleTableClick(table)}
                    className={`relative rounded-xl p-3 text-left transition-all ${status === 'free' ? "bg-gradient-to-br from-green-500 to-green-600 shadow-[0_4px_0_#166534] active:shadow-[0_1px_0_#166534] active:translate-y-[3px]" : "bg-gradient-to-br from-gray-700 to-gray-800 shadow-[0_4px_0_#1f2937] active:shadow-[0_1px_0_#1f2937] active:translate-y-[3px]"}`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{table.name}</span>
                        {status === 'occupied' && <span className="px-1.5 py-0.5 bg-red-500/30 text-red-200 rounded-lg text-[9px] font-semibold">Occupied</span>}
                      </div>
                      {table.capacity && <span className="text-[10px] text-white/50">👥 {table.capacity}</span>}
                      {status === 'occupied' && customerName !== "Guest" && <span className="text-[10px] text-white/70 mt-1 truncate">👤 {customerName}</span>}
                      {status === 'occupied' && (
                        <div className="flex items-center justify-between mt-1">
                          {itemCount > 0 && <span className="text-[9px] text-white/50">📦 {itemCount}</span>}
                          {total > 0 && <span className="text-xs font-bold text-green-300">₹{total.toLocaleString()}</span>}
                        </div>
                      )}
                      {kotCount > 0 && <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-orange-500/40 text-orange-200 rounded-lg text-[8px] font-semibold">KOT {kotCount}</span>}
                      {status === 'free' && <span className="text-[10px] text-white/40 mt-1">✨ Available</span>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {tables.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex justify-between items-center text-xs flex-shrink-0 shadow-[0_-2px_0_#e5e7eb]">
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Free</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-700" />Occupied</span>
            </div>
            <span className="font-semibold text-gray-700">{occupiedCount}/{tables.length}</span>
          </div>
        )}

        {/* Mobile Order Panel Drawer */}
        <AnimatePresence>
          {showOrderPanel && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-0 z-50 bg-white shadow-xl overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-3 flex items-center gap-2 shadow-[0_2px_0_#e5e7eb]">
                  <button onClick={() => setShowOrderPanel(false)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all text-gray-700 font-bold">
                    ←
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{selectedTable?.name}</h3>
                    {selectedTable?.location && <p className="text-[10px] text-gray-400">{selectedTable.location}</p>}
                  </div>
                  <button
                    onClick={() => setShowChangeTableModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-[0_3px_0_#1d4ed8] active:shadow-none active:translate-y-[3px] transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                    Transfer
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <OrderPanel ctx={ctx} isMobileView={true} onClose={() => setShowOrderPanel(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChangeTableModal isOpen={showChangeTableModal} onClose={() => setShowChangeTableModal(false)} tables={tables} onConfirm={handleChangeTable} />
      </div>
    );
  }

  // ─── Desktop View ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-[#f5f5f0]">
      <AnimatePresence>
        {!isConnected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-amber-500 text-gray-900 text-xs font-bold rounded-2xl shadow-[0_3px_0_#b45309] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-900 animate-pulse"></span>
            Reconnecting...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left: Table grid */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar: sections filter + Change Table button */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-100 bg-white shadow-[0_4px_0_#e5e7eb] flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${section === s.id ? "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]" : "bg-gray-100 text-gray-600 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px]"}`}>
                {s.name}
              </button>
            ))}
          </div>

          {/* Change Table button - always visible and active */}
          <button
            onClick={() => setShowChangeTableModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-[0_4px_0_#1d4ed8] hover:shadow-[0_2px_0_#1d4ed8] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
            Transfer Order
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#f5f5f0]">
          {filteredTables.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className={clay.card + " text-center p-12 max-w-md"}>
                <div className="text-6xl mb-4">🪑</div>
                <p className="text-gray-400 text-sm font-medium mb-4">No tables found</p>
                {section !== 'all' && <button onClick={() => setSection('all')} className="text-[#a3e635] hover:text-[#84cc16] text-sm font-semibold transition block mb-2">View all tables</button>}
                <button onClick={() => window.location.href = '/dashboard/settings'} className="text-blue-500 hover:text-blue-600 text-sm font-semibold transition">+ Add tables in Settings</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredTables.map((table, idx) => {
                const status = getTableStatus(table._id);
                const total = getTableOrderTotal(table._id);
                const itemCount = getTableItemCount(table._id);
                const kotCount = getTableKotCount(table._id);
                const customerName = getTableCustomer(table._id);
                const phone = getTablePhone(table._id);
                const isSelected = selectedTable?._id === table._id;
                return (
                  <motion.button key={table._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                    onClick={() => handleTableClick(table)}
                    className={`relative rounded-2xl p-4 text-left transition-all cursor-pointer ${status === 'free' ? "bg-gradient-to-br from-green-500 to-green-600 shadow-[0_6px_0_#166534] hover:shadow-[0_3px_0_#166534] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]" : "bg-gradient-to-br from-gray-700 to-gray-800 shadow-[0_6px_0_#1f2937] hover:shadow-[0_3px_0_#1f2937] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]"} ${isSelected ? 'ring-2 ring-[#a3e635] ring-offset-2 ring-offset-gray-100' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-lg">{table.name}</span>
                        {status === 'occupied' && <span className="px-2 py-0.5 bg-red-500/30 text-red-200 rounded-xl text-[10px] font-semibold">Occupied</span>}
                      </div>
                      {table.capacity && <span className="text-xs text-white/60">👥 {table.capacity} guests</span>}
                      {table.location && <span className="text-xs text-white/40">📍 {table.location}</span>}
                      {status === 'occupied' && (
                        <>
                          {customerName !== "Guest" && <span className="text-xs text-white font-medium mt-2 truncate">👤 {customerName}</span>}
                          {phone && <span className="text-[10px] text-white/50 truncate">📱 {phone}</span>}
                          <div className="flex items-center justify-between mt-2">
                            {itemCount > 0 && <span className="text-xs text-white/70">📦 {itemCount} item{itemCount !== 1 ? "s" : ""}</span>}
                            {total > 0 && <span className="text-sm font-bold text-green-300">₹{total.toLocaleString()}</span>}
                          </div>
                          {kotCount > 0 && <span className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500/40 text-orange-200 rounded-xl text-[10px] font-semibold">KOT {kotCount}</span>}
                        </>
                      )}
                      {status === 'free' && <div className="mt-2"><span className="text-xs text-white/50">✨ Available</span></div>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom legend */}
        {tables.length > 0 && (
          <div className="px-4 py-3 border-t-2 border-gray-100 bg-white flex items-center justify-between text-xs text-gray-500 flex-shrink-0 shadow-[0_-4px_0_#e5e7eb]">
            <div className="flex gap-4">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_1px_0_#166534]" />Free</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-700 shadow-[0_1px_0_#1f2937]" />Occupied</span>
              {!isConnected && <span className="flex items-center gap-2 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Connecting...</span>}
              {isConnected && <span className="flex items-center gap-2 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Live</span>}
            </div>
            <span className="font-semibold text-gray-700">{occupiedCount} / {tables.length} tables occupied</span>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-shrink-0">
        <OrderPanel ctx={ctx} />
      </div>

      <ChangeTableModal isOpen={showChangeTableModal} onClose={() => setShowChangeTableModal(false)} tables={tables} onConfirm={handleChangeTable} />
    </div>
  );
}