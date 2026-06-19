// Header.tsx
"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Bell, ShoppingBag } from 'lucide-react';

const clay = {
  btn: "bg-white/10 backdrop-blur-sm rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 border border-white/20",
  notification: "bg-gray-900 rounded-2xl shadow-[0_8px_0_#1f2937] border border-gray-800",
};

export default function Header({ hotelName, tableNumber, cartItemCount, onCartClick, user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, title: "Special Offer", message: "20% off on orders above ₹500", time: "2 min ago", read: false },
    { id: 2, title: "New Item Added", message: "Butter Chicken Pizza is now available", time: "1 hour ago", read: false },
    { id: 3, title: "Order Ready", message: "Your order #ORD-001 is ready", time: "2 hours ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-900 border-b border-white/10 shadow-md"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#84cc16] shadow-[0_4px_0_#4d7c00]">
                <span className="text-xl font-bold text-gray-800">DE</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">{hotelName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">Table: {tableNumber}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="text-xs text-emerald-400">● Online Ordering</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {user && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_3px_0_#065f46]">
                  <span className="text-xs font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={clay.btn + " relative p-2 text-white/70 hover:text-white"}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-[0_2px_0_#b91c1c]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={clay.notification + " absolute right-0 top-full mt-2 w-80 overflow-hidden z-50"}
                    >
                      <div className="p-3 border-b border-gray-800">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                          <div key={notif.id} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition ${!notif.read ? 'bg-gray-800/30' : ''}`}>
                            <p className="text-xs font-semibold text-white">{notif.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className={clay.btn + " relative p-2 text-white/70 hover:text-white"}
              >
                <ShoppingBag size={18} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#a3e635] text-gray-900 text-xs rounded-full flex items-center justify-center font-bold shadow-[0_2px_0_#6aaa00] px-1">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </>
  );
}