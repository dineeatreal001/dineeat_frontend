"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import OrdersReport from "@/components/Reports/OrdersReport";
import InventoryReport from "@/components/Reports/InventoryReport";
import StaffReport from "@/components/Reports/StaffReport";
import CustomerReport from "@/components/Reports/CustomerReport";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// Clay Design Tokens
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  sidebarItem: "bg-gray-100 text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] transition-all duration-150",
  sidebarActive: "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]",
};

const reportTypes = [
  { id: "orders", label: "Orders Report", icon: "📋" },
  { id: "inventory", label: "Inventory Report", icon: "📦" },
  { id: "staff", label: "Staff Report", icon: "👥" },
  { id: "customer", label: "Customer Report", icon: "👤" },
];

export default function SalesReportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [activeReport, setActiveReport] = useState("orders");
  const [storeId, setStoreId] = useState(null);

  // Get storeId from localStorage
  useState(() => {
    const storeDataStr = localStorage.getItem('storeData');
    if (storeDataStr) {
      try {
        const storeData = JSON.parse(storeDataStr);
        const id = storeData.id || storeData._id;
        if (id) setStoreId(id);
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
    const directStoreId = localStorage.getItem('storeId');
    if (directStoreId) setStoreId(directStoreId);
  }, []);

  const renderReport = () => {
    switch (activeReport) {
      case "orders":
        return <OrdersReport storeId={storeId} />;
      case "inventory":
        return <InventoryReport storeId={storeId} />;
      case "staff":
        return <StaffReport storeId={storeId} />;
      case "customer":
        return <CustomerReport storeId={storeId} />;
      default:
        return <OrdersReport storeId={storeId} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar
        sidebarOpen={sidebarOpen}
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Sales Reports</h1>
            <p className="text-gray-400 text-sm mt-1">View and export detailed reports</p>
          </div>

          {/* Report Type Sidebar - Horizontal on Mobile, Vertical on Desktop */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar - Report Types */}
            <div className="md:w-64 flex-shrink-0">
              <div className={clay.card + " p-4 sticky top-24"}>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Report Types</h3>
                <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveReport(type.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap md:whitespace-normal ${
                        activeReport === type.id
                          ? clay.sidebarActive
                          : clay.sidebarItem
                      }`}
                    >
                      <span className="text-base">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Report Component */}
            <div className="flex-1 min-w-0">
              {renderReport()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}