"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download,ChefHat,Truck, TrendingUp, TrendingDown, Package, AlertCircle } from "lucide-react";
import axios from "axios";

export default function Reports({ storeId }) {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("stock");

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

  const downloadReport = () => {
    let reportData = [];
    let headers = [];
    
    if (reportType === "stock") {
      headers = ["Item Name", "Category", "Current Stock", "Unit", "Min Stock", "Status", "Value"];
      reportData = items.map(item => [
        item.name,
        item.category || "N/A",
        item.currentStock,
        item.unit,
        item.minStock,
        item.currentStock <= item.minStock ? "Low Stock" : "In Stock",
        `₹${(item.currentStock * item.price).toLocaleString()}`
      ]);
    } else if (reportType === "recipes") {
      headers = ["Menu Item", "Ingredients Count", "Total Cost", "Cost per Serving"];
      reportData = recipes.map(recipe => [
        recipe.menuItemName,
        recipe.ingredients.length,
        `₹${recipe.totalCost}`,
        `₹${(recipe.totalCost / recipe.yieldQuantity).toFixed(2)}`
      ]);
    } else if (reportType === "suppliers") {
      headers = ["Supplier Name", "Contact", "Email", "Items Supplied", "Total Value"];
      reportData = suppliers.map(supplier => {
        const supplierItems = items.filter(i => i.supplierId === supplier._id);
        const totalValue = supplierItems.reduce((sum, i) => sum + (i.currentStock * i.price), 0);
        return [
          supplier.name,
          supplier.contact,
          supplier.email || "N/A",
          supplierItems.length,
          `₹${totalValue.toLocaleString()}`
        ];
      });
    }

    const csvContent = [headers, ...reportData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalStockValue = items.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const totalRecipes = recipes.length;
  const totalSuppliers = suppliers.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">View and export inventory reports</p>
        </div>
        <button
          onClick={downloadReport}
          className="bg-[#a3e635] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center gap-2"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Total Stock Value</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₹{totalStockValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Total Recipes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalRecipes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Suppliers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSuppliers}</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setReportType("stock")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              reportType === "stock"
                ? "bg-[#a3e635] text-gray-900 shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Package size={16} className="inline mr-2" />
            Stock Report
          </button>
          <button
            onClick={() => setReportType("recipes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              reportType === "recipes"
                ? "bg-[#a3e635] text-gray-900 shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ChefHat size={16} className="inline mr-2" />
            Recipe Report
          </button>
          <button
            onClick={() => setReportType("suppliers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              reportType === "suppliers"
                ? "bg-[#a3e635] text-gray-900 shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Truck size={16} className="inline mr-2" />
            Supplier Report
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === "stock" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.category || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.currentStock}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.minStock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                        item.currentStock <= item.minStock
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {item.currentStock <= item.minStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{(item.currentStock * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "recipes" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Serving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{recipe.menuItemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{recipe.ingredients.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{recipe.totalCost}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ₹{(recipe.totalCost / recipe.yieldQuantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "suppliers" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Supplied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((supplier) => {
                  const supplierItems = items.filter(i => i.supplierId === supplier._id);
                  const totalValue = supplierItems.reduce((sum, i) => sum + (i.currentStock * i.price), 0);
                  return (
                    <tr key={supplier._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplierItems.length} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{totalValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}