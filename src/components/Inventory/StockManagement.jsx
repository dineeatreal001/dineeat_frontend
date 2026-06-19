"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, Package, Truck, AlertCircle } from "lucide-react";
import axios from "axios";

export default function StockManagement({ storeId }) {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch inventory items
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

  // Fetch suppliers
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

  useEffect(() => {
    Promise.all([fetchItems(), fetchSuppliers()]);
  }, [storeId]);

  const createItem = async () => {
    if (!formData.name || !formData.supplierId) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/inventory/items`, {
        storeId,
        ...formData,
        currentStock: formData.quantity,
      });

      if (response.data.success) {
        await fetchItems();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  const updateItem = async () => {
    if (!formData.name) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/inventory/items/${editingItem._id}`, formData);

      if (response.data.success) {
        await fetchItems();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.response?.data?.message || "Failed to update item");
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/inventory/items/${itemId}`);

      if (response.data.success) {
        await fetchItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  const addStock = async (itemId, quantity) => {
    try {
      const response = await axios.post(`${API_URL}/api/inventory/items/add-stock/${itemId}`, {
        quantity: parseInt(quantity),
      });

      if (response.data.success) {
        await fetchItems();
        alert("Stock added successfully!");
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = selectedSupplier === "all" || item.supplierId === selectedSupplier;
    return matchesSearch && matchesSupplier;
  });

  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your inventory items and stock levels</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-[#a3e635] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Total Value</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Suppliers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
              />
            </div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const supplier = suppliers.find(s => s._id === item.supplierId);
                  const isLowStock = item.currentStock <= item.minStock;
                  
                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.currentStock}
                          </span>
                          <button
                            onClick={() => {
                              const qty = prompt("Enter quantity to add:", "10");
                              if (qty) addStock(item._id, qty);
                            }}
                            className="text-green-600 hover:text-green-700 text-xs"
                          >
                            + Add
                          </button>
                        </div>
                        {isLowStock && (
                          <p className="text-xs text-red-500 mt-1">Min: {item.minStock}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{item.unit}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">₹{item.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{supplier?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingItem ? "Update item information" : "Add a new item to inventory"}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                      placeholder="e.g., Tomato, Onion, Chicken"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                      placeholder="e.g., Vegetables, Meat, Dairy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
                <button
                  onClick={editingItem ? updateItem : createItem}
                  className="flex-1 bg-[#a3e635] text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
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