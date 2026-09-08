"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import jwt from 'jsonwebtoken';

// ─── Sample Data (unchanged, just moved) ──────────────────────────────────────
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai", revenue: "₹2,45,000", orders: 245, status: "active", rating: 4.8, growth: "+12%" },
  { id: 2, name: "Coastal Bites", location: "Goa", revenue: "₹1,85,000", orders: 189, status: "active", rating: 4.7, growth: "+8%" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi", revenue: "₹3,20,000", orders: 312, status: "active", rating: 4.9, growth: "+15%" },
  { id: 4, name: "Sushi House", location: "Bangalore", revenue: "₹1,95,000", orders: 178, status: "inactive", rating: 4.6, growth: "+5%" },
];

const recentOrders = [
  { id: "ORD-001", hotel: "Spice Villa", customer: "Rajesh Kumar", amount: "₹2,450", status: "completed", time: "10:30 AM" },
  { id: "ORD-002", hotel: "Coastal Bites", customer: "Priya Sharma", amount: "₹1,890", status: "processing", time: "11:15 AM" },
  { id: "ORD-003", hotel: "Punjab Dhaba", customer: "Amit Singh", amount: "₹3,200", status: "completed", time: "09:45 AM" },
  { id: "ORD-004", hotel: "Spice Villa", customer: "Neha Gupta", amount: "₹1,750", status: "pending", time: "11:30 AM" },
  { id: "ORD-005", hotel: "Sushi House", customer: "Vikram Mehta", amount: "₹2,890", status: "completed", time: "10:15 AM" },
];

const revenueData = [
  { month: "Jan", revenue: 420000, profit: 126000 },
  { month: "Feb", revenue: 485000, profit: 145500 },
  { month: "Mar", revenue: 528000, profit: 158400 },
  { month: "Apr", revenue: 612000, profit: 183600 },
  { month: "May", revenue: 698000, profit: 209400 },
  { month: "Jun", revenue: 845000, profit: 253500 },
];

const categoryData = [
  { name: "North Indian", value: 35, color: "#4ade80" },
  { name: "Chinese", value: 25, color: "#34d399" },
  { name: "South Indian", value: 20, color: "#6ee7b7" },
  { name: "Italian", value: 12, color: "#a7f3d0" },
  { name: "Others", value: 8, color: "#d1fae5" },
];

const topItems = [
  { name: "Butter Chicken", orders: 345, revenue: "₹1,72,500", growth: "+23%" },
  { name: "Paneer Tikka", orders: 298, revenue: "₹1,19,200", growth: "+18%" },
  { name: "Chicken Biryani", orders: 267, revenue: "₹1,60,200", growth: "+15%" },
  { name: "Garlic Naan", orders: 234, revenue: "₹46,800", growth: "+12%" },
  { name: "Dal Makhani", orders: 189, revenue: "₹56,700", growth: "+9%" },
];

const performanceData = [
  { day: "Mon", orders: 45, revenue: 125000 },
  { day: "Tue", orders: 52, revenue: 142000 },
  { day: "Wed", orders: 48, revenue: 138000 },
  { day: "Thu", orders: 61, revenue: 168000 },
  { day: "Fri", orders: 78, revenue: 215000 },
  { day: "Sat", orders: 89, revenue: 245000 },
  { day: "Sun", orders: 72, revenue: 198000 },
];

// ─── Clay Design Tokens (matched with ReservationsPage) ────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
    outline:
      "bg-transparent text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 shadow-[0_4px_0_#e5e7eb] hover:shadow-[0_2px_0_#e5e7eb] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-5 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
};

