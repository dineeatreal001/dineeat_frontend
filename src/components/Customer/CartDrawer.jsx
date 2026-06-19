// CartDrawer.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCustomerCart } from '@/context/CustomerCartContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const clay = {
  drawer: "bg-white rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)]",
  input: "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    danger: "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
};

export default function CartDrawer({ isOpen, onClose, tableNumber, hotelName, storeId, tableInfo, onOrderPlaced, existingOrder }) {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCustomerCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', note: '' });
  const [isAddingToExistingOrder, setIsAddingToExistingOrder] = useState(false);
  const [currentTableId, setCurrentTableId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const storedTableId = localStorage.getItem('current_table_id');
    if (storedTableId) setCurrentTableId(storedTableId);
  }, []);

  useEffect(() => {
    if (user && user.name) setCustomerDetails(prev => ({ ...prev, name: user.name || '' }));
    if (existingOrder && existingOrder.customer) setCustomerDetails(prev => ({ ...prev, name: existingOrder.customer, phone: existingOrder.phone }));
    const savedPhone = localStorage.getItem('customerPhone');
    if (savedPhone && !customerDetails.phone) setCustomerDetails(prev => ({ ...prev, phone: savedPhone }));
  }, [user, existingOrder]);

  const tax = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + tax;
  const hasActiveOrder = existingOrder && existingOrder.status !== 'completed' && existingOrder.status !== 'cancelled';

  const handlePlaceOrder = async () => {
    if (!customerDetails.name || !customerDetails.phone) { alert('Please enter your name and phone number'); return; }
    if (cart.length === 0) { alert('Your cart is empty'); return; }
    
    setLoading(true);
    try {
      const finalTableId = tableInfo?.id || currentTableId;
      const response = await axios.post(`${API_URL}/api/customer-order/create`, {
        storeId, tableId: finalTableId, customer: customerDetails.name, phone: customerDetails.phone,
        address: `Table ${tableNumber} at ${hotelName}`, items: cart.map(item => ({ itemId: item.id, name: item.name, price: item.price, qty: item.qty })),
        kotNote: customerDetails.note, orderType: 'dine_in',
      });
      if (response.data.success) {
        localStorage.setItem('customerPhone', customerDetails.phone);
        clearCart();
        onOrderPlaced({ ...response.data.order, otpCode: response.data.otpCode, customer: customerDetails.name, phone: customerDetails.phone, tableNumber, total: grandTotal, items: cart });
        onClose();
      }
    } catch (error) { alert(error.response?.data?.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  const handleAddToExistingOrder = async () => {
    if (cart.length === 0) { alert('Your cart is empty'); return; }
    setLoading(true);
    setIsAddingToExistingOrder(true);
    try {
      const response = await axios.put(`${API_URL}/api/customer-order/add-items/${existingOrder._id}`, {
        items: cart.map(item => ({ itemId: item.id, name: item.name, price: item.price, qty: item.qty })),
        kotNote: customerDetails.note
      });
      if (response.data.success) {
        clearCart();
        onOrderPlaced({ ...response.data.order, otpCode: existingOrder.otpCode, customer: customerDetails.name, phone: customerDetails.phone, tableNumber, total: response.data.order.total });
        onClose();
        alert('Items added to your existing order!');
      }
    } catch (error) { alert(error.response?.data?.message || 'Failed to add items'); }
    finally { setLoading(false); setIsAddingToExistingOrder(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md">
            <div className={clay.drawer + " flex flex-col h-full overflow-hidden"}>
              <div className="flex items-center justify-between p-5 border-b-2 border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{hasActiveOrder ? 'Add to Existing Order' : 'Your Cart'}</h2>
                <button onClick={onClose} className="bg-gray-100 text-gray-600 rounded-2xl w-8 h-8 flex items-center justify-center shadow-[0_3px_0_#d1d5db] active:translate-y-[1px] transition-all"><X size={18} /></button>
              </div>
              
              {hasActiveOrder && (
                <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200 shadow-[0_2px_0_#93c5fd]">
                  <p className="text-xs font-bold text-blue-800">Existing Order Active</p>
                  <p className="text-xs text-blue-600 mt-1">Order #{existingOrder.orderNumber?.slice(-8)} • Status: {existingOrder.status}</p>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="text-gray-400 text-sm font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{item.name}</span>
                          <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-green-500 shadow-[0_1px_0_#86efac]' : 'bg-red-500 shadow-[0_1px_0_#fca5a5]'}`} />
                        </div>
                        <p className="text-sm font-bold text-green-600 mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1 shadow-[0_2px_0_#d1d5db]">
                        <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-green-600 transition"><Minus size={12} /></button>
                        <span className="text-sm font-bold text-gray-800 min-w-[25px] text-center">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-green-600 transition"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 bg-red-50 rounded-xl shadow-[0_1px_0_#fca5a5] active:translate-y-[1px] transition-all"><Trash2 size={14} /></button>
                    </div>
                  ))
                )}
              </div>
              
              {!hasActiveOrder && cart.length > 0 && (
                <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
                  <input type="text" placeholder="Your Name *" value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} className={clay.input + " mb-2"} />
                  <input type="tel" placeholder="Phone Number *" value={customerDetails.phone} onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })} className={clay.input + " mb-2"} />
                  <textarea placeholder="Special Instructions (optional)" value={customerDetails.note} onChange={(e) => setCustomerDetails({ ...customerDetails, note: e.target.value })} rows={2} className={clay.input} />
                </div>
              )}
              
              {hasActiveOrder && cart.length > 0 && (
                <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
                  <textarea placeholder="Additional instructions..." value={customerDetails.note} onChange={(e) => setCustomerDetails({ ...customerDetails, note: e.target.value })} rows={2} className={clay.input} />
                </div>
              )}
              
              <div className="p-5 border-t-2 border-gray-100 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{cartTotal}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">GST (5%)</span><span className="font-bold">₹{tax}</span></div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-gray-100"><span>Total</span><span className="text-green-600">₹{grandTotal}</span></div>
                  {hasActiveOrder && existingOrder && (
                    <div className="flex justify-between text-sm pt-2"><span className="text-gray-500">Existing Order Total</span><span className="font-bold">₹{existingOrder.total}</span></div>
                  )}
                </div>
                
                {hasActiveOrder ? (
                  <button onClick={handleAddToExistingOrder} disabled={loading || cart.length === 0} className={clay.btn.primary + " w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"}>
                    {loading && isAddingToExistingOrder ? 'Adding...' : `Add to Existing Order • ₹${grandTotal}`}
                  </button>
                ) : (
                  <button onClick={handlePlaceOrder} disabled={loading || cart.length === 0} className={clay.btn.primary + " w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"}>
                    {loading ? 'Placing Order...' : `Place Order • ₹${grandTotal}`}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}