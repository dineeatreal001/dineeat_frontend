"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus,Truck, Edit2, Trash2, X, Check, Search, Phone, Mail, MapPin, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function SuppliersManagement({ storeId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    gstNumber: "",
    paymentTerms: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchSuppliers = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/suppliers/${storeId}`);
      if (response.data.success) {
        setSuppliers(response.data.suppliers);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [storeId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Supplier name is required";
    if (!formData.contact.trim()) errors.contact = "Contact number is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createSupplier = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.post(`${API_URL}/api/inventory/suppliers`, {
        storeId,
        ...formData,
      });

      if (response.data.success) {
        await fetchSuppliers();
        closeModal();
        alert("Supplier added successfully!");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert(error.response?.data?.message || "Failed to create supplier");
    }
  };

  const updateSupplier = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.put(`${API_URL}/api/inventory/suppliers/${editingSupplier._id}`, {
        ...formData,
        storeId,
      });

      if (response.data.success) {
        await fetchSuppliers();
        closeModal();
        alert("Supplier updated successfully!");
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      alert(error.response?.data?.message || "Failed to update supplier");
    }
  };

  const deleteSupplier = async (supplierId) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/inventory/suppliers/${supplierId}`, {
        data: { storeId }
      });

      if (response.data.success) {
        await fetchSuppliers();
        alert("Supplier deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert(error.response?.data?.message || "Failed to delete supplier");
    }
  };

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email || "",
        address: supplier.address || "",
        gstNumber: supplier.gstNumber || "",
        paymentTerms: supplier.paymentTerms || "",
        notes: supplier.notes || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        contact: "",
        email: "",
        address: "",
        gstNumber: "",
        paymentTerms: "",
        notes: "",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormErrors({});
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Supplier Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your inventory suppliers</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-[#a3e635] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add Supplier
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <motion.div
              key={supplier._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Supplier</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(supplier)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteSupplier(supplier._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-gray-600">{supplier.contact}</span>
                </div>
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-600">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-600 line-clamp-2">{supplier.address}</span>
                  </div>
                )}
                {supplier.gstNumber && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">GST Number</p>
                    <p className="text-sm font-medium text-gray-700">{supplier.gstNumber}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Truck size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No suppliers found</p>
          </div>
        )}
      </div>

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
                    {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSupplier ? "Update supplier information" : "Add a new supplier to your inventory"}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#a3e635] ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., Fresh Foods Ltd"
                    />
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#a3e635] ${formErrors.contact ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="+91 XXXXX XXXXX"
                    />
                    {formErrors.contact && <p className="text-xs text-red-500 mt-1">{formErrors.contact}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#a3e635] ${formErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="supplier@example.com"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    placeholder="Full address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                      placeholder="22AAAAA0000A1Z"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    >
                      <option value="">Select Terms</option>
                      <option value="Net 15">Net 15 days</option>
                      <option value="Net 30">Net 30 days</option>
                      <option value="Net 45">Net 45 days</option>
                      <option value="COD">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
                <button
                  onClick={editingSupplier ? updateSupplier : createSupplier}
                  className="flex-1 bg-[#a3e635] text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editingSupplier ? "Update Supplier" : "Add Supplier"}
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