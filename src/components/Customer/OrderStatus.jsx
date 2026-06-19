// OrderStatus.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Clock, Receipt, XCircle, Download,
  CreditCard, Wallet, X, AlertCircle, Eye,
  ChefHat, Loader2, UtensilsCrossed, ArrowRight
} from 'lucide-react';
import axios from 'axios';

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

// Status config
const STATUS_CONFIG = {
  pending:   { label: 'Order Received',    color: 'amber',  icon: Clock,             step: 1 },
  confirmed: { label: 'Order Confirmed',   color: 'blue',   icon: CheckCircle,       step: 2 },
  preparing: { label: 'Being Prepared',    color: 'orange', icon: ChefHat,           step: 3 },
  ready:     { label: 'Ready to Serve',    color: 'green',  icon: UtensilsCrossed,   step: 4 },
  served:    { label: 'Served',            color: 'green',  icon: CheckCircle,       step: 5 },
  completed: { label: 'Completed',         color: 'green',  icon: Receipt,           step: 6 },
  cancelled: { label: 'Cancelled',         color: 'red',    icon: XCircle,           step: 0 },
};

function Spinner({ size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="inline-block"
    >
      <Loader2 size={size} />
    </motion.div>
  );
}

// No Order State
function NoOrderState({ onClose }) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_0_#d1d5db]">
          <UtensilsCrossed size={44} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Order</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">You don't have any active orders right now. Browse the menu and place an order!</p>
        <button onClick={onClose} className={clay.btn.primary + " inline-flex items-center gap-2 px-6 py-3 text-sm"}>
          Browse Menu <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}

