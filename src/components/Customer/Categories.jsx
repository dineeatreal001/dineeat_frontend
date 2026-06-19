// Categories.tsx
"use client";
import { motion } from 'framer-motion';

const clay = {
  active: "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]",
  inactive: "bg-gray-100 text-gray-700 shadow-[0_3px_0_#d1d5db]",
};

export default function Categories({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="px-4 py-3">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => onSelectCategory('all')} className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${selectedCategory === 'all' ? clay.active : clay.inactive}`}>
          All
        </button>
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${selectedCategory === category.id ? clay.active : clay.inactive}`}
          >
            <span className="text-xl">{category.icon || '🍽️'}</span>
            <span className="text-xs font-medium">{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}