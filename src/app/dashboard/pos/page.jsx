"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed, LayoutGrid, Bell, Settings,
  LogOut, ReceiptText, Users, RefreshCw, LayoutDashboard,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Tables from "@/components/pos/Tables";
import Order from "@/components/pos/Order";
import Bills from "@/components/pos/Bills";
import Customers from "@/components/pos/Customers";
import Dashboard from "@/components/pos/Dashboard";
import { loadOrders, saveOrders, loadBills, saveBills, loadCustomers, saveCustomers } from "@/lib/data";

export default function POSPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tables");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [orders, setOrders] = useState(loadOrders);
  const [bills, setBills] = useState(loadBills);
  const [customers, setCustomers] = useState(loadCustomers);
  const [selectedTable, setSelectedTable] = useState(null);
  const [mode, setMode] = useState("dine_in");
  const [notifications, setNotifications] = useState([]);

  // Persist data with proper error handling
  useEffect(() => { 
    try {
      saveOrders(orders); 
    } catch (error) {
      console.error("Error saving orders:", error);
    }
  }, [orders]);
  
  useEffect(() => { 
    try {
      saveBills(bills); 
    } catch (error) {
      console.error("Error saving bills:", error);
    }
  }, [bills]);
  
  useEffect(() => { 
    try {
      saveCustomers(customers); 
    } catch (error) {
      console.error("Error saving customers:", error);
    }
  }, [customers]);

const getTableOrder = useCallback((tableId) => {
  return orders[tableId] || {
    tableId,
    tableName: "",
    items: [],
    customer: '',
    phone: '',
    kotNote: '',
    covers: '',
    kotCount: 0
  };
}, [orders]);

  const updateTableOrder = useCallback((tableId, updater) => {
    setOrders(prev => {
      try {
const current =
  prev[tableId] || {
    tableId,
    tableName: "",
    items: [],
    customer: '',
    phone: '',
    kotNote: '',
    covers: '',
    kotCount: 0
  };
  
  const updated = typeof updater === 'function' ? updater(current) : updater;
        
        // Ensure items have unique IDs for React keys
        if (updated.items && updated.items.length > 0) {
          updated.items = updated.items.map((item, idx) => ({
            ...item,
            uniqueKey: item.uniqueOrderId || item.id || item.itemId || `${item.name}_${idx}_${Date.now()}_${Math.random()}`
          }));
        }
        
        return { ...prev, [tableId]: updated };
      } catch (error) {
        console.error("Error updating table order:", error);
        return prev;
      }
    });
  }, []);

    const addNotification = useCallback((msg) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    setNotifications(n => [{ id, msg }, ...n.slice(0, 4)]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 3000);
  }, []);
  
