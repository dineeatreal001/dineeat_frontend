// BottomNav.tsx
"use client";
import { Home, ShoppingBag, ClipboardList, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

const clay = {
  nav: "bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-[0_-8px_0_#1f2937]",
  active: "bg-[#a3e635]/10 text-emerald-400 shadow-[0_2px_0_#a3e635]",
  inactive: "text-gray-500",
};

export default function BottomNav({ activeTab, setActiveTab, cartItemCount, onCartClick }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartItemCount, isCart: true },
    { id: 'status', label: 'Orders', icon: ClipboardList },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-3 pb-3">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={clay.nav + " overflow-hidden"}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isCart) {
                return (
                  <motion.button
                    key={item.id}
                    onClick={onCartClick}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all"
                  >
                    <div className="relative">
                      <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-gray-500'} strokeWidth={1.8} />
                      {item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#a3e635] text-gray-900 text-[10px] rounded-full flex items-center justify-center font-bold px-1 shadow-[0_1px_0_#6aaa00]"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </motion.span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>{item.label}</span>
                  </motion.button>
                );
              }
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${isActive ? 'bg-[#a3e635]/10' : ''}`}
                >
                  <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-gray-500'} strokeWidth={1.8} />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeNavIndicator" className="absolute -top-0.5 w-8 h-0.5 bg-emerald-400 rounded-full" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
      <div className="h-20" />
    </>
  );
}