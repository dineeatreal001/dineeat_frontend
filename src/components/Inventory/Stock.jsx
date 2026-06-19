"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, Package, Truck, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
    danger:
      "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

export default function StockManagement({ storeId }) {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
    price: 0,
    supplierId: "",
    minStock: 10,
    currentStock: 0,
    category: "",
    expiryDate: "",
    batchNumber: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/items/${storeId}`);
      if (response.data.success) {
        setItems(response.data.items);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load inventory items");
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
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchItems(), fetchSuppliers()]);
  }, [storeId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Item name is required";
    if (!formData.supplierId) errors.supplierId = "Please select a supplier";
    if (formData.quantity <= 0) errors.quantity = "Quantity must be greater than 0";
    if (formData.price < 0) errors.price = "Price cannot be negative";
    if (formData.minStock < 0) errors.minStock = "Minimum stock cannot be negative";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createItem = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.post(`${API_URL}/api/inventory/items`, {
        storeId,
        ...formData,
        currentStock: formData.quantity,
      });

      if (response.data.success) {
        await fetchItems();
        closeModal();
        alert("Item added successfully!");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  const updateItem = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.put(`${API_URL}/api/inventory/items/${editingItem._id}`, {
        ...formData,
        storeId,
      });

      if (response.data.success) {
        await fetchItems();
        closeModal();
        alert("Item updated successfully!");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.response?.data?.message || "Failed to update item");
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/inventory/items/${itemId}`, {
        data: { storeId }
      });

      if (response.data.success) {
        await fetchItems();
        alert("Item deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  const addStock = async (itemId, quantity) => {
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/inventory/items/add-stock/${itemId}`, {
        quantity: parseInt(quantity),
        storeId,
      });

      if (response.data.success) {
        await fetchItems();
        alert(`Added ${quantity} units successfully!`);
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      alert(error.response?.data?.message || "Failed to add stock");
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        supplierId: item.supplierId,
        minStock: item.minStock,
        currentStock: item.currentStock,
        category: item.category || "",
        expiryDate: item.expiryDate || "",
        batchNumber: item.batchNumber || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        quantity: 0,
        unit: "kg",
        price: 0,
        supplierId: "",
        minStock: 10,
        currentStock: 0,
        category: "",
        expiryDate: "",
        batchNumber: "",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormErrors({});
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = selectedSupplier === "all" || item.supplierId === selectedSupplier;
    return matchesSearch && matchesSupplier;
  });

  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

  const statColors = [
    { label: "Total Items", value: items.length, color: "#93c5fd", textColor: "text-blue-600", icon: "📦" },
    { label: "Low Stock Items", value: lowStockItems.length, color: "#fca5a5", textColor: "text-red-600", icon: "⚠️" },
    { label: "Total Value", value: `₹${totalValue.toLocaleString()}`, color: "#86efac", textColor: "text-green-600", icon: "💰" },
    { label: "Suppliers", value: suppliers.length, color: "#d8b4fe", textColor: "text-purple-600", icon: "🏪" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-3xl p-8 text-center shadow-[0_8px_0_#fca5a5]">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 mb-2">Error Loading Data</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-2xl shadow-[0_4px_0_#b91c1c] hover:translate-y-[2px] hover:shadow-[0_2px_0_#b91c1c] transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            
          </div>
          <button
            onClick={() => openModal()}
            className={clay.btn.primary + " px-4 py-2 text-sm flex items-center gap-2"}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statColors.map(({ label, value, color, textColor, icon }) => (
            <div key={label} className={clay.statCard(color)}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                <span className="text-xl">{icon}</span>
              </div>
              <p className={`text-2xl font-semibold mt-1 ${textColor}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={clay.card + " p-4"}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={clay.input + " pl-10"}
              />
            </div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-4 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer"
            >
              <option value="all">📋 All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className={clay.card + " overflow-hidden"}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Current Stock</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Unit</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item, idx) => {
                  const supplier = suppliers.find(s => s._id === item.supplierId);
                  const isLowStock = item.currentStock <= item.minStock;
                  
                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                      className="hover:bg-[#f9fff0] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        {item.category && <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>}
                       </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                            {item.currentStock}
                          </span>
                          <button
                            onClick={() => {
                              const qty = prompt("Enter quantity to add:", "10");
                              if (qty) addStock(item._id, qty);
                            }}
                            className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-xl shadow-[0_1px_0_#86efac] hover:translate-y-[1px] transition-all"
                          >
                            + Add
                          </button>
                        </div>
                        {isLowStock && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold">Min: {item.minStock}</p>
                        )}
                       </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-3 py-1 rounded-2xl text-xs font-bold bg-gray-100 text-gray-600 shadow-[0_2px_0_#d1d5db]">
                          {item.unit}
                        </span>
                        </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-green-600">₹{item.price}</p>
                        </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-700">{supplier?.name || 'N/A'}</p>
                        </td>
                      <td className="px-5 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-bold bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]">
                            <AlertCircle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-2xl text-xs font-bold bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]">
                            In Stock
                          </span>
                        )}
                        </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-xl shadow-[0_1px_0_#93c5fd] hover:translate-y-[1px] transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded-xl shadow-[0_1px_0_#fca5a5] hover:translate-y-[1px] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal - Supplier Section at Top */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={clay.modal + " max-w-2xl w-full max-h-[90vh] overflow-y-auto"}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {editingItem ? "Update item information" : "Add a new item to inventory"}
                  </p>
                </div>
                <button onClick={closeModal} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
              </div>

              <div className="p-6 space-y-4">
                {/* SUPPLIER SECTION - AT THE TOP */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Truck size={16} />
                    Supplier Information
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Supplier *</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className={`${clay.input} bg-white ${formErrors.supplierId ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                      ))}
                    </select>
                    {formErrors.supplierId && <p className="text-xs text-red-500 mt-1">{formErrors.supplierId}</p>}
                    {suppliers.length === 0 && (
                      <p className="text-xs text-blue-600 mt-1">No suppliers available. Please add a supplier first.</p>
                    )}
                  </div>
                </div>

                {/* ITEM DETAILS SECTION */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Item Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Item Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`${clay.input} ${formErrors.name ? 'border-red-500' : ''}`}
                          placeholder="e.g., Tomato, Onion, Chicken"
                        />
                        {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={clay.input}
                          placeholder="e.g., Vegetables, Meat, Dairy"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                          className={`${clay.input} ${formErrors.quantity ? 'border-red-500' : ''}`}
                        />
                        {formErrors.quantity && <p className="text-xs text-red-500 mt-1">{formErrors.quantity}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Unit</label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className={clay.input}
                        >
                          <option value="kg">Kilogram (kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="ltr">Liter (ltr)</option>
                          <option value="ml">Milliliter (ml)</option>
                          <option value="piece">Piece</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price per Unit (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className={`${clay.input} ${formErrors.price ? 'border-red-500' : ''}`}
                        />
                        {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Minimum Stock Level</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                          className={`${clay.input} ${formErrors.minStock ? 'border-red-500' : ''}`}
                        />
                        {formErrors.minStock && <p className="text-xs text-red-500 mt-1">{formErrors.minStock}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batch Number</label>
                        <input
                          type="text"
                          value={formData.batchNumber}
                          onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                          className={clay.input}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className={clay.input}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-100 p-6 flex gap-3">
                <button
                  onClick={editingItem ? updateItem : createItem}
                  className={clay.btn.primary + " flex-1 py-3 text-sm flex items-center justify-center gap-2"}
                >
                  <Check size={16} />
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  onClick={closeModal}
                  className={clay.btn.secondary + " flex-1 py-3 text-sm"}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}