// Payment Modal
function PaymentModal({ orderDetails, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!paymentMethod) { alert('Please select a payment method'); return; }
    setProcessing(true);
    try {
      const paymentRes = await axios.put(`${API_URL}/api/customer-order/payment-status/${orderDetails._id}`, {
        paymentStatus: 'paid',
        paymentMethod: paymentMethod
      });
      if (paymentRes.data.success) {
        const completeRes = await axios.post(`${API_URL}/api/customer-order/complete-by-order/${orderDetails._id}`);
        if (completeRes.data.success) onSuccess(paymentMethod, completeRes.data.order);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={clay.modal + " w-full max-w-md overflow-hidden"}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex justify-between items-start">
          <div><h2 className="text-xl font-bold text-gray-900">Complete Payment</h2><p className="text-sm text-gray-400 mt-0.5">Select how you'd like to pay</p></div>
          <button onClick={onClose} className={clay.btn.ghost + " w-8 h-8 flex items-center justify-center text-lg"}>×</button>
        </div>

        <div className="mx-6 mb-4 bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{orderDetails?.subtotal}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>GST (5%)</span><span>₹{orderDetails?.tax}</span></div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-dashed border-gray-200">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-600">₹{orderDetails?.total}</span>
          </div>
        </div>

        <div className="px-6 space-y-3 mb-5">
          {[
            { id: 'online',  icon: CreditCard, label: 'Pay Online',      sub: 'UPI · Card · Net Banking' },
            { id: 'counter', icon: Wallet,     label: 'Pay at Counter',  sub: 'Cash · Card at counter' },
          ].map(({ id, icon: Icon, label, sub }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === id ? 'border-[#a3e635] bg-[#f9fff0] shadow-[0_4px_0_#6aaa00]' : 'border-gray-200 hover:border-gray-300 bg-white shadow-[0_2px_0_#e5e7eb]'
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_0_#d1d5db]"><Icon size={22} className="text-gray-600" /></div>
              <div className="text-left flex-1"><p className="font-bold text-gray-800 text-sm">{label}</p><p className="text-xs text-gray-400 mt-0.5">{sub}</p></div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === id ? 'border-[#a3e635] bg-[#a3e635]' : 'border-gray-300'}`}>
                {paymentMethod === id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3.5 text-sm"}>Back</button>
          <button onClick={handlePay} disabled={!paymentMethod || processing} className={clay.btn.primary + " flex-1 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"}>
            {processing ? <><Spinner size={16} /> Processing…</> : `Pay ₹${orderDetails?.total}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Order Details Modal
function OrderDetailsModal({ order, onClose, onPay }) {
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
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={clay.modal + " w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b-2 border-gray-100">
          <div><h2 className="text-lg font-bold text-gray-900">Order Details</h2><p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p></div>
          <button onClick={onClose} className={clay.btn.ghost + " w-8 h-8 flex items-center justify-center text-lg"}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {[
            ['Date', new Date(order.createdAt).toLocaleString()],
            ['Customer', order.customer],
            ['OTP Code', order.otpCode],
            ['Phone', order.phone],
            ['Table', order.tableName || order.name || 'N/A'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm"><span className="text-gray-400">{k}</span><span className="font-bold text-gray-800 text-right">{v}</span></div>
          ))}

          <div className="border-t-2 border-dashed border-gray-200 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-2.5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm"><span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.qty}</span></span><span className="font-bold text-gray-900">₹{item.price * item.qty}</span></div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 shadow-[0_2px_0_#e5e7eb] space-y-2">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>GST (5%)</span><span>₹{order.tax}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t-2 border-gray-200"><span>Total</span><span className="text-green-600">₹{order.total}</span></div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <button onClick={() => { onClose(); onPay(order); }} className={clay.btn.green + " w-full py-3.5 text-sm font-bold"}>
            Complete Payment · ₹{order.total}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Pending Orders Screen
function PendingOrdersScreen({ pendingOrders, onPay, onSkip }) {
  const [viewingOrder, setViewingOrder] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);

  const handlePaySuccess = (method, completedOrder) => {
    setPayingOrder(null);
    onSkip(completedOrder);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f0] p-6">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#fde68a]">
            <AlertCircle size={38} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Pending Payments</h2>
          <p className="text-sm text-gray-400 mt-1">{pendingOrders.length === 1 ? 'You have 1 order awaiting payment' : `You have ${pendingOrders.length} orders awaiting payment`}</p>
        </motion.div>

        <div className="space-y-3 mb-6">
          {pendingOrders.map((o, i) => (
            <motion.div key={o._id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} className={clay.card + " p-4"}>
              <div className="flex justify-between items-center mb-3"><span className="text-xs font-mono text-gray-400">{o.orderNumber}</span><span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-2xl font-bold shadow-[0_1px_0_#fde68a]">Pending</span></div>
              <div className="mb-3 p-2 bg-amber-50 rounded-xl border border-amber-100 shadow-[0_1px_0_#fde68a]">
                <p className="text-[10px] text-amber-700 mb-1 font-bold">Order OTP</p>
                <p className="text-xl font-mono font-bold text-amber-800 tracking-wider">{o.otpCode}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div><p className="font-bold text-gray-800">{o.customer}</p><p className="text-xs text-gray-400 mt-0.5">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''} · Table {o.tableName || o.name || 'N/A'}</p></div>
                <p className="text-xl font-bold text-green-600">₹{o.total}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewingOrder(o)} className={clay.btn.secondary + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"}><Eye size={14} /> View</button>
                <button onClick={() => setPayingOrder(o)} className={clay.btn.green + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"}><CreditCard size={14} /> Pay Now</button>
              </div>
            </motion.div>
          ))}
        </div>

        <button onClick={() => onSkip(null)} className={clay.btn.secondary + " w-full py-3.5 text-sm"}>Skip & Order New Food</button>
      </div>

      <AnimatePresence>
        {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} onPay={(o) => { setViewingOrder(null); setPayingOrder(o); }} />}
        {payingOrder && <PaymentModal orderDetails={payingOrder} onClose={() => setPayingOrder(null)} onSuccess={handlePaySuccess} />}
      </AnimatePresence>
    </>
  );
}

// Completed Screen
function CompletedScreen({ orderDetails, onClose, onDownload }) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-8">
      <div className="bg-white px-5 pt-10 pb-5 text-center border-b-2 border-gray-100 shadow-[0_4px_0_#e5e7eb]">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_#86efac]">
          <CheckCircle size={32} className="text-green-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Payment successful</h2>
        <p className="text-xs text-gray-400 font-mono mb-3">#{orderDetails?.orderNumber?.slice(-8)}</p>
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-2xl shadow-[0_2px_0_#86efac]"><CheckCircle size={10} /> Paid</span>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-[0_8px_0_#e5e7eb] border border-white/80 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</p>
        <div className="px-4 pb-3 space-y-2.5 border-t-2 border-gray-50">
          {[['Name', orderDetails?.customer], ['Phone', orderDetails?.phone], ['Table', orderDetails?.tableName || orderDetails?.name || 'N/A'], ['Date', new Date(orderDetails?.createdAt).toLocaleString()]].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center"><span className="text-sm text-gray-500">{k}</span><span className="text-sm font-bold text-gray-900">{v}</span></div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-[0_8px_0_#e5e7eb] border border-white/80 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Items ordered</p>
        <div className="px-4 border-t-2 border-gray-50 divide-y-2 divide-gray-50">
          {orderDetails?.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2.5"><div><p className="text-sm font-bold text-gray-800">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.price}</p></div><span className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</span></div>
          ))}
        </div>
        <div className="mx-4 border-t-2 border-dashed border-gray-200 py-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{orderDetails?.subtotal}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>GST (5%)</span><span>₹{orderDetails?.tax}</span></div>
          <div className="flex justify-between items-center pt-1 border-t-2 border-gray-100"><span className="text-sm font-bold text-gray-800">Total paid</span><span className="text-lg font-bold text-green-700">₹{orderDetails?.total}</span></div>
        </div>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-[0_8px_0_#e5e7eb] border border-white/80 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</p>
        <div className="px-4 pb-3 border-t-2 border-gray-50 space-y-2.5">
          {orderDetails?.paymentMethod && <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Method</span><span className="text-sm font-bold text-gray-800 capitalize">{orderDetails.paymentMethod}</span></div>}
          <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Status</span><span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-2xl shadow-[0_1px_0_#86efac]"><CheckCircle size={10} /> Paid</span></div>
        </div>
      </div>

      <div className="mx-4 mt-4 space-y-2.5">
        <button onClick={onDownload} className={clay.btn.secondary + " w-full py-3.5 text-sm flex items-center justify-center gap-2"}><Download size={14} /> Download receipt</button>
        <button onClick={onClose} className={clay.btn.green + " w-full py-3.5 text-sm"}>Order more food</button>
      </div>
    </div>
  );
}

// Active Order Screen
function ActiveOrderScreen({ orderDetails, currentStatus, canCancel, timeLeft, onCancel, onDineOut, onClose, onDownload }) {
  const cfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.pending;
  const isCancellable = (currentStatus === 'pending' || currentStatus === 'confirmed') && canCancel;

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-5 pb-8">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6 pt-4">
        <motion.div animate={currentStatus === 'preparing' ? { rotate: [0, -10, 10, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }} className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_0_#86efac]">
          <cfg.icon size={38} className="text-green-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900">Order Placed!</h2>
        <p className="text-sm text-gray-400 font-mono mt-0.5">#{orderDetails?.orderNumber?.slice(-8)}</p>
       
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-2xl shadow-[0_2px_0_#e5e7eb]">
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-bold text-gray-700">{cfg.label}</span>
        </div>
        {isCancellable && timeLeft !== null && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-2xl"><Clock size={10} className="text-amber-500" /><span className="text-xs text-amber-700">Cancel in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></div>
        )}
      </motion.div>

      <div className={clay.card + " p-4 mb-4"}>
        {[['Customer', orderDetails?.customer], ['Phone', orderDetails?.phone], ['Table', orderDetails?.tableName || orderDetails?.name || 'N/A'], ['Items', `${orderDetails?.items?.length} item${orderDetails?.items?.length !== 1 ? 's' : ''}`]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm mb-2"><span className="text-gray-400">{k}</span><span className="font-bold text-gray-800">{v}</span></div>
        ))}
      </div>

      <div className={clay.card + " p-4 mb-5"}>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h3>
        <div className="space-y-2 mb-3">
          {orderDetails?.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.qty}</span></span><span className="font-bold text-gray-800">₹{item.price * item.qty}</span></div>
          ))}
        </div>
        <div className="border-t-2 border-dashed border-gray-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>₹{orderDetails?.subtotal}</span></div>
          <div className="flex justify-between text-sm text-gray-400"><span>GST (5%)</span><span>₹{orderDetails?.tax}</span></div>
          <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="text-green-600">₹{orderDetails?.total}</span></div>
        </div>
      </div>

      <div className="space-y-2.5">
        <button onClick={onDineOut} className={clay.btn.green + " w-full py-3.5 text-sm flex items-center justify-center gap-2"}><CreditCard size={16} /> Dine Out & Pay</button>
        <button onClick={onClose} className={clay.btn.secondary + " w-full py-3.5 text-sm"}>+ Order More</button>
        <button onClick={onDownload} className={clay.btn.ghost + " w-full py-3 text-sm flex items-center justify-center gap-2"}><Download size={14} /> Download Receipt</button>
        {isCancellable && <button onClick={onCancel} className="w-full py-3 text-red-500 rounded-2xl font-bold hover:bg-red-50 active:scale-95 transition text-sm flex items-center justify-center gap-2"><XCircle size={14} /> Cancel Order</button>}
      </div>
    </div>
  );
}

// Cancelled Screen
function CancelledScreen({ orderDetails, onClose }) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8 pt-8">
        <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#fca5a5]">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Cancelled</h2>
        <p className="text-sm text-gray-400 mt-1 font-mono">{orderDetails?.orderNumber}</p>
      </motion.div>
      <div className={clay.card + " p-5 mb-6 text-center"}>
        <p className="text-gray-500 text-sm">Your order has been cancelled. No charges have been made.</p>
      </div>
      <button onClick={onClose} className={clay.btn.green + " w-full py-3.5 text-sm font-bold"}>Start a New Order</button>
    </div>
  );
}

