// MenuItems.tsx
"use client";
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCustomerCart } from '@/context/CustomerCartContext';

// Clay Design Tokens
const clay = {
  card: "bg-white rounded-3xl shadow-[0_6px_0_#e5e7eb,0_8px_16px_rgba(0,0,0,0.06)] border border-white/80 hover:shadow-[0_4px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition-all duration-200",
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_4px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
    secondary: "bg-gray-100 text-gray-700 font-semibold rounded-2xl shadow-[0_3px_0_#d1d5db] hover:shadow-[0_1px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[3px] transition-all duration-150",
    quantity: "bg-gray-100 text-gray-700 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all",
  },
};

export default function MenuItems({ items, cart }) {
  const { addToCart, updateQuantity } = useCustomerCart();

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem?.qty || 0;
  };

  if (!items || items.length === 0) {
    return (
      <div className="px-4 py-3 pb-24">
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-400 text-sm font-medium">No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 pb-24">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Menu</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, idx) => {
          const quantity = getItemQuantity(item._id);
          
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className={clay.card + " overflow-hidden"}
            >
              {/* Image/Emoji Section */}
              <div className="relative h-32 bg-gradient-to-br from-[#f0ffc0] to-[#e8ffa0] flex items-center justify-center">
                <span className="text-5xl drop-shadow-sm">{item.emoji || '🍽️'}</span>
                {item.isBestSeller && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-xl shadow-[0_2px_0_#b45309]">
                    Bestseller
                  </span>
                )}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold px-2 py-1 bg-red-500 rounded-xl shadow-[0_2px_0_#b91c1c]">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info Section */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm flex-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.1)] ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                
                {item.description && (
                  <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-base font-bold text-green-600">₹{item.price}</span>
                  
                  {quantity > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item._id, quantity - 1)}
                        className={clay.btn.quantity + " w-7 h-7 flex items-center justify-center"}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className={clay.btn.quantity + " w-7 h-7 flex items-center justify-center"}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className={clay.btn.primary + " px-3 py-1.5 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-400 text-sm font-medium">No items found in this category</p>
        </div>
      )}
    </div>
  );
}