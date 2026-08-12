"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// ─── Clay design tokens ──────────────────────────────────────────────────────
const clay = {
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-6 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
};

const downloadItems = [
  {
    id: "pos",
    name: "Hotel POS System",
    icon: "💳",
    description: "Complete point of sale system for hotel operations including billing, inventory, and order management",
    features: ["Offline Mode", "Invoice Generation", "Inventory Sync", "Multi-device Support"],
    version: "v3.2.1",
    size: "24.5 MB",
    platform: "Windows, macOS, Android"
  },
  {
    id: "owner-reporting",
    name: "Owner Reporting Dashboard",
    icon: "📊",
    description: "Real-time business analytics and reporting dashboard for hotel owners and management",
    features: ["Sales Analytics", "Revenue Reports", "Guest Insights", "Performance Metrics"],
    version: "v2.1.0",
    size: "18.2 MB",
    platform: "Web, iOS, Android"
  },
  {
    id: "captain-app",
    name: "Captain App",
    icon: "👨‍🍳",
    description: "Mobile app for restaurant captains to manage tables, orders, and staff coordination",
    features: ["Table Management", "Order Tracking", "Staff Scheduling", "Real-time Updates"],
    version: "v1.8.3",
    size: "12.7 MB",
    platform: "iOS, Android"
  }
];

export default function DownloadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (id) => {
    setDownloading(id);
    // Simulate download
    setTimeout(() => {
      setDownloading(null);
      alert(`Download started for ${downloadItems.find(item => item.id === id).name}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} hotels={hotels} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Downloads</h1>
              <p className="text-gray-400 text-sm mt-1">Download essential apps and tools for your restaurant operations</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={clay.statCard("#d8b4fe")}>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Available Apps</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{downloadItems.length}</p>
            </div>
            <div className={clay.statCard("#86efac")}>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Downloads</p>
              <p className="text-3xl font-semibold text-emerald-600 mt-1">2,847</p>
            </div>
            <div className={clay.statCard("#93c5fd")}>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Latest Update</p>
              <p className="text-3xl font-semibold text-blue-600 mt-1">Today</p>
            </div>
          </div>

          {/* Downloads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {downloadItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`${clay.card} overflow-hidden hover:translate-y-[-4px] hover:shadow-[0_12px_0_#e5e7eb,0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300`}
              >
                <div className="p-6">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-[#f5f5f0] flex items-center justify-center text-3xl shadow-[0_4px_0_#d1d5db,0_6px_12px_rgba(0,0,0,0.06)] mb-4">
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{item.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.features.map((feature) => (
                      <span key={feature} className="px-2.5 py-1 text-xs font-medium bg-[#f5f5f0] text-gray-600 rounded-xl shadow-[0_2px_0_#d1d5db]">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Version</span>
                      <span className="text-gray-700 font-medium">{item.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Size</span>
                      <span className="text-gray-700 font-medium">{item.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Platform</span>
                      <span className="text-gray-700 font-medium">{item.platform}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(item.id)}
                    disabled={downloading === item.id}
                    className={`${clay.btn.primary} w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {downloading === item.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 11v2h10v-2M8 3v6m-2.5-2L8 10l2.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download Now
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className={`${clay.card} mt-8 p-8 text-center`}>
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">More Apps Coming Soon</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              We're constantly improving our product suite. Stay tuned for customer loyalty app, inventory management, and more.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}