// ─── Reusable Components ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed: "bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]",
    processing: "bg-blue-100 text-blue-600 shadow-[0_2px_0_#93c5fd]",
    pending: "bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]",
    active: "bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]",
    inactive: "bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl p-3 shadow-[0_8px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.1)] border border-white/80">
        <p className="font-bold text-gray-800 text-sm mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [timeRange, setTimeRange] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("Admin");
  const [greeting, setGreeting] = useState("Hello");
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("chaosstoredineeat");
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      if (loggedIn !== "1" || !token) {
        router.push("/login");
        return;
      }
      
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          const storeDataStr = localStorage.getItem("storeData");
          if (storeDataStr) {
            try {
              const storeData = JSON.parse(storeDataStr);
              setCompanyName(storeData.companyName || "Admin");
            } catch (e) {
              console.error("Error parsing storeData:", e);
            }
          }

          setGreeting(getGreeting());
          setCurrentDate(
            new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).toUpperCase()
          );

          setIsLoading(false);
        } else {
          localStorage.removeItem("chaosstoredineeat");
          localStorage.removeItem("authToken");
          localStorage.removeItem("storeData");
          localStorage.removeItem("storeId");
          localStorage.removeItem("jwtDecoded");
          sessionStorage.removeItem("authToken");
          router.push("/login");
        }
      } catch (err) {
        console.error("Token decode error:", err);
        router.push("/login");
      }
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Total Revenue", value: "₹8,45,000", change: "+12.5%", up: true, sub: "vs last month", accent: "#a3e635", icon: "💰" },
    { title: "Active Orders", value: "156", change: "+8.2%", up: true, sub: "currently active", accent: "#60a5fa", icon: "📋" },
    { title: "Total Hotels", value: hotels.length.toString(), change: "+1", up: true, sub: "registered locations", accent: "#c084fc", icon: "🏨" },
    { title: "Total Customers", value: "1,289", change: "+23.1%", up: true, sub: "registered users", accent: "#fb923c", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar
        sidebarOpen={sidebarOpen}
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels.map(h => ({ id: h.id, name: h.name, location: h.location }))}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">
          
          {/* Welcome Banner with Claymorphic depth */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-900 rounded-xl p-6 shadow-[0_5px_0_#1f2937,0_16px_32px_rgba(0,0,0,0.2)] border border-white/10 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-500/10" />
              <div className="absolute right-20 -bottom-20 w-40 h-40 rounded-full bg-emerald-500/5" />
              <div className="relative z-10 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-emerald-400 text-xs font-mono tracking-wider mb-2">{currentDate}</p>
                  <h1 className="text-2xl font-bold text-white mb-2">{greeting}, {companyName}! 👋</h1>
                  <p className="text-gray-300 text-sm">
                    You have <span className="text-[#a3e635] font-semibold">5 new orders</span> and <span className="text-[#a3e635] font-semibold">2 alerts</span> to review today.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/dashboard/live-tracking")}
                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 border border-white/20"
                  >
                    Live Tracking
                  </button>
                
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={clay.statCard(stat.accent)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl shadow-[0_4px_0_#e5e7eb]">
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${stat.up ? "bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]" : "bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]"}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-2">{stat.sub}</p>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${65 + idx * 8}%` }}
                    transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.accent }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row: Revenue Area + Categories Pie */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clay.card + " p-5"}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold">Revenue Overview</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Monthly revenue & profit</p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer"
                >
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Yearly</option>
                </select>
              </div>
              <div className="flex gap-6 mb-5">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">₹35,88,000</p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 shadow-[0_1px_0_#6ee7b7]">+12.5%</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Profit</p>
                  <p className="text-xl font-bold text-gray-900">₹10,76,400</p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 shadow-[0_1px_0_#6ee7b7]">+9.8%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#a3e635" fill="url(#colorRevenue)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#60a5fa" fill="url(#colorProfit)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Categories Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={clay.card + " p-5"}
            >
              <div className="mb-4">
                <h3 className="text-gray-900 font-bold">Order Categories</h3>
                <p className="text-gray-400 text-xs mt-0.5">By cuisine type</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color, boxShadow: `0_1px_0_${c.color}` }} />
                    <span className="text-sm text-gray-600 flex-1">{c.name}</span>
                    <span className="text-sm font-bold text-gray-800">{c.value}%</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full" style={{ width: `${c.value * 2.86}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Weekly Performance Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={clay.card + " p-5 mb-8"}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-gray-900 font-bold">Weekly Performance</h3>
                <p className="text-gray-400 text-xs mt-0.5">Orders and revenue by day</p>
              </div>
              <button className="text-xs font-semibold text-[#a3e635] bg-[#f9fff0] px-4 py-2 rounded-2xl shadow-[0_2px_0_#d1fae5] hover:translate-y-[1px] transition-all">
                View Details →
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#a3e635" radius={[8, 8, 0, 0]} maxBarSize={45} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#93c5fd" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Hotels Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={clay.card + " p-5 mb-8"}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-gray-900 font-bold">Your Hotels</h3>
                <p className="text-gray-400 text-xs mt-0.5">Manage and monitor all locations</p>
              </div>
              <button className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-2xl shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] transition-all">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {hotels.map((hotel, idx) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#fafafa] rounded-2xl p-4 border border-gray-100 shadow-[0_6px_0_#e5e7eb] hover:shadow-[0_8px_0_#d1d5db] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shadow-[0_3px_0_#d1fae5]">
                      🏨
                    </div>
                    <StatusBadge status={hotel.status} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{hotel.name}</h4>
                  <p className="text-gray-400 text-xs mb-4">📍 {hotel.location}</p>
                  <div className="h-px bg-gray-100 mb-3" />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Revenue</p>
                      <p className="font-bold text-gray-800 text-sm">{hotel.revenue}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Orders</p>
                      <p className="font-bold text-gray-800 text-sm">{hotel.orders}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="font-bold text-gray-800 text-sm">{hotel.rating}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-xl shadow-[0_1px_0_#6ee7b7]">
                      {hotel.growth}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Row: Recent Orders + Top Items */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className={clay.card + " p-5"}
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-gray-900 font-bold">Recent Orders</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Latest transactions</p>
                </div>
                <button className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-2xl shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] transition-all">
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#6aaa00] flex items-center justify-center text-white font-bold shadow-[0_3px_0_#4d7c00]">
                      {order.customer.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{order.customer}</p>
                      <p className="text-gray-400 text-xs">{order.hotel} · {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{order.amount}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Selling Items */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={clay.card + " p-5"}
            >
              <div className="mb-5">
                <h3 className="text-gray-900 font-bold">Top Selling Items</h3>
                <p className="text-gray-400 text-xs mt-0.5">Most popular this month</p>
              </div>
              <div className="space-y-4">
                {topItems.map((item, idx) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-base shadow-[0_2px_0_#d1fae5]">
                          🍽️
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-sm">{item.revenue}</span>
                        <span className="text-xs font-semibold text-emerald-600 ml-2">{item.growth}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.orders / topItems[0].orders) * 100}%` }}
                          transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#a3e635] to-[#6aaa00]"
                        />
                      </div>
                      <span className="text-xs text-gray-400 min-w-[60px] text-right">{item.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}