// Main Component
export default function OrderStatus({ order, onClose, onCancel, onDineOut }) {
  const [currentStatus, setCurrentStatus] = useState(order?.status || null);
  const [orderDetails, setOrderDetails] = useState(order || null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [canCancel, setCanCancel] = useState(true);
  const [loading, setLoading] = useState(!order);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [view, setView] = useState('loading');

  const handleDownloadReceipt = useCallback(() => {
    if (!orderDetails) return;
    const html = `<!DOCTYPE html><html><head><title>Receipt</title>
    <style>body{font-family:'Courier New',monospace;padding:20px;max-width:400px;margin:0 auto}
    .h{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:10px;margin-bottom:10px}
    table{width:100%;border-collapse:collapse;margin-bottom:15px}
    th,td{text-align:left;padding:5px 0;border-bottom:1px dotted #eee}
    th{border-bottom:1px solid #333}
    .t{border-top:1px dashed #ccc;padding-top:10px;text-align:right}
    .f{text-align:center;margin-top:20px;padding-top:10px;border-top:1px dashed #ccc;font-size:10px;color:#666}
    </style></head><body>
    <div class="h"><div style="font-size:18px;font-weight:bold">${orderDetails.restaurantName || 'DineEat'}</div><div>TAX INVOICE</div></div>
    <p><b>Order #:</b> ${orderDetails.orderNumber}</p>
    <p><b>Date:</b> ${new Date(orderDetails.createdAt).toLocaleString()}</p>
    <p><b>Customer:</b> ${orderDetails.customer}</p>
    <p><b>Phone:</b> ${orderDetails.phone}</p>
    <p><b>Table:</b> ${orderDetails.tableName || orderDetails.name || 'N/A'}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${orderDetails.items?.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`).join('')}</tbody></table>
    <div class="t"><p><b>Subtotal:</b> ₹${orderDetails.subtotal}</p><p><b>GST (5%):</b> ₹${orderDetails.tax}</p>
    <p style="font-size:16px"><b>Total: ₹${orderDetails.total}</b></p></div>
    <div class="f"><p>Thank you for dining with us!</p><p>Visit Again!</p></div>
    </body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `receipt_${orderDetails.orderNumber}.html`;
    a.click();
  }, [orderDetails]);

  useEffect(() => {
    if (!orderDetails?.createdAt) return;
    const elapsed = (Date.now() - new Date(orderDetails.createdAt).getTime()) / 60000;
    if (elapsed >= 5) { setCanCancel(false); return; }
    setCanCancel(true);
    let t = Math.floor((5 - elapsed) * 60);
    setTimeLeft(t);
    const id = setInterval(() => { t -= 1; setTimeLeft(t); if (t <= 0) { clearInterval(id); setCanCancel(false); } }, 1000);
    return () => clearInterval(id);
  }, [orderDetails?.createdAt]);

  useEffect(() => {
    if (order) { setOrderDetails(order); setCurrentStatus(order.status); setView('order'); setLoading(false); return; }
    const boot = async () => {
      const phone = localStorage.getItem('customerPhone');
      if (!phone) { setView('empty'); setLoading(false); return; }
      try {
        const activeRes = await axios.get(`${API_URL}/api/customer-order/current/${phone}`);
        if (activeRes.data.success && activeRes.data.hasOrder) { setOrderDetails(activeRes.data.order); setCurrentStatus(activeRes.data.order.status); setView('order'); setLoading(false); return; }
      } catch { /* continue */ }
      try {
        const pendingRes = await axios.get(`${API_URL}/api/customer-order/pending-payment/${phone}`);
        if (pendingRes.data.success && pendingRes.data.hasPendingPayment && pendingRes.data.orders?.length > 0) { setPendingOrders(pendingRes.data.orders); setView('pending'); setLoading(false); return; }
      } catch { /* continue */ }
      setView('empty'); setLoading(false);
    };
    boot();
  }, [order]);

  const handleCancelOrder = async () => {
    if (!canCancel) return;
    if (!confirm('Cancel this order?')) return;
    try {
      const res = await axios.put(`${API_URL}/api/customer-order/cancel/${orderDetails._id}`);
      if (res.data.success) { setCurrentStatus('cancelled'); if (onCancel) onCancel(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to cancel order.'); }
  };

  const handlePaymentSuccess = (method, completedOrder) => {
    setOrderDetails(completedOrder);
    setCurrentStatus('completed');
    setShowPayment(false);
    setPendingOrders(prev => prev.filter(o => o._id !== completedOrder._id));
    alert(`Payment successful via ${method === 'online' ? 'Online Payment' : 'Counter Payment'}!`);
    if (onDineOut) onDineOut();
  };

  if (loading || view === 'loading') return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f5f0]"><Spinner size={32} /><p className="text-sm text-gray-400">Fetching your order…</p></div>;
  if (view === 'empty') return <NoOrderState onClose={onClose} />;
  if (view === 'pending') return <PendingOrdersScreen pendingOrders={pendingOrders} onPay={(o, completedOrder) => { if (completedOrder) { setOrderDetails(completedOrder); setCurrentStatus('completed'); setView('order'); } else { setOrderDetails(o); setCurrentStatus(o.status); setShowPayment(true); } }} onSkip={(completedOrder) => { if (completedOrder) { setOrderDetails(completedOrder); setCurrentStatus('completed'); setView('order'); } else { setView('empty'); } }} />;
  if (currentStatus === 'cancelled') return <CancelledScreen orderDetails={orderDetails} onClose={onClose} />;
  if (currentStatus === 'completed') return <CompletedScreen orderDetails={orderDetails} onClose={onClose} onDownload={handleDownloadReceipt} />;

  return (
    <>
      <ActiveOrderScreen orderDetails={orderDetails} currentStatus={currentStatus} canCancel={canCancel} timeLeft={timeLeft} onCancel={handleCancelOrder} onDineOut={() => setShowPayment(true)} onClose={onClose} onDownload={handleDownloadReceipt} />
      <AnimatePresence>{showPayment && <PaymentModal orderDetails={orderDetails} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />}</AnimatePresence>
    </>
  );
}