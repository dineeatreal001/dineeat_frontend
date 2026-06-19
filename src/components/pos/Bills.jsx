"use client";
import { useState } from 'react';
import { Search, Eye, Trash2, Receipt, Coffee, TrendingUp } from 'lucide-react';
import BillModal from '@/components/pos/BillModal';

// Clay Design Tokens
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
  },
  card: "bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb,0_8px_20px_rgba(0,0,0,0.06)] border border-white/80",
  input:
    "w-full px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
};

export default function Bills({ ctx }) {
  const { bills, setBills } = ctx;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewBill, setViewBill] = useState(null);

  const filtered = bills.filter(b => {
    const matchType = filter === 'all' || b.type === filter;
    const matchSearch = b.tableId?.toString().includes(search) || 
                       b.customer?.toLowerCase().includes(search.toLowerCase()) || 
                       b.phone?.includes(search);
    return matchType && matchSearch;
  });

  const totalRevenue = bills.filter(b => b.type === 'BILL').reduce((s, b) => s + (b.total || 0), 0);
  const totalKOTs = bills.filter(b => b.type === 'KOT').length;
  const totalBills = bills.filter(b => b.type === 'BILL').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-gray-100 bg-white shadow-[0_4px_0_#e5e7eb]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt size={20} className="text-[#a3e635]" />
              Bills & KOT History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">View and manage all transactions</p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by table, customer..." 
              className={clay.input + " pl-9 w-56"}
            />
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'all', label: 'All', icon: '📋' },
            { id: 'KOT', label: 'KOT', icon: '🍽️' },
            { id: 'BILL', label: 'Bill', icon: '🧾' },
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)} 
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                filter === f.id 
                  ? 'bg-[#a3e635] text-gray-900 shadow-[0_3px_0_#6aaa00]' 
                  : 'bg-gray-100 text-gray-600 shadow-[0_2px_0_#d1d5db] hover:shadow-[0_1px_0_#d1d5db] hover:translate-y-[1px]'
              }`}
            >
              <span className="mr-1.5">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 p-5 bg-[#f5f5f0]">
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total KOTs</p>
            <Coffee size={18} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{totalKOTs}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Bills</p>
            <Receipt size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{totalBills}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className={clay.card + " overflow-hidden"}>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🧾</div>
              <p className="text-gray-400 text-sm font-medium">No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Table</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((bill, idx) => (
                    <tr key={bill.id} className="hover:bg-[#f9fff0] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-gray-400">{filtered.length - idx}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold shadow-[0_2px_0_rgba(0,0,0,0.1)] ${
                          bill.type === 'BILL' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {bill.type === 'BILL' ? '🧾 Bill' : '🍽️ KOT'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-800">{bill.tableName || bill.tableId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{bill.customer || '—'}</p>
                        {bill.phone && <p className="text-xs text-gray-400">{bill.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex w-8 h-8 items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-700 shadow-[0_2px_0_#d1d5db]">
                          {bill.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-green-600">₹{bill.total}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{new Date(bill.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(bill.timestamp).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => setViewBill(bill)} 
                          className="p-2 text-blue-600 bg-blue-50 rounded-xl shadow-[0_1px_0_#93c5fd] hover:translate-y-[1px] transition-all"
                          title="View Bill"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewBill && <BillModal bill={viewBill} onClose={() => setViewBill(null)} />}
    </div>
  );
}