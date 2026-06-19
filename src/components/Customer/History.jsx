"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Download, RefreshCw, Search, Calendar, 
  Filter, Clock, CheckCircle, XCircle, 
  ShoppingBag, Users, Receipt, CreditCard,
  X, Trash2, AlertCircle, Phone, User, LogIn
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginModal from '@/components/Customer/GoogleLoginModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Clay Design Tokens
const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    danger: "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green: "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue: "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    purple: "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6b21a8,0_8px_16px_rgba(168,85,247,0.35)] hover:shadow-[0_3px_0_#6b21a8,0_4px_8px_rgba(168,85,247,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost: "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  input: "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// ChefHat Icon component
function ChefHat({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.5V9.5a3.5 3.5 0 0 1 7 0v4" />
      <path d="M10 13.5v-2a1 1 0 0 1 2 0v2" />
      <path d="M18 13.5V9.5a3.5 3.5 0 0 0-7 0" />
      <path d="M12 21a7 7 0 0 0 7-7v-2a5 5 0 0 0-10 0v2a7 7 0 0 0 3 5.57z" />
    </svg>
  );
}

// Phone Number Modal
function PhoneNumberModal({ isOpen, onClose, onSubmit, loading }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    onSubmit(phoneNumber);
  };

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
            className={clay.modal + " max-w-md w-full"}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Enter Phone Number</h2>
              <p className="text-sm text-gray-400 mt-0.5">Please enter your phone number to view order history</p>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={clay.input + " pl-10"}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading || !phoneNumber || phoneNumber.length < 10}
                className={clay.btn.primary + " flex-1 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"}
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div> : 'View Orders'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Order Card Component
function OrderCard({ order, onViewDetails, onDownloadReceipt, onContinueOrder, onDineOut, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]',
      pending: 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]',
      confirmed: 'bg-blue-100 text-blue-700 shadow-[0_2px_0_#93c5fd]',
      preparing: 'bg-purple-100 text-purple-700 shadow-[0_2px_0_#d8b4fe]',
      ready: 'bg-green-100 text-green-700 shadow-[0_2px_0_#86efac]',
      served: 'bg-indigo-100 text-indigo-700 shadow-[0_2px_0_#c7d2fe]',
      cancelled: 'bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 shadow-[0_2px_0_#d1d5db]';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return <ShoppingBag size={12} />;
    }
  };

  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_6px_0_#e5e7eb,0_8px_16px_rgba(0,0,0,0.06)] border border-white/80 overflow-hidden mb-4"
    >
      <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[10px] font-bold ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </span>
              {order.paymentStatus === 'paid' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[10px] font-bold bg-green-100 text-green-700 shadow-[0_2px_0_#86efac]">
                  <CreditCard size={10} /> Paid
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-green-600">₹{order.total}</p>
            <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
          <div className="flex items-center gap-1"><Calendar size={11} /><span>{orderDate}</span></div>
          <div className="flex items-center gap-1"><Clock size={11} /><span>{orderTime}</span></div>
          <div className="flex items-center gap-1"><Users size={11} /><span>{order.tableName || order.tableId || 'N/A'}</span></div>
        </div>
      </div>

      <div className="p-4 bg-white">
        <div className="space-y-2">
          {order.items?.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.qty}</span></span>
              <span className="font-medium text-gray-800">₹{item.price * item.qty}</span>
            </div>
          ))}
          {order.items?.length > 2 && <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>}
        </div>
      </div>

      <div className="p-4 border-t-2 border-gray-100 bg-gray-50 flex flex-wrap gap-2">
        <button onClick={() => onViewDetails(order)} className="flex-1 min-w-[70px] py-2 bg-white text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-1.5 border-2 border-gray-200 shadow-[0_2px_0_#d1d5db] active:translate-y-[1px]">
          <Eye size={13} /> View
        </button>
        <button onClick={() => onDownloadReceipt(order)} className="flex-1 min-w-[70px] py-2 bg-white text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-1.5 border-2 border-gray-200 shadow-[0_2px_0_#d1d5db] active:translate-y-[1px]">
          <Download size={13} /> Receipt
        </button>
        {isActive ? (
          <>
            <button onClick={() => onContinueOrder(order)} className={clay.btn.green + " flex-1 min-w-[70px] py-2 text-xs flex items-center justify-center gap-1.5"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              Continue
            </button>
            <button onClick={() => onDineOut(order)} className={clay.btn.purple + " flex-1 min-w-[70px] py-2 text-xs flex items-center justify-center gap-1.5"}>
              <Receipt size={13} /> Dine Out
            </button>
          </>
        ) : (
          <button onClick={() => onDelete(order)} className={clay.btn.danger + " flex-1 min-w-[70px] py-2 text-xs flex items-center justify-center gap-1.5"}>
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Order Details Modal
function OrderDetailsModal({ order, onClose, onContinueOrder, onDineOut, onDownloadReceipt }) {
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status);

  return (
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
        className={clay.modal + " w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className={clay.btn.ghost + " w-8 h-8 flex items-center justify-center text-lg"}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Date & Time</p>
              <p className="text-sm font-bold text-gray-800">{orderDate}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 shadow-[0_2px_0_#e5e7eb]">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Status</p>
              <p className="text-sm font-bold capitalize text-green-600">{order.status}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Customer Details</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-500">Name</span><span className="text-sm font-bold text-gray-800">{order.customer}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Phone</span><span className="text-sm font-bold text-gray-800">{order.phone}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Table</span><span className="text-sm font-bold text-gray-800">{order.tableName || order.tableId || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div><p className="text-sm font-bold text-gray-800">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.price}</p></div>
                  <p className="text-sm font-bold text-gray-800">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bill Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{order.subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">GST (5%)</span><span className="font-bold">₹{order.tax}</span></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-dashed border-gray-200"><span>Total</span><span className="text-green-600">₹{order.total}</span></div>
            </div>
          </div>

          {order.paymentStatus === 'paid' && (
            <div className="bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Information</p>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Status</span><span className="text-sm font-bold text-green-600">Paid</span></div>
              {order.paymentMethod && <div className="flex justify-between mt-2"><span className="text-sm text-gray-500">Method</span><span className="text-sm font-bold text-gray-800 capitalize">{order.paymentMethod}</span></div>}
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-gray-100 flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md">
          <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Close</button>
          <button onClick={() => onDownloadReceipt(order)} className={clay.btn.blue + " flex-1 py-3 text-sm flex items-center justify-center gap-2"}>📄 Receipt</button>
          {isActive && (
            <>
              <button onClick={() => onContinueOrder(order)} className={clay.btn.green + " flex-1 py-3 text-sm"}>Order More</button>
              <button onClick={() => onDineOut(order)} className={clay.btn.purple + " flex-1 py-3 text-sm"}>Dine Out</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Filter Modal
function FilterModal({ isOpen, onClose, filterType, setFilterType }) {
  const filterOptions = [
    { id: 'all', label: 'All Orders' },
    { id: 'active', label: 'Active Orders' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={clay.modal + " w-full max-w-md overflow-hidden"}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Filter Orders</h2>
              <button onClick={onClose} className={clay.btn.ghost + " w-8 h-8 flex items-center justify-center text-lg"}>×</button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Status</p>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => { setFilterType(option.id); onClose(); }}
                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      filterType === option.id
                        ? "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]"
                        : "bg-gray-100 text-gray-600 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mb-4"></div>
      <p className="text-gray-500 font-medium">Loading your orders...</p>
    </div>
  );
}

// Empty State
function EmptyState({ onRefresh, message }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#d1d5db]">
        <ShoppingBag size={36} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">No Orders Found</h3>
      <p className="text-gray-400 text-sm mb-6">{message || "You haven't placed any orders yet."}</p>
      <button onClick={onRefresh} className={clay.btn.primary + " px-5 py-2.5 text-sm inline-flex items-center gap-2"}>
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
}

// Main History Component
export default function History({ onContinueOrder, onDineOut }) {
  const { user, signInWithGoogle } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [currentPhone, setCurrentPhone] = useState(null);

  const getPhoneNumber = () => {
    const storedPhone = localStorage.getItem('customerPhone');
    if (storedPhone) return storedPhone;
    if (user?.phone) return user.phone;
    return null;
  };

  const fetchOrders = async (phone) => {
    if (!phone) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/customer-order/history/${phone}`);
      if (response.data.success) setOrders(response.data.orders);
      else setError('Failed to load orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.status === 404 ? 'No orders found for this phone number' : 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const phone = getPhoneNumber();
    if (phone) { setCurrentPhone(phone); fetchOrders(phone); }
    else if (user) setShowPhoneModal(true);
    else setLoading(false);
  }, [user]);

  const handlePhoneSubmit = (phone) => {
    setPhoneLoading(true);
    localStorage.setItem('customerPhone', phone);
    setCurrentPhone(phone);
    fetchOrders(phone);
    setShowPhoneModal(false);
    setPhoneLoading(false);
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      setShowLoginModal(false);
      if (!getPhoneNumber()) setShowPhoneModal(true);
      else fetchOrders(getPhoneNumber());
    }
  };

  const handleRefresh = () => { const phone = getPhoneNumber(); if (phone) fetchOrders(phone); };

  useEffect(() => {
    let filtered = [...orders];
    if (filterType !== 'all') {
      if (filterType === 'active') filtered = filtered.filter(order => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status));
      else filtered = filtered.filter(order => order.status === filterType);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => order.orderNumber?.toLowerCase().includes(term) || order.customer?.toLowerCase().includes(term) || order.phone?.includes(term));
    }
    setFilteredOrders(filtered);
  }, [orders, filterType, searchTerm]);

  const handleDownloadReceipt = (order) => {
    const html = `<!DOCTYPE html><html><head><title>Receipt</title>
    <style>body{font-family:'Courier New',monospace;padding:20px;max-width:400px;margin:0 auto}
    .h{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:10px;margin-bottom:10px}
    table{width:100%;border-collapse:collapse;margin-bottom:15px}
    th,td{text-align:left;padding:5px 0;border-bottom:1px dotted #eee}
    th{border-bottom:1px solid #333}
    .t{border-top:1px dashed #ccc;padding-top:10px;text-align:right}
    .f{text-align:center;margin-top:20px;padding-top:10px;border-top:1px dashed #ccc;font-size:10px;color:#666}
    </style></head><body>
    <div class="h"><div style="font-size:18px;font-weight:bold">DineEat</div><div>TAX INVOICE</div></div>
    <p><b>Order #:</b> ${order.orderNumber}</p>
    <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><b>Customer:</b> ${order.customer}</p>
    <p><b>Phone:</b> ${order.phone}</p>
    <p><b>Table:</b> ${order.tableName || order.tableId || 'N/A'}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${order.items?.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`).join('')}</tbody></table>
    <div class="t"><p><b>Subtotal:</b> ₹${order.subtotal}</p><p><b>GST (5%):</b> ₹${order.tax}</p>
    <p style="font-size:16px"><b>Total: ₹${order.total}</b></p></div>
    <div class="f"><p>Thank you for dining with us!</p><p>Visit Again!</p></div>
    </body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `receipt_${order.orderNumber}.html`;
    a.click();
  };

  const handleContinueOrder = async (order) => {
    try {
      const response = await axios.post(`${API_URL}/api/customer-order/continue/${order._id}`);
      if (response.data.success && onContinueOrder) onContinueOrder(response.data.order);
    } catch (error) { console.error('Error continuing order:', error); alert('Failed to continue order. Please try again.'); }
  };

  const handleDineOut = async (order) => {
    try {
      const response = await axios.get(`${API_URL}/api/customer-order/dineout/${order._id}`);
      if (response.data.success && onDineOut) onDineOut(response.data.order);
    } catch (error) { console.error('Error dining out:', error); alert('Failed to process dine out. Please try again.'); }
  };

  const handleDeleteOrder = async (order) => {
    if (!confirm('Are you sure you want to delete this order from history?')) return;
    try {
      const response = await axios.delete(`${API_URL}/api/customer-order/history/${order._id}`);
      if (response.data.success) setOrders(prev => prev.filter(o => o._id !== order._id));
    } catch (error) { console.error('Error deleting order:', error); alert('Failed to delete order. Please try again.'); }
  };

  const resetFilters = () => { setSearchTerm(''); setFilterType('all'); };

  if (!user && !currentPhone && !loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#d1d5db]">
            <LogIn size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-400 text-sm mb-6">Please login to view your order history</p>
          <button onClick={() => setShowLoginModal(true)} className={clay.btn.primary + " px-5 py-2.5 text-sm inline-flex items-center gap-2"}>
            <User size={14} /> Login with Google
          </button>
        </div>
        <GoogleLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleGoogleLogin} loading={false} />
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#fca5a5]">
            <AlertCircle size={36} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={handleRefresh} className={clay.btn.primary + " px-5 py-2.5 text-sm inline-flex items-center gap-2"}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f0] pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 px-4 py-4 shadow-[0_4px_0_#e5e7eb]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Order History</h1>
            <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-[#a3e635] transition" title="Refresh">
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={clay.input + " pl-10"}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          
          <button onClick={() => setShowFilterModal(true)} className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl text-sm font-bold text-gray-600 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] transition-all">
            <Filter size={14} /> Filter
            {filterType !== 'all' && <span className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_1px_0_#6aaa00]"></span>}
          </button>
        </div>

        {/* Orders List */}
        <div className="px-4 py-4">
          {filteredOrders.length === 0 ? (
            <EmptyState onRefresh={resetFilters} message={searchTerm || filterType !== 'all' ? "No orders match your search or filter criteria." : "You haven't placed any orders yet."} />
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={setSelectedOrder}
                onDownloadReceipt={handleDownloadReceipt}
                onContinueOrder={handleContinueOrder}
                onDineOut={handleDineOut}
                onDelete={handleDeleteOrder}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onContinueOrder={handleContinueOrder}
            onDineOut={handleDineOut}
            onDownloadReceipt={handleDownloadReceipt}
          />
        )}
      </AnimatePresence>

      <FilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} filterType={filterType} setFilterType={setFilterType} />
      <PhoneNumberModal isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)} onSubmit={handlePhoneSubmit} loading={phoneLoading} />
      <GoogleLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleGoogleLogin} loading={false} />
    </>
  );
}