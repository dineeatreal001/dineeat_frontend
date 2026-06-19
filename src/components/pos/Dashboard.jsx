"use client";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Users, Receipt, Wallet, Calendar, Clock, Coffee, Star, ArrowUp, ArrowDown, Package, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

// Clay Design Tokens
const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    green: "bg-emerald-600 text-white font-semibold rounded-2xl shadow-[0_4px_0_#065f46,0_6px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_#065f46] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color, bgColor) =>
    `bg-gradient-to-br ${bgColor} rounded-3xl p-5 shadow-[0_8px_0_${color}] border border-white/20 hover:translate-y-[-2px] hover:shadow-[0_10px_0_${color}] transition-all duration-200`,
  input: "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
};

export default function Dashboard({ ctx }) {
  const { bills, orders, customers } = ctx;
  const [dateRange, setDateRange] = useState('today');

  // Filter data based on date range
  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = {
      bills: bills.filter(bill => {
        if (bill.type !== 'BILL') return false;
        const billDate = new Date(bill.timestamp);
        switch(dateRange) {
          case 'today': return billDate >= today;
          case 'week': return billDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month': return billDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      }),
      kots: bills.filter(bill => {
        if (bill.type !== 'KOT') return false;
        const kotDate = new Date(bill.timestamp);
        switch(dateRange) {
          case 'today': return kotDate >= today;
          case 'week': return kotDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month': return kotDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      })
    };
    return filtered;
  }, [bills, dateRange]);

  // Calculate all metrics dynamically
  const metrics = useMemo(() => {
    const revenue = filteredData.bills.reduce((sum, bill) => sum + bill.total, 0);
    const orders = filteredData.bills.length;
    const avgOrder = orders > 0 ? revenue / orders : 0;
    const totalKOTs = filteredData.kots.length;
    const totalItems = filteredData.bills.reduce((sum, bill) => sum + bill.items.length, 0);
    
    // Payment modes distribution
    const modeDistribution = {
      dine_in: filteredData.bills.filter(b => b.mode === 'dine_in').length,
      pickup: filteredData.bills.filter(b => b.mode === 'pickup').length,
      quick_bill: filteredData.bills.filter(b => b.mode === 'quick_bill').length
    };
    
    // Top selling items
    const itemSales = {};
    filteredData.bills.forEach(bill => {
      bill.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { qty: 0, revenue: 0, id: item.id, price: item.price };
        }
        itemSales[item.name].qty += item.qty;
        itemSales[item.name].revenue += item.price * item.qty;
      });
    });
    
    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Hourly distribution
    const hourlyData = Array(24).fill(0);
    filteredData.bills.forEach(bill => {
      const hour = new Date(bill.timestamp).getHours();
      hourlyData[hour]++;
    });
    
    // Daily trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayRevenue = filteredData.bills.filter(bill => {
        const billDate = new Date(bill.timestamp).toDateString();
        return billDate === date.toDateString();
      }).reduce((sum, bill) => sum + bill.total, 0);
      const dayOrders = filteredData.bills.filter(bill => {
        const billDate = new Date(bill.timestamp).toDateString();
        return billDate === date.toDateString();
      }).length;
      dailyTrend.push({ date: dateStr, revenue: dayRevenue, orders: dayOrders });
    }
    
    // Weekday analysis
    const weekdayData = Array(7).fill(0).map(() => ({ revenue: 0, orders: 0 }));
    filteredData.bills.forEach(bill => {
      const day = new Date(bill.timestamp).getDay();
      weekdayData[day].revenue += bill.total;
      weekdayData[day].orders += 1;
    });
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Customer insights
    const topCustomers = {};
    filteredData.bills.forEach(bill => {
      if (bill.customer && bill.customer !== '') {
        if (!topCustomers[bill.customer]) {
          topCustomers[bill.customer] = { visits: 0, spent: 0, phone: bill.phone };
        }
        topCustomers[bill.customer].visits += 1;
        topCustomers[bill.customer].spent += bill.total;
      }
    });
    
    const bestCustomers = Object.entries(topCustomers)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
    
    // Growth percentages (compare with previous period)
    let previousRevenue = 0;
    if (dateRange === 'today') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      previousRevenue = bills.filter(b => {
        if (b.type !== 'BILL') return false;
        const billDate = new Date(b.timestamp);
        return billDate >= yesterdayStart && billDate < new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000);
      }).reduce((sum, b) => sum + b.total, 0);
    } else if (dateRange === 'week') {
      const lastWeekStart = new Date();
      lastWeekStart.setDate(lastWeekStart.getDate() - 14);
      const lastWeekEnd = new Date();
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      previousRevenue = bills.filter(b => {
        if (b.type !== 'BILL') return false;
        const billDate = new Date(b.timestamp);
        return billDate >= lastWeekStart && billDate < lastWeekEnd;
      }).reduce((sum, b) => sum + b.total, 0);
    }
    
    const revenueGrowth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    return {
      revenue,
      orders,
      avgOrder,
      totalKOTs,
      totalItems,
      modeDistribution,
      topItems,
      hourlyData,
      dailyTrend,
      weekdayData,
      weekdays,
      bestCustomers,
      revenueGrowth,
      previousPeriod: dateRange === 'today' ? 'yesterday' : dateRange === 'week' ? 'previous week' : 'previous month'
    };
  }, [filteredData, bills, dateRange]);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.bills.map((bill, index) => ({
      'S.No': index + 1,
      'Bill ID': bill.id,
      'Table No.': bill.tableId,
      'Customer': bill.customer || 'Walk-in',
      'Phone': bill.phone || '-',
      'Items Count': bill.items.length,
      'Items': bill.items.map(i => `${i.name} (${i.qty})`).join(', '),
      'Subtotal': bill.subtotal,
      'Tax (5%)': bill.tax || Math.round(bill.total * 0.05),
      'Total Amount': bill.total,
      'Date & Time': new Date(bill.timestamp).toLocaleString('en-IN'),
      'Mode': bill.mode || 'dine_in'
    }));
    
    const summaryData = [
      { Metric: 'Total Revenue', Value: `₹${metrics.revenue.toFixed(2)}` },
      { Metric: 'Total Orders', Value: metrics.orders },
      { Metric: 'Average Order Value', Value: `₹${metrics.avgOrder.toFixed(2)}` },
      { Metric: 'Total Items Sold', Value: metrics.totalItems },
      { Metric: 'Total KOTs', Value: metrics.totalKOTs },
      { Metric: 'Dine-in Orders', Value: metrics.modeDistribution.dine_in },
      { Metric: 'Pickup/Delivery', Value: metrics.modeDistribution.pickup },
      { Metric: 'Quick Bill', Value: metrics.modeDistribution.quick_bill },
      { Metric: 'Date Range', Value: dateRange },
      { Metric: 'Generated On', Value: new Date().toLocaleString('en-IN') }
    ];
    
    const topItemsData = metrics.topItems.map((item, i) => ({
      'Rank': i + 1,
      'Item Name': item.name,
      'Quantity Sold': item.qty,
      'Revenue Generated': `₹${item.revenue.toFixed(2)}`,
      'Price Per Unit': `₹${item.price}`
    }));
    
    const customerData = metrics.bestCustomers.map((customer, i) => ({
      'Rank': i + 1,
      'Customer Name': customer.name,
      'Phone': customer.phone || '-',
      'Total Visits': customer.visits,
      'Total Spent': `₹${customer.spent.toFixed(2)}`
    }));
    
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(exportData);
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    const ws3 = XLSX.utils.json_to_sheet(topItemsData);
    const ws4 = XLSX.utils.json_to_sheet(customerData);
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Bill Details');
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws3, 'Top Items');
    XLSX.utils.book_append_sheet(wb, ws4, 'Top Customers');
    
    XLSX.writeFile(wb, `POS_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f5f5f0] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time business insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer shadow-[0_2px_0_#e5e7eb]"
          >
            <option value="today">📅 Today</option>
            <option value="week">📆 Last 7 Days</option>
            <option value="month">📆 Last 30 Days</option>
            <option value="all">📅 All Time</option>
          </select>
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-[#a3e635] text-gray-900 rounded-2xl text-sm font-bold hover:bg-[#bef264] transition shadow-[0_4px_0_#6aaa00] active:translate-y-[2px] active:shadow-none"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className={clay.statCard("#065f46", "from-emerald-600 to-emerald-700")}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-white/80 font-semibold uppercase tracking-wider">Total Revenue</span>
            <Wallet size={20} className="text-white/80" />
          </div>
          <div className="text-3xl font-bold text-white">₹{metrics.revenue.toFixed(2)}</div>
          {metrics.revenueGrowth !== 0 && (
            <div className="flex items-center gap-1 text-xs text-white/70 mt-2">
              {metrics.revenueGrowth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(metrics.revenueGrowth).toFixed(1)}% vs {metrics.previousPeriod}
            </div>
          )}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={clay.card + " p-5"}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <Receipt size={20} className="text-[#a3e635]" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.orders}</div>
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">completed bills</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={clay.card + " p-5"}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Order</span>
            <TrendingUp size={20} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{metrics.avgOrder.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-2">per transaction</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={clay.card + " p-5"}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Sold</span>
            <Package size={20} className="text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.totalItems}</div>
          <div className="text-xs text-gray-400 mt-2">total quantity</div>
        </motion.div>
      </div>

      {/* Revenue Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clay.card + " p-5 mb-6"}>
        <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Calendar size={16} className="text-[#a3e635]" /> Revenue & Orders Trend (Last 7 Days)
        </h3>
        <div className="flex items-end gap-2 sm:gap-3 h-64 overflow-x-auto pb-4">
          {metrics.dailyTrend.map((day, i) => {
            const maxRevenue = Math.max(...metrics.dailyTrend.map(d => d.revenue), 1);
            const height = (day.revenue / maxRevenue) * 160;
            return (
              <div key={i} className="flex-1 min-w-[70px] flex flex-col items-center gap-2">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-[#a3e635] to-[#bef264] rounded-xl transition-all duration-300"
                    style={{ height: `${Math.max(height, 4)}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 whitespace-nowrap">
                      ₹{day.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                    {day.orders} orders
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-8">{day.date}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={clay.card + " p-5"}>
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" /> Top Selling Items
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {metrics.topItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No data available</div>
            ) : (
              metrics.topItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-[0_2px_0_rgba(0,0,0,0.1)] ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-500' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-400">Qty: {item.qty} | ₹{item.price}/unit</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600">₹{item.revenue.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Order Mode Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={clay.card + " p-5"}>
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={16} /> Order Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(metrics.modeDistribution).map(([mode, count]) => {
              const percentage = metrics.orders > 0 ? (count / metrics.orders) * 100 : 0;
              const labels = { dine_in: '🍽️ Dine In', pickup: '📦 Pickup/Delivery', quick_bill: '⚡ Quick Bill' };
              return (
                <div key={mode}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="font-semibold text-gray-600">{labels[mode]}</span>
                    <span className="font-bold text-gray-800">{count} orders ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="bg-gradient-to-r from-[#a3e635] to-[#84cc16] h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Peak Hours */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-[#a3e635]" /> Peak Hours
            </h3>
            <div className="grid grid-cols-6 gap-1 sm:gap-2">
              {metrics.hourlyData.slice(0, 18).map((orders, hour) => {
                const maxOrders = Math.max(...metrics.hourlyData, 1);
                const intensity = (orders / maxOrders) * 100;
                return (
                  <div key={hour} className="text-center">
                    <div 
                      className="rounded-xl p-1.5 sm:p-2 mb-1 transition-all"
                      style={{ 
                        backgroundColor: `rgba(163, 230, 53, ${0.1 + intensity / 100 * 0.5})`,
                        border: intensity > 0 ? '2px solid rgba(163, 230, 53, 0.4)' : '2px solid #e5e7eb'
                      }}
                    >
                      <div className="text-sm sm:text-base font-bold text-gray-700">{orders}</div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">{hour}:00</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Best Customers & Weekday Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Customers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={clay.card + " p-5"}>
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-[#a3e635]" /> Best Customers
          </h3>
          {metrics.bestCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No customer data available</div>
          ) : (
            <div className="space-y-1">
              {metrics.bestCustomers.map((customer, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-xl transition">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{customer.name}</div>
                    <div className="text-xs text-gray-400">{customer.phone || 'No phone'} • {customer.visits} visits</div>
                  </div>
                  <div className="text-sm font-bold text-green-600">₹{customer.spent.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weekday Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={clay.card + " p-5"}>
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-[#a3e635]" /> Weekday Performance
          </h3>
          <div className="space-y-3">
            {metrics.weekdayData.map((day, i) => {
              const maxRevenue = Math.max(...metrics.weekdayData.map(d => d.revenue), 1);
              const width = (day.revenue / maxRevenue) * 100;
              const isToday = i === new Date().getDay();
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className={`${isToday ? 'font-bold text-[#a3e635]' : 'font-medium text-gray-600'}`}>
                      {metrics.weekdays[i]}
                    </span>
                    <span className="text-gray-500">₹{day.revenue.toLocaleString()} ({day.orders} orders)</span>
                  </div>
                  <div className="bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + (i * 0.05) }}
                      className={`h-full rounded-full ${isToday ? 'bg-[#a3e635] shadow-[0_1px_0_#6aaa00]' : 'bg-[#bef264]'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}