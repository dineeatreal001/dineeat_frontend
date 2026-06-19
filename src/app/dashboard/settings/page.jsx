"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import TablesManagement from "@/components/Settings/TableManagement";
import MenuItemsManagement from "@/components/Settings/MenuItemsManagement";
import BarcodeManagement from "@/components/Settings/BarcodeManagement";
import ForgotPassword from "@/components/Settings/ForgotPassword";
import axios from "axios";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [activeSetting, setActiveSetting] = useState("tables");
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    if (storedStoreId) {
      setStoreId(storedStoreId);
    }
    setLoading(false);
  }, []);

  const settingsOptions = [
    { id: "tables", name: "Tables Management", icon: "🪑", description: "Add, edit, or remove restaurant tables" },
    { id: "menu", name: "Menu Items", icon: "🍽️", description: "Manage your food and beverage items" },
    { id: "barcode", name: "Barcode Management", icon: "🏷️", description: "Add barcodes for direct billing" },
    { id: "password", name: "Change Password", icon: "🔐", description: "Update your account password" },
    { id: "taxes", name: "Tax Settings", icon: "💰", description: "Configure tax rates" },
    { id: "integrations", name: "Integrations", icon: "🔌", description: "Connect third-party services" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar 
        sidebarOpen={sidebarOpen} 
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-4 pb-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your restaurant configuration</p>
          </div>

          <div className="flex gap-6">
            {/* Settings Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Settings</h2>
                  <p className="text-xs text-gray-500 mt-1">Choose a section to configure</p>
                </div>
                <div className="p-2">
                  {settingsOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setActiveSetting(option.id)}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-1 ${
                        activeSetting === option.id
                          ? "bg-[#a3e635]/10 border-l-4 border-[#a3e635]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${activeSetting === option.id ? "text-[#a3e635]" : "text-gray-700"}`}>
                            {option.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {activeSetting === "tables" && (
                  <motion.div
                    key="tables"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TablesManagement storeId={storeId} />
                  </motion.div>
                )}
                
                {activeSetting === "menu" && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MenuItemsManagement storeId={storeId} />
                  </motion.div>
                )}
                
                {activeSetting === "barcode" && (
                  <motion.div
                    key="barcode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BarcodeManagement storeId={storeId} />
                  </motion.div>
                )}
                
                {activeSetting === "password" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ForgotPassword storeId={storeId} />
                  </motion.div>
                )}
                
                {activeSetting === "taxes" && (
                  <motion.div
                    key="taxes"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"
                  >
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Settings</h3>
                    <p className="text-gray-500 text-sm">This feature is coming soon. Stay tuned!</p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400">Features planned:</p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• Configure GST rates</li>
                        <li>• Set tax slabs for different items</li>
                        <li>• Tax exemption rules</li>
                        <li>• Tax report generation</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
                
                {activeSetting === "integrations" && (
                  <motion.div
                    key="integrations"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"
                  >
                    <div className="text-6xl mb-4">🔌</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h3>
                    <p className="text-gray-500 text-sm">This feature is coming soon. Stay tuned!</p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400">Features planned:</p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• Payment gateway integration</li>
                        <li>• Food delivery platform integration</li>
                        <li>• Accounting software integration</li>
                        <li>• CRM integration</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}