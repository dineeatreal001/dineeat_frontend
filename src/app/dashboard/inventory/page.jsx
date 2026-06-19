"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StockManagement from "@/components/Inventory/Stock";
import RecipesManagement from "@/components/Inventory/RecipesManagement";
import Reports from "@/components/Inventory/Reports";
import SuppliersManagement from "@/components/Inventory/SupplierManagement";
import LowStockAlerts from "@/components/Inventory/LowStockAlert";
import Overview from "@/components/Inventory/Overview";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

function InventoryPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(currentTab);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const storeData = localStorage.getItem("storeData");
    if (storeData) {
      try {
        const parsed = JSON.parse(storeData);
        setStoreId(parsed.id || parsed._id);
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
  }, []);

  // Update URL when tab changes without full page reload
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.push(`/dashboard/inventory?tab=${newTab}`, { scroll: false });
  };

  const renderContent = () => {
    switch(activeTab) {
      case "stock":
        return <StockManagement storeId={storeId} />;
      case "recipes":
        return <RecipesManagement storeId={storeId} />;
      case "reports":
        return <Reports storeId={storeId} />;
      case "suppliers":
        return <SuppliersManagement storeId={storeId} />;
      case "alerts":
        return <LowStockAlerts storeId={storeId} />;
      default:
        return <Overview storeId={storeId} />;
    }
  };

  // Get page title based on tab
  const getPageTitle = () => {
    switch(activeTab) {
      case "stock": return "Stock Management";
      case "recipes": return "Recipes Management";
      case "reports": return "Reports";
      case "suppliers": return "Supplier Management";
      case "alerts": return "Low Stock Alerts";
      default: return "Inventory Overview";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Navbar */}
      <Navbar 
        sidebarOpen={sidebarOpen} 
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 px-6 pb-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your restaurant inventory and supplies</p>
          </div>
          
          {/* Tab Navigation - Only changes main component, not full page */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-6 overflow-x-auto pb-1" aria-label="Tabs">
              <button
                onClick={() => handleTabChange("overview")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange("stock")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "stock"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Stock Management
              </button>
              <button
                onClick={() => handleTabChange("recipes")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "recipes"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Recipes
              </button>
              <button
                onClick={() => handleTabChange("reports")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "reports"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => handleTabChange("suppliers")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "suppliers"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Suppliers
              </button>
              <button
                onClick={() => handleTabChange("alerts")}
                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === "alerts"
                    ? "text-[#a3e635] border-b-2 border-[#a3e635]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Low Stock Alerts
              </button>
            </nav>
          </div>
          
          {/* Main Content Area - Only this changes */}
          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div>Loading inventory...</div>}>
      <InventoryPageContent />
    </Suspense>
  );
}