// SearchBar.tsx
"use client";
import { Search } from 'lucide-react';

const clay = {
  input: "w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
};

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="px-4 py-3">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for delicious items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={clay.input}
        />
      </div>
    </div>
  );
}