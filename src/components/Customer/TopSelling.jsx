"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCustomerCart } from '@/context/CustomerCartContext';

// Clay Design Tokens
const clay = {
  card: "bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb,0_8px_16px_rgba(0,0,0,0.06)] border border-white/80 hover:shadow-[0_4px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition-all duration-200",
  btn: "w-7 h-7 bg-[#a3e635] text-gray-900 rounded-xl flex items-center justify-center shadow-[0_3px_0_#6aaa00,0_2px_8px_rgba(163,230,53,0.3)] hover:shadow-[0_1px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[3px] transition-all duration-150",
};

export default function TopSelling({ items }) {
  const { addToCart } = useCustomerCart();

  if (!items || items.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <span className="text-base">🔥</span> Top Selling
        </h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-xl shadow-[0_1px_0_#d1d5db]">Popular this week</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, idx) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
            className={clay.card + " flex-shrink-0 w-40 overflow-hidden"}
          >
            <div className="relative h-28 bg-gradient-to-br from-[#f0ffc0] to-[#e8ffa0] flex items-center justify-center">
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
            <div className="p-2.5">
              <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
              {item.description && (
                <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-green-600">₹{item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                  className={clay.btn + " disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"}
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}