"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, AlertCircle, Truck, ChefHat } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function Overview({ storeId }) {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([fetchItems(), fetchRecipes(), fetchSuppliers()]);
  }, [storeId]);

  const fetchItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/items/${storeId}`);
      if (response.data.success) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchRecipes = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/recipes/${storeId}`);
      if (response.data.success) {
        setRecipes(response.data.recipes);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchSuppliers = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/suppliers/${storeId}`);
      if (response.data.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalStockValue = items.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const nearExpiryItems = items.filter(item => item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Dashboard and key metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Total Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{totalStockValue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Low Stock Items</h3>
            <p className="text-xs text-gray-500 mt-1">Items that need immediate attention</p>
          </div>
          <div className="p-4">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Stock: {item.currentStock} {item.unit}</p>
                    </div>
                    <span className="text-xs font-medium text-red-600">
                      Min: {item.minStock}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {lowStockItems.length > 0 && (
              <Link href="/inventory?tab=alerts">
                <button className="mt-4 text-sm text-[#a3e635] hover:text-[#bef264] font-medium">
                  View All →
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Recipes</h3>
            <p className="text-xs text-gray-500 mt-1">Recently added menu items with recipes</p>
          </div>
          <div className="p-4">
            {recipes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recipes created yet</p>
            ) : (
              <div className="space-y-3">
                {recipes.slice(0, 5).map((recipe) => (
                  <div key={recipe._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{recipe.menuItemName}</p>
                      <p className="text-xs text-gray-500">{recipe.ingredients.length} ingredients</p>
                    </div>
                    <span className="text-xs font-medium text-green-600">
                      ₹{recipe.totalCost}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {recipes.length > 0 && (
              <Link href="/inventory?tab=recipes">
                <button className="mt-4 text-sm text-[#a3e635] hover:text-[#bef264] font-medium">
                  View All Recipes →
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}