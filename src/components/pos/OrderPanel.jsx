"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Plus, Receipt, Table, Lock, Unlock } from 'lucide-react';
import BillModal from '@/components/pos/BillModal.jsx';
import axios from 'axios';

// Clay Design Tokens
const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    blue: "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_4px_0_#1d4ed8,0_6px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_2px_0_#1d4ed8] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    green: "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_4px_0_#065f46,0_6px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_#065f46] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    orange: "bg-orange-500 text-white font-semibold rounded-2xl shadow-[0_4px_0_#c2410c,0_6px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_2px_0_#c2410c] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    purple: "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_4px_0_#6b21a8,0_6px_12px_rgba(168,85,247,0.3)] hover:shadow-[0_2px_0_#6b21a8] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            This action requires authorization. Please enter the manager password to continue.
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
          
          {/* Number Pad for mobile */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (num === '⌫') {
                    setPassword(prev => prev.slice(0, -1));
                  } else if (num !== '') {
                    if (password.length < 4) {
                      setPassword(prev => prev + num);
                    }
                  }
                }}
                className={`py-3 rounded-xl text-xl font-bold transition-all ${
                  num === '⌫' 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : num === ''
                    ? 'bg-transparent cursor-default'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                }`}
              >
                {num === '⌫' ? '⌫' : num}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-[#a3e635] text-gray-900 rounded-xl font-semibold hover:bg-[#bef264] transition"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPanel({ ctx }) {
  const [panelTab, setPanelTab] = useState('order');
  const [showBill, setShowBill] = useState(null);
  const [localOrder, setLocalOrder] = useState({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [pendingDelta, setPendingDelta] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const lastKotTime = useRef(0);
  const isKotProcessing = useRef(false);
  const kotTimeoutRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Safety check - if ctx is undefined, show loading state
  if (!ctx) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const { selectedTable, getTableOrder, updateTableOrder, addKot, generateBill, mode, setMode, createPickupOrder, createQuickBill, storeId } = ctx;

  // Load order when table changes
  useEffect(() => {
    const loadOrder = async () => {
      if (selectedTable && getTableOrder) {
        const tableId = selectedTable._id || selectedTable.id;
        const currentOrder = await getTableOrder(tableId);
        setLocalOrder(currentOrder || { items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
        // Reset unlock state when table changes
        setIsUnlocked(false);
      } else {
        setLocalOrder({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
        setIsUnlocked(false);
      }
    };
    loadOrder();
    
    // Reset KOT processing state when table changes
    isKotProcessing.current = false;
    if (kotTimeoutRef.current) {
      clearTimeout(kotTimeoutRef.current);
      kotTimeoutRef.current = null;
    }
  }, [selectedTable, getTableOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (kotTimeoutRef.current) {
        clearTimeout(kotTimeoutRef.current);
      }
    };
  }, []);

  // If required functions are missing, show error
  if (!getTableOrder || !updateTableOrder) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={clay.card + " text-center p-6 max-w-sm"}>
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-gray-500 text-sm font-medium">Required functions missing</p>
            <p className="text-gray-400 text-xs mt-2">Please refresh the page</p>
          </div>
        </div>
      </div>
    );
  }

  const total = localOrder.items?.reduce((s, i) => s + (i.price * i.qty || 0), 0) || 0;
  const gst = Math.round(total * 0.05);
  const grandTotal = Math.round(total * 1.05);
  const hasKotPrinted = (localOrder.kotCount || 0) > 0;
  // Order is locked only if KOT has been printed AND not unlocked
  const isOrderLocked = hasKotPrinted && !isUnlocked;

  // Check if action requires password (only when locked)
  const requiresPassword = () => {
    return isOrderLocked;
  };

  const handleUnlock = () => {
    setShowPasswordModal(true);
    setPendingAction('unlock');
  };

  const updateQty = (itemId, delta) => {
    if (requiresPassword()) {
      setPendingAction('updateQty');
      setPendingItemId(itemId);
      setPendingDelta(delta);
      setShowPasswordModal(true);
      return;
    }
    performUpdateQty(itemId, delta);
  };

  const performUpdateQty = (itemId, delta) => {
    if (!selectedTable) return;
    const tableId = selectedTable._id || selectedTable.id;
    updateTableOrder(tableId, (o) => {
      const items = o.items.map(i => 
        (i.id === itemId || i.itemId === itemId) 
          ? { ...i, qty: Math.max(0, i.qty + delta) } 
          : i
      ).filter(i => i.qty > 0);
      return { ...o, items };
    });
  };

  const removeItem = (itemId) => {
    if (requiresPassword()) {
      setPendingAction('removeItem');
      setPendingItemId(itemId);
      setShowPasswordModal(true);
      return;
    }
    performRemoveItem(itemId);
  };

  const performRemoveItem = (itemId) => {
    if (!selectedTable) return;
    const tableId = selectedTable._id || selectedTable.id;
    updateTableOrder(tableId, (o) => ({ 
      ...o, 
      items: o.items.filter(i => i.id !== itemId && i.itemId !== itemId) 
    }));
  };

  const setField = (field, val) => {
    if (!selectedTable) return;
    const tableId = selectedTable._id || selectedTable.id;
    updateTableOrder(tableId, (o) => ({ ...o, [field]: val }));
  };

  const handlePasswordVerified = () => {
    if (pendingAction === 'unlock') {
      setIsUnlocked(true);
    } else if (pendingAction === 'updateQty') {
      performUpdateQty(pendingItemId, pendingDelta);
    } else if (pendingAction === 'removeItem') {
      performRemoveItem(pendingItemId);
    }
    setPendingAction(null);
    setPendingItemId(null);
    setPendingDelta(null);
  };

  const handlePrintKot = useCallback(async () => {
    console.log("PRINT KOT CLICKED");

    if (isKotProcessing.current) {
      console.log("KOT already processing");
      return;
    }

    const now = Date.now();
    if (now - lastKotTime.current < 3000) {
      console.log("Duplicate KOT blocked");
      return;
    }

    if (!selectedTable) {
      console.error("No table selected");
      return;
    }

    if (!addKot) {
      console.error("addKot missing");
      return;
    }

    if (!localOrder?.items || localOrder.items.length === 0) {
      alert("Please add items first");
      return;
    }

    isKotProcessing.current = true;
    lastKotTime.current = now;
    setIsProcessing(true);

    kotTimeoutRef.current = setTimeout(() => {
      console.log("KOT timeout reset");
      isKotProcessing.current = false;
      setIsProcessing(false);
      kotTimeoutRef.current = null;
    }, 5000);

    try {
      const tableId = selectedTable._id || selectedTable.id;
      console.log("Printing KOT for table:", tableId);
      
      addKot(tableId);
      console.log("KOT saved successfully");

      // Update local order to reflect KOT count
      setLocalOrder(prev => ({ ...prev, kotCount: (prev.kotCount || 0) + 1 }));
      // After printing KOT, lock the order again (if it was unlocked)
      setIsUnlocked(false);

      setTimeout(() => {
        isKotProcessing.current = false;
        setIsProcessing(false);
        if (kotTimeoutRef.current) {
          clearTimeout(kotTimeoutRef.current);
          kotTimeoutRef.current = null;
        }
      }, 1000);
    } catch (error) {
      console.error("KOT ERROR:", error);
      alert("Failed to save KOT");
      isKotProcessing.current = false;
      setIsProcessing(false);
      if (kotTimeoutRef.current) {
        clearTimeout(kotTimeoutRef.current);
        kotTimeoutRef.current = null;
      }
    }
  }, [selectedTable, addKot, localOrder]);

  const handleGenerateAndSaveBill = useCallback(async () => {
    if (!selectedTable) {
      alert("No table selected");
      return;
    }
    
    if (localOrder.items?.length === 0) {
      alert("No items to generate bill");
      return;
    }

    setIsProcessing(true);

    try {
      const tableId = selectedTable._id || selectedTable.id;
      
      const billData = {
        storeId: storeId || localStorage.getItem("storeId"),
        tableId: tableId,
        tableName: selectedTable.name,
        customerName: localOrder.customer || "Walk-in Customer",
        phone: localOrder.phone || "",
        address: localOrder.address || "",
        items: localOrder.items.map(item => ({
          id: item.id || item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          total: item.price * item.qty
        })),
        subtotal: total,
        tax: gst,
        total: grandTotal,
        kotCount: localOrder.kotCount || 0,
        kotNote: localOrder.kotNote || "",
        covers: localOrder.covers || "",
        status: "completed",
        paymentStatus: "pending",
        paymentMethod: "cash",
        billNumber: `BILL_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      console.log("Saving bill to database:", billData);

      const response = await axios.post(`${API_URL}/api/bills/create`, billData);

      if (response.data.success) {
        console.log("Bill saved successfully:", response.data.bill);
        
        const bill = {
          id: response.data.bill._id || `bill_${Date.now()}`,
          tableId: tableId,
          tableName: selectedTable.name,
          items: localOrder.items,
          customer: localOrder.customer || "Walk-in Customer",
          phone: localOrder.phone || "",
          subtotal: total,
          tax: gst,
          total: grandTotal,
          kotCount: localOrder.kotCount || 0,
          type: 'BILL',
          timestamp: new Date().toISOString(),
          mode: mode
        };

        setShowBill(bill);
        
        updateTableOrder(tableId, () => ({
          items: [],
          customer: '',
          phone: '',
          address: '',
          kotNote: '',
          covers: '',
          kotCount: 0
        }));
        
        setLocalOrder({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
        setIsUnlocked(false);
        
        if (ctx.addNotification) {
          ctx.addNotification(`Bill generated for ${selectedTable.name}`);
        }
      } else {
        alert(response.data.message || "Failed to save bill");
      }
    } catch (error) {
      console.error("Error generating bill:", error);
      alert(error.response?.data?.message || "Failed to generate bill. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTable, localOrder, total, gst, grandTotal, updateTableOrder, storeId, mode, ctx]);

  const handleGenerateBill = async () => {
    if (!selectedTable || !generateBill) return;
    if (localOrder.items?.length === 0) {
      alert("No items to generate bill");
      return;
    }
    
    setIsProcessing(true);
    try {
      const tableId = selectedTable._id || selectedTable.id;
      const bill = await generateBill(tableId);
      if (bill) setShowBill(bill);
    } catch (error) {
      console.error("Error generating bill:", error);
      alert("Failed to generate bill. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickupOrder = async () => {
    if (!createPickupOrder) return;
    if (localOrder.items?.length === 0) {
      alert("No items to create pickup order");
      return;
    }
    if (!localOrder.customer || !localOrder.phone) {
      alert("Please enter customer name and phone number for pickup order");
      return;
    }
    
    setIsProcessing(true);
    try {
      const order = await createPickupOrder({
        customer: localOrder.customer,
        phone: localOrder.phone,
        address: localOrder.address,
        items: localOrder.items,
        kotNote: localOrder.kotNote,
        total: total
      });
      if (order) {
        alert("Pickup order created successfully!");
        setLocalOrder({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
        if (selectedTable) {
          const tableId = selectedTable._id || selectedTable.id;
          await updateTableOrder(tableId, () => ({
            items: [],
            customer: '',
            phone: '',
            address: '',
            kotNote: '',
            covers: '',
            kotCount: 0
          }));
        }
      }
    } catch (error) {
      console.error("Error creating pickup order:", error);
      alert("Failed to create pickup order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickBill = async () => {
    if (!createQuickBill) return;
    if (localOrder.items?.length === 0) {
      alert("No items to create quick bill");
      return;
    }
    
    setIsProcessing(true);
    try {
      const bill = await createQuickBill({
        customer: localOrder.customer || "Walk-in Customer",
        phone: localOrder.phone || "",
        items: localOrder.items,
        total: total
      });
      if (bill) {
        setShowBill(bill);
        setLocalOrder({ items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 });
        if (selectedTable) {
          const tableId = selectedTable._id || selectedTable.id;
          await updateTableOrder(tableId, () => ({
            items: [],
            customer: '',
            phone: '',
            address: '',
            kotNote: '',
            covers: '',
            kotCount: 0
          }));
        }
      }
    } catch (error) {
      console.error("Error creating quick bill:", error);
      alert("Failed to create quick bill");
    } finally {
      setIsProcessing(false);
    }
  };

  // No table selected message for dine_in mode
  if (mode === 'dine_in' && !selectedTable) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={clay.card + " text-center p-8 max-w-sm w-full"}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_#e5e7eb]">
              <Table size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Table Selected</h3>
            <p className="text-gray-400 text-sm mb-4">Please select a table from the dropdown above to start taking orders</p>
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              <p className="flex items-center gap-2 justify-center">💡 Tip: Click on any table card or use the table selector dropdown</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No table selected for pickup mode - show different message
  if ((mode === 'pickup' || mode === 'quick_bill') && !selectedTable) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={clay.card + " text-center p-8 max-w-sm w-full"}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_#e5e7eb]">
              <Table size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Counter Selected</h3>
            <p className="text-gray-400 text-sm mb-4">Please select a counter to start taking orders</p>
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              <p className="flex items-center gap-2 justify-center">💡 Tip: Select a counter from the dropdown above</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        {/* Mode tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {['dine_in', 'pickup', 'quick_bill'].map(m => (
            <button
              key={m}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                mode === m 
                  ? 'text-[#a3e635] border-b-2 border-[#a3e635] bg-white shadow-[0_2px_0_#6aaa00]' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMode && setMode(m)}
            >
              {m === 'dine_in' ? '🍽️ Dine In' : m === 'pickup' ? '📦 PickUp/Delivery' : '⚡ Quick Bill'}
            </button>
          ))}
        </div>

        {/* Panel tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
              panelTab === 'order' 
                ? 'text-[#a3e635] border-b-2 border-[#a3e635] bg-white shadow-[0_2px_0_#6aaa00]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`} 
            onClick={() => setPanelTab('order')}
          >
            📋 Order/KOT
          </button>
          <button 
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
              panelTab === 'billing' 
                ? 'text-[#a3e635] border-b-2 border-[#a3e635] bg-white shadow-[0_2px_0_#6aaa00]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`} 
            onClick={() => setPanelTab('billing')}
          >
            💰 Billing
          </button>
        </div>

        {/* KOT header - only for dine_in and when table is selected */}
        {mode === 'dine_in' && selectedTable && (
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-[0_2px_0_#e5e7eb]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-bold text-gray-800">{selectedTable.name}</span>
              {selectedTable.location && (
                <span className="text-xs text-gray-400">📍 {selectedTable.location}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-xl text-xs font-bold shadow-[0_1px_0_#86efac]">
                KOT {localOrder.kotCount || 0}
              </span>
              <button 
                onClick={handlePrintKot}
                disabled={isProcessing || isKotProcessing.current || localOrder.items?.length === 0}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_0_#1d4ed8] active:translate-y-[1px]"
              >
                {isProcessing ? '🔄...' : '🖨️ Print KOT'}
              </button>
            </div>
          </div>
        )}

        {/* Warning message if KOT printed and locked */}
        {isOrderLocked && mode === 'dine_in' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={12} />
              <span>⚠️ Order is locked. Make changes?</span>
            </div>
            <button 
              onClick={handleUnlock}
              className="px-2 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition flex items-center gap-1"
            >
              <Unlock size={10} /> Unlock
            </button>
          </div>
        )}

        {/* Success message if unlocked */}
        {isUnlocked && mode === 'dine_in' && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-xs text-green-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock size={12} />
              <span>✅ Order unlocked. You can now modify items.</span>
            </div>
            <span className="text-[10px] text-green-600">Print KOT again to lock</span>
          </div>
        )}

        {/* Order/KOT tab */}
        {panelTab === 'order' && (
          <>
            {/* Column headers */}
            <div className="flex px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
              <span className="flex-1">Item Name</span>
              <span className="w-20 text-center">Qty</span>
              <span className="w-16 text-right">Amount</span>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {localOrder.items?.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-gray-400 text-sm font-medium">No items added yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click on menu items to add to order</p>
                </div>
              )}
              {localOrder.items?.map((item, index) => {
                const uniqueKey = item.uniqueKey || item.uniqueOrderId || item.id || item.itemId || `${item.name}_${index}`;
                const isLocked = isOrderLocked;
                
                return (
                  <div key={uniqueKey} className={`flex items-center px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition group ${isLocked ? 'opacity-80' : ''}`}>
                    <button 
                      className={`w-6 h-6 flex items-center justify-center transition rounded ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                      onClick={() => !isLocked && removeItem(item.id || item.itemId)}
                      disabled={isLocked || isProcessing}
                    >
                      <X size={12} />
                    </button>
                    <span className="flex-1 text-sm font-medium text-gray-800 ml-2">{item.name}</span>
                    <div className="flex items-center gap-2 mx-3">
                      <button 
                        className={`w-6 h-6 flex items-center justify-center rounded-xl transition ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 shadow-[0_1px_0_#d1d5db] active:translate-y-[1px]'}`}
                        onClick={() => !isLocked && updateQty(item.id || item.itemId, -1)}
                        disabled={isLocked || isProcessing}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-bold text-gray-700 min-w-[20px] text-center">{item.qty}</span>
                      <button 
                        className={`w-6 h-6 flex items-center justify-center rounded-xl transition ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 shadow-[0_1px_0_#d1d5db] active:translate-y-[1px]'}`}
                        onClick={() => !isLocked && updateQty(item.id || item.itemId, +1)}
                        disabled={isLocked || isProcessing}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-green-600 min-w-[60px] text-right">₹{item.price * item.qty}</span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="📞 Phone number"
                  value={localOrder.phone || ''}
                  onChange={e => setField('phone', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
                  disabled={isProcessing}
                />
                <input
                  type="text"
                  placeholder="👤 Customer name"
                  value={localOrder.customer || ''}
                  onChange={e => setField('customer', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="📝 KOT Note / Special Instructions"
                  value={localOrder.kotNote || ''}
                  onChange={e => setField('kotNote', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
                  disabled={isProcessing}
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                <span className="text-sm font-semibold text-gray-600">Subtotal:</span>
                <span className="text-lg font-bold text-green-600">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>GST (5%):</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                <span className="text-sm font-bold text-gray-700">Grand Total:</span>
                <span className="text-xl font-bold text-green-600">₹{grandTotal.toFixed(2)}</span>
              </div>
              
              {mode === 'dine_in' && selectedTable && (
                <>
                  <button 
                    className="w-full py-2.5 bg-[#a3e635] text-gray-900 rounded-2xl font-bold hover:bg-[#bef264] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#6aaa00] active:translate-y-[2px]"
                    onClick={handlePrintKot}
                    disabled={isProcessing || isKotProcessing.current || localOrder.items?.length === 0}
                  >
                    {isProcessing ? 'Processing...' : '🖨️ Print KOT'}
                  </button>
                  <button 
                    className="w-full py-2.5 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#1d4ed8] active:translate-y-[2px]"
                    onClick={handleGenerateAndSaveBill}
                    disabled={isProcessing || localOrder.items?.length === 0}
                  >
                    <Receipt size={16} />
                    {isProcessing ? 'Processing...' : '🧾 Generate & Save Bill'}
                  </button>
                </>
              )}
              
              {mode === 'pickup' && (
                <button 
                  className="w-full py-2.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#c2410c] active:translate-y-[2px]"
                  onClick={handlePickupOrder}
                  disabled={isProcessing || localOrder.items?.length === 0}
                >
                  {isProcessing ? 'Processing...' : '📦 Create Pickup Order'}
                </button>
              )}
              
              {mode === 'quick_bill' && (
                <button 
                  className="w-full py-2.5 bg-purple-500 text-white rounded-2xl font-bold hover:bg-purple-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#6b21a8] active:translate-y-[2px]"
                  onClick={handleQuickBill}
                  disabled={isProcessing || localOrder.items?.length === 0}
                >
                  {isProcessing ? 'Processing...' : '⚡ Generate Quick Bill'}
                </button>
              )}
            </div>
          </>
        )}

        {/* Billing tab */}
        {panelTab === 'billing' && (
          <>
            <div className="flex-1 overflow-y-auto">
              {localOrder.items?.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-3">🧾</div>
                  <p className="text-gray-400 text-sm font-medium">No items in order</p>
                  <p className="text-gray-400 text-xs mt-1">Add items to generate bill</p>
                </div>
              )}
              {localOrder.items?.map((item, index) => {
                const uniqueKey = item.uniqueKey || item.uniqueOrderId || item.id || item.itemId || `${item.name}_${index}`;
                return (
                  <div key={uniqueKey} className="flex justify-between px-4 py-3 text-sm border-b border-gray-100">
                    <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.qty}</span></span>
                    <span className="font-bold text-green-600">₹{item.price * item.qty}</span>
                  </div>
                );
              })}
              {localOrder.items?.length > 0 && (
                <div className="bg-gray-50 p-4 mt-2">
                  <div className="flex justify-between px-4 py-2 text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm text-gray-500">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-base font-bold border-t-2 border-gray-200 mt-2 pt-3">
                    <span>Grand Total</span>
                    <span className="text-green-600 text-xl">₹{grandTotal}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t-2 border-gray-100 bg-gray-50 p-4 space-y-3">
              {mode === 'dine_in' && selectedTable && (
                <>
                  <button 
                    className="w-full py-2.5 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#065f46] active:translate-y-[2px]"
                    onClick={handleGenerateBill}
                    disabled={isProcessing || localOrder.items?.length === 0}
                  >
                    {isProcessing ? 'Processing...' : '🧾 Generate Bill'}
                  </button>
                  <button 
                    className="w-full py-2.5 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#1d4ed8] active:translate-y-[2px]"
                    onClick={handleGenerateAndSaveBill}
                    disabled={isProcessing || localOrder.items?.length === 0}
                  >
                    <Receipt size={16} />
                    {isProcessing ? 'Processing...' : '💾 Save & Generate Bill'}
                  </button>
                </>
              )}
              <button 
                className="w-full py-2.5 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#1d4ed8] active:translate-y-[2px]"
                onClick={handlePrintKot}
                disabled={isProcessing || isKotProcessing.current || localOrder.items?.length === 0}
              >
                {isProcessing ? 'Processing...' : '🖨️ Print KOT'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
          setPendingItemId(null);
          setPendingDelta(null);
        }}
        onVerify={handlePasswordVerified}
        title="Manager Authorization Required"
      />

      {showBill && <BillModal bill={showBill} onClose={() => setShowBill(null)} />}
    </>
  );
}