const addKot = useCallback((tableId) => {

  console.log("ADD KOT CALLED");
  console.log("TIME:", Date.now());

  const current = orders[tableId];

  if (!current || current.items.length === 0) {
    return;
  }

  // Prevent duplicate click
  if (
    current.lastKotSavedAt &&
    Date.now() - current.lastKotSavedAt < 3000
  ) {

    console.log("Duplicate KOT blocked");
    return;

  }

  console.log("===============");
  console.log("SAVE KOT");
  console.log("TABLE:", tableId);
  console.log("ITEMS:", current.items.length);
  console.log("===============");

  const kotNum =
    (current.kotCount || 0) + 1;

  const total =
    current.items.reduce(
      (s, i) =>
        s + (i.price * i.qty || 0),
      0
    );

  const bill = {

    id:
      `kot_${Date.now()}_${Math.random()}`,

    tableId,
    tableName:
  current.tableName,

    kotNum,

    items:
      [...current.items],

    customer:
      current.customer,

    phone:
      current.phone,

    covers:
      current.covers,

    kotNote:
      current.kotNote,

    total,

    type: "KOT",

    timestamp:
      new Date().toISOString(),

    mode,

  };

  // =========================
  // UPDATE BILLS
  // =========================

  setBills(prevBills => {

    const existingKot =
      prevBills.find(
        x =>
          x.tableId === tableId &&
          x.type === "KOT"
      );

    if (existingKot) {

      console.log(
        "Updating existing KOT"
      );

      return prevBills.map(x =>
        x.id === existingKot.id
          ? {
              ...x,
              items:
                [...current.items],
              customer:
                current.customer,
              phone:
                current.phone,
              covers:
                current.covers,
              kotNote:
                current.kotNote,
              total,
              timestamp:
                new Date().toISOString(),
            }
          : x
      );

    }

    console.log(
      "Creating new KOT"
    );

    return [
      bill,
      ...prevBills
    ];

  });

  // =========================
  // NOTIFICATION
  // =========================

  addNotification(
    `KOT saved for table ${
      current.tableName ||
      tableId
    }`
  );

  // =========================
  // UPDATE ORDERS
  // =========================

  setOrders(prev => ({

    ...prev,

    [tableId]: {

      ...prev[tableId],

      kotCount:
        kotNum,

      lastKot:
        [...current.items],

      lastKotSavedAt:
        Date.now(),

    },

  }));

}, [
  orders,
  mode,
  addNotification
]);

  const generateBill = useCallback((tableId) => {
    const current = orders[tableId];
    if (!current || current.items.length === 0) return null;
    
    const subtotal = current.items.reduce((s, i) => s + (i.price * i.qty || 0), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = Math.round(subtotal * 1.05);
    
    const bill = {
      id: `bill_${Date.now()}_${Math.random()}`,
      tableId,
      tableName: current.tableName,
      kotNum: current.kotCount || 1,
      items: current.items,
      customer: current.customer || "Walk-in Customer",
      phone: current.phone || "",
      covers: current.covers,
      kotNote: current.kotNote,
      subtotal,
      tax,
      total,
      type: 'BILL',
      timestamp: new Date().toISOString(),
      mode,
    };
    
    setBills(b => [bill, ...b]);
    setOrders(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    
    addNotification(`Bill generated for table ${current.tableName || tableId}`);
    return bill;
  }, [orders, mode]);



  const navItems = [
    { icon: LayoutDashboard, path: 'dashboard', label: 'Dashboard', key: 'dashboard' },
    { icon: LayoutGrid, path: 'tables', label: 'Tables', key: 'tables' },
    { icon: UtensilsCrossed, path: 'order', label: 'Order', key: 'order' },
    { icon: ReceiptText, path: 'bills', label: 'Bills', key: 'bills' },
    { icon: Users, path: 'customers', label: 'Customers', key: 'customers' },
  ];

  const ctx = {
    orders,
    activeTab,
    setActiveTab,
    updateTableOrder,
    getTableOrder,
    addKot,
    generateBill,
    selectedTable,
    setSelectedTable,
    mode,
    setMode,
    bills,
    setBills,
    customers,
    setCustomers,
    addNotification
  };

  const renderContent = () => {
    try {
      switch(activeTab) {
        case 'dashboard':
          return <Dashboard ctx={ctx} />;
        case 'tables':
          return <Tables ctx={ctx} />;
        case 'order':
          return <Order ctx={ctx} />;
        case 'bills':
          return <Bills ctx={ctx} />;
        case 'customers':
          return <Customers ctx={ctx} />;
        default:
          return <Tables ctx={ctx} />;
      }
    } catch (error) {
      console.error("Error rendering content:", error);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600">Error loading content. Please refresh the page.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav 
        className={`bg-gray-900 flex flex-col py-4 fixed h-full z-20 shadow-xl transition-all duration-300 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo with expand/collapse */}
        <div className={`flex items-center mb-6 px-3 ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-2">
            <div className="p-2 text-green-500">
              <UtensilsCrossed size={22} />
            </div>
            {sidebarExpanded && (
              <span className="text-white font-bold text-lg">DineEat POS</span>
            )}
          </div>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Back to Dashboard Button */}
        <div className="px-3 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition group"
          >
            <span className="text-lg">←</span>
            {sidebarExpanded && (
              <span className="text-sm font-medium">Back to Dashboard</span>
            )}
            {!sidebarExpanded && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                Back to Dashboard
              </span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 h-px bg-gray-800 my-2" />

        {/* Navigation Items */}
        <div className="flex-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all relative group
                ${activeTab === item.path 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              title={item.label}
            >
              <item.icon size={18} />
              {sidebarExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!sidebarExpanded && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-3 mt-auto">
          <button 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-800 transition-all relative group"
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                // Clear any sensitive data if needed
                localStorage.removeItem('storeId');
                router.push('/login');
              }
            }}
          >
            <LogOut size={16} />
            {sidebarExpanded && (
              <span className="text-sm font-medium">Logout</span>
            )}
            {!sidebarExpanded && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                Logout
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          <div className="text-sm text-gray-600">
            <span className="font-medium">POS System</span> — Admin &nbsp;|&nbsp; Need support? Call: 9075172224
          </div>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in slide-in-from-right">
            {n.msg}
          </div>
        ))}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}