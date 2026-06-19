"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Check, Search, FolderPlus,
  Upload, Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle,
  Settings, Save, Power
} from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx';

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    purple:
      "bg-purple-600 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6b21a8,0_8px_16px_rgba(147,51,234,0.35)] hover:shadow-[0_3px_0_#6b21a8,0_4px_8px_rgba(147,51,234,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue:
      "bg-blue-600 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-600 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-2xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  input:
    "w-full px-3 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// Add this component above ConfigureModal
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
        checked
          ? "bg-emerald-500 shadow-[0_3px_0_#059669]"
          : "bg-gray-300 shadow-[0_3px_0_#9ca3af]"
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

// Configure Modal Component
function ConfigureModal({ isOpen, onClose, categories, menuItems, onSave, onToggleCategory, onToggleItem, saving }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);
  const [localItems, setLocalItems] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalCategories(categories.map(c => ({ ...c })));
      setLocalItems(menuItems.map(i => ({ ...i })));
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [isOpen, categories, menuItems]);

  const handleToggleCategory = async (categoryId, currentStatus) => {
    const result = await onToggleCategory(categoryId, currentStatus);
    if (result.success) {
      setLocalCategories(prev => prev.map(cat =>
        cat._id === categoryId ? { ...cat, isActive: !currentStatus } : cat
      ));
      setLocalItems(prev => prev.map(item =>
        item.categoryId === categoryId ? { ...item, available: !currentStatus } : item
      ));
    }
  };

  const handleToggleItem = async (itemId, currentStatus) => {
    const result = await onToggleItem(itemId, currentStatus);
    if (result.success) {
      setLocalItems(prev => prev.map(item =>
        item._id === itemId ? { ...item, available: !currentStatus } : item
      ));
    }
  };

  const handleSaveConfiguration = async () => {
    const result = await onSave(localCategories, localItems);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const selectedCategoryItems = localItems.filter(
    item => item.categoryId === selectedCategory?._id
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={clay.modal + " w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col"}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configure Menu</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manage categories and item visibility</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveConfiguration}
                  disabled={saving}
                  className={`${saved ? "bg-emerald-500 shadow-[0_4px_0_#059669]" : clay.btn.primary} px-5 py-2.5 text-sm flex items-center gap-2 transition-all duration-300 disabled:opacity-50`}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side - Categories */}
              <div className="w-72 border-r-2 border-gray-100 overflow-y-auto bg-gray-50">
                <div className="p-4 border-b-2 border-gray-100 bg-white">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Categories</h3>
                  <p className="text-xs text-gray-400 mt-1">Click to view items</p>
                </div>
                <div className="p-2 space-y-1">
                  {localCategories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        selectedCategory?._id === category._id
                          ? "bg-[#f9fff0] border-2 border-[#a3e635] shadow-[0_2px_0_#6aaa00]"
                          : "hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-800 truncate flex-1 text-left">
                        {category.name}
                      </span>
                     <div
  onClick={(e) => {
    e.stopPropagation();
    handleToggleCategory(category._id, category.isActive);
  }}
>
  <Toggle checked={category.isActive} onChange={() => {}} />
</div>
                    </button>
                  ))}
                  {localCategories.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No categories yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Items */}
              <div className="flex-1 overflow-y-auto bg-white">
                {selectedCategory ? (
                  <>
                    <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{selectedCategory.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {selectedCategoryItems.length} items in this category
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-xl ${
                            selectedCategory.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {selectedCategory.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {selectedCategoryItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-5xl mb-3">🍽️</div>
                          <p className="text-gray-400 text-sm">No items in this category</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategoryItems.map((item) => (
                            <div
                              key={item._id}
                              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                item.available
                                  ? "bg-white border-gray-200 shadow-[0_2px_0_#e5e7eb]"
                                  : "bg-gray-50 border-gray-100 opacity-70"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-2xl">{item.emoji || "🍽️"}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                  <p className="text-xs text-green-600 font-medium">₹{item.price}</p>
                                </div>
                              </div>
                              <Toggle
  checked={item.available}
  onChange={() => handleToggleItem(item._id, item.available)}
/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-400 text-sm">Select a category to view items</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MenuItemsManagement({ storeId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSuccess, setBulkSuccess] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", categoryId: "", price: 0, veg: true, emoji: "🍽️", available: true, description: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "", description: "", image: "", sortOrder: 0, isActive: true,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchMenuItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/items/${storeId}`);
      if (response.data.success) setMenuItems(response.data.items);
    } catch (error) { console.error("Error fetching menu items:", error); }
  };

  const fetchCategories = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/categories/${storeId}`);
      if (response.data.success) setCategories(response.data.categories);
    } catch (error) { console.error("Error fetching categories:", error); }
    finally { setLoading(false); }
  };

  const fetchImportStats = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/import-stats/${storeId}`);
      if (response.data.success) setImportStats(response.data.stats);
    } catch (error) { console.error("Error fetching import stats:", error); }
  };

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchCategories(), fetchImportStats()]);
  }, [storeId]);

  // Toggle Category via API
  const handleToggleCategory = async (categoryId, currentStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/menu/category/${categoryId}`);
      if (response.data.success) {
        // Refresh data after toggle
        await Promise.all([fetchCategories(), fetchMenuItems()]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error toggling category:", error);
      alert(error.response?.data?.message || "Failed to toggle category");
      return { success: false };
    }
  };

  // Toggle Item via API
  const handleToggleItem = async (itemId, currentStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/menu/food/${itemId}`);
      if (response.data.success) {
        // Refresh data after toggle
        await fetchMenuItems();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error toggling item:", error);
      alert(error.response?.data?.message || "Failed to toggle item");
      return { success: false };
    }
  };

  // Save Configuration via API
  const handleSaveConfiguration = async (updatedCategories, updatedItems) => {
    setSavingConfig(true);
    try {
      // Prepare data for API
      const categoriesData = updatedCategories.map(cat => ({
        _id: cat._id,
        isActive: cat.isActive
      }));
      
      const itemsData = updatedItems.map(item => ({
        _id: item._id,
        available: item.available
      }));

      const response = await axios.post(`${API_URL}/api/menu/save-configuration`, {
        categories: categoriesData,
        items: itemsData
      });

      if (response.data.success) {
        // Refresh all data
        await Promise.all([fetchCategories(), fetchMenuItems()]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert(error.response?.data?.message || "Failed to save configuration");
      return { success: false };
    } finally {
      setSavingConfig(false);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let inQuote = false;
    let current = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const downloadTemplate = () => {
    const headers = ["Item Name*", "Category*", "Price*", "Food Type", "Description", "Emoji", "Is Active"];
    const samples = [
      ["Butter Chicken", "Main Course", 350, "non-veg", "Creamy tomato curry", "🍗", "Yes"],
      ["Paneer Tikka", "Starters", 250, "veg", "Grilled cottage cheese", "🧀", "Yes"],
      ["Garlic Naan", "Breads", 60, "veg", "Soft bread with garlic", "🥖", "Yes"],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
    ws["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 28 }, { wch: 8 }, { wch: 10 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Items");
    XLSX.writeFile(wb, `menu_template_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      alert("Upload an Excel (.xlsx/.xls) or CSV file");
      return;
    }

    setBulkLoading(true);
    setBulkErrors([]);
    setBulkSuccess(null);

    try {
      let jsonData = [];

      if (ext === "csv") {
        const text = await file.text();
        const lines = text.split("\n").filter(l => l.trim() && !l.startsWith("#"));
        if (lines.length < 2) { alert("CSV has no data rows"); setBulkLoading(false); return; }

        const headers = parseCSVLine(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const values = parseCSVLine(line);
          const row = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
          if (row["Item Name*"] || row["Category*"]) jsonData.push(row);
        }
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
      }

      if (jsonData.length === 0) { alert("No valid data found in file"); setBulkLoading(false); return; }

      const response = await axios.post(`${API_URL}/api/menu/bulk-upload/${storeId}`, { items: jsonData });

      if (response.data.success) {
        setBulkSuccess({
          inserted: response.data.inserted || 0,
          updated: response.data.updated || 0,
          totalRows: jsonData.length,
          categoriesCreated: response.data.categoriesCreated || 0,
        });
        if (response.data.errors?.length) setBulkErrors(response.data.errors);
        await Promise.all([fetchMenuItems(), fetchCategories(), fetchImportStats()]);
        setTimeout(() => { setShowBulkModal(false); setBulkSuccess(null); setBulkErrors([]); }, 3000);
      } else {
        alert(response.data.message || "Bulk upload failed");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert(e.response?.data?.message || "Failed to process bulk upload");
    } finally {
      setBulkLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const createMenuItem = async () => {
    if (!formData.name || !formData.categoryId || formData.price <= 0) { 
      alert("Fill all required fields"); 
      return; 
    }
    const cat = categories.find(c => c._id === formData.categoryId);
    try {
      const res = await axios.post(`${API_URL}/api/menu/items`, { 
        storeId, 
        ...formData, 
        category: cat?.name || "", 
        price: Number(formData.price) 
      });
      if (res.data.success) { 
        await fetchMenuItems(); 
        await fetchImportStats(); 
        closeModal(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to create menu item"); 
    }
  };

  const updateMenuItem = async () => {
    if (!formData.name || !formData.categoryId || formData.price <= 0) { 
      alert("Fill all required fields"); 
      return; 
    }
    const cat = categories.find(c => c._id === formData.categoryId);
    try {
      const res = await axios.put(`${API_URL}/api/menu/items/${editingItem._id}`, { 
        ...formData, 
        category: cat?.name || "", 
        price: Number(formData.price) 
      });
      if (res.data.success) { 
        await fetchMenuItems(); 
        await fetchImportStats(); 
        closeModal(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to update menu item"); 
    }
  };

  const deleteMenuItem = async (id) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/menu/items/${id}`);
      if (res.data.success) { 
        await fetchMenuItems(); 
        await fetchImportStats(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to delete menu item"); 
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      const res = await axios.put(`${API_URL}/api/menu/items/toggle/${item._id}`);
      if (res.data.success) { 
        await fetchMenuItems(); 
        await fetchImportStats(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to update item status"); 
    }
  };

  const createCategory = async () => {
    if (!categoryFormData.name) { 
      alert("Enter category name"); 
      return; 
    }
    try {
      const res = await axios.post(`${API_URL}/api/categories/create`, { 
        storeId, 
        ...categoryFormData, 
        slug: categoryFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      });
      if (res.data.success) { 
        await fetchCategories(); 
        await fetchImportStats(); 
        closeCategoryModal(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to create category"); 
    }
  };

  const updateCategory = async () => {
    if (!categoryFormData.name) { 
      alert("Enter category name"); 
      return; 
    }
    try {
      const res = await axios.put(`${API_URL}/api/categories/${editingCategory._id}`, { 
        ...categoryFormData, 
        slug: categoryFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      });
      if (res.data.success) { 
        await fetchCategories(); 
        await fetchImportStats(); 
        closeCategoryModal(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to update category"); 
    }
  };

  const deleteCategory = async (id) => {
    const count = menuItems.filter(i => i.categoryId === id).length;
    if (count > 0) { 
      alert(`Cannot delete — ${count} items in this category. Move them first.`); 
      return; 
    }
    if (!confirm("Delete this category?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/categories/${id}`);
      if (res.data.success) { 
        await fetchCategories(); 
        await fetchImportStats(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to delete category"); 
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const res = await axios.put(`${API_URL}/api/categories/${category._id}`, { 
        ...category, 
        isActive: !category.isActive 
      });
      if (res.data.success) { 
        await fetchCategories(); 
        await fetchImportStats(); 
      }
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to update category status"); 
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        categoryId: item.categoryId, 
        price: item.price, 
        veg: item.veg, 
        emoji: item.emoji || "🍽️", 
        available: item.available, 
        description: item.description || "" 
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        name: "", 
        categoryId: "", 
        price: 0, 
        veg: true, 
        emoji: "🍽️", 
        available: true, 
        description: "" 
      });
    }
    setShowModal(true);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({ 
        name: category.name, 
        description: category.description || "", 
        image: category.image || "", 
        sortOrder: category.sortOrder || 0, 
        isActive: category.isActive 
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ 
        name: "", 
        description: "", 
        image: "", 
        sortOrder: 0, 
        isActive: true 
      });
    }
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowModal(false); 
    setEditingItem(null);
    setFormData({ 
      name: "", 
      categoryId: "", 
      price: 0, 
      veg: true, 
      emoji: "🍽️", 
      available: true, 
      description: "" 
    });
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false); 
    setEditingCategory(null);
    setCategoryFormData({ 
      name: "", 
      description: "", 
      image: "", 
      sortOrder: 0, 
      isActive: true 
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCategories = categories.filter(cat => cat.isActive);
  const foodEmojis = ["🍽️","🍕","🍔","🍟","🌮","🍜","🍚","🍣","🍛","🥘","🍗","🥩","🐟","🥗","🍝","🥨","🥪","🌯"];
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(i => i.available).length;
  const unavailableItems = menuItems.filter(i => !i.available).length;

  if (loading) {
    return (
      <div className={clay.card + " p-8 text-center"}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm font-medium">Loading menu items...</p>
      </div>
    );
  }

  return (
    <>
      <div className={clay.card + " overflow-hidden"}>
        <div className="px-4 py-4 border-b-2 border-gray-100">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Menu Items</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add, edit or remove items</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfigureModal(true)}
                className={clay.btn.purple + " px-3 py-2 text-xs flex items-center gap-1.5 flex-shrink-0"}
              >
                <Settings size={13} /> Configure
              </button>
              <button onClick={() => openModal()} className={clay.btn.primary + " px-3 py-2 text-xs flex items-center gap-1.5 flex-shrink-0"}>
                <Plus size={13} /> Add Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2 mb-4">
            <button onClick={() => setShowBulkModal(true)} className={clay.btn.blue + " px-3 py-2 text-xs flex items-center justify-center gap-1.5"}>
              <Upload size={13} /> Bulk Import
            </button>
            <button onClick={downloadTemplate} className={clay.btn.green + " px-3 py-2 text-xs flex items-center justify-center gap-1.5"}>
              <Download size={13} /> Template
            </button>
            <button onClick={() => openCategoryModal()} className={clay.btn.purple + " px-3 py-2 text-xs flex items-center justify-center gap-1.5 col-span-2 md:col-span-1"}>
              <FolderPlus size={13} /> Add Category
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={clay.input + " pl-9"} />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a3e635] transition-all sm:w-44">
              <option value="all">📋 All Categories</option>
              {activeCategories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-0 border-b-2 border-gray-100 bg-[#f9fff0]">
          {[
            { label: "Total", value: totalItems, color: "text-gray-900" },
            { label: "Available", value: availableItems, color: "text-green-600" },
            { label: "Unavailable", value: unavailableItems, color: "text-gray-400" },
            { label: "Categories", value: activeCategories.length, color: "text-purple-600" },
          ].map((s, i) => (
            <div key={i} className={`text-center py-3 ${i < 3 ? "border-r border-gray-100" : ""}`}>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <div key={cat._id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition ${cat.isActive ? "bg-white border-2 border-gray-200 shadow-[0_2px_0_#e5e7eb]" : "bg-gray-100 border-2 border-gray-100 opacity-60"}`}>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <button onClick={() => openCategoryModal(cat)} className="text-blue-500 hover:text-blue-700 p-0.5 rounded"><Edit2 size={10} /></button>
                  <button onClick={() => deleteCategory(cat._id)} className="text-red-400 hover:text-red-600 p-0.5 rounded"><Trash2 size={10} /></button>
                  <button onClick={() => toggleCategoryStatus(cat)} className={`text-[9px] px-1.5 py-0.5 rounded-lg font-bold ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                    {cat.isActive ? "On" : "Off"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="text-gray-400 text-sm font-medium">No menu items found</p>
              <button onClick={() => openModal()} className="mt-3 text-[#a3e635] hover:text-[#84cc16] text-sm font-semibold transition">+ Add your first item</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, idx) => {
                const cat = categories.find(c => c._id === item.categoryId);
                return (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className={`rounded-2xl p-3 transition-all ${item.available ? "bg-white shadow-[0_4px_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.05)] border border-white/80" : "bg-gray-50 border border-gray-100 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl w-9 flex-shrink-0 text-center">{item.emoji || "🍽️"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${item.veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{item.veg ? "Veg" : "Non-Veg"}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{cat?.name || item.category}</p>
                        {item.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.description}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <p className="text-sm font-bold text-green-600">₹{item.price}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg shadow-[0_1px_0_#93c5fd] active:translate-y-[1px] transition-all"><Edit2 size={11} /></button>
                          <button onClick={() => deleteMenuItem(item._id)} className="p-1.5 text-red-500 bg-red-50 rounded-lg shadow-[0_1px_0_#fca5a5] active:translate-y-[1px] transition-all"><Trash2 size={11} /></button>
                          <button onClick={() => toggleItemAvailability(item)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${item.available ? "bg-emerald-100 text-emerald-700 shadow-[0_1px_0_#6ee7b7] active:translate-y-[1px]" : "bg-gray-100 text-gray-500 shadow-[0_1px_0_#d1d5db] active:translate-y-[1px]"}`}>{item.available ? "On" : "Off"}</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Configure Modal */}
      <ConfigureModal
        isOpen={showConfigureModal}
        onClose={() => setShowConfigureModal(false)}
        categories={categories}
        menuItems={menuItems}
        onSave={handleSaveConfiguration}
        onToggleCategory={handleToggleCategory}
        onToggleItem={handleToggleItem}
        saving={savingConfig}
      />

      {/* Add/Edit Menu Item Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className={clay.modal + " overflow-hidden rounded-b-none sm:rounded-2xl"}>
                <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div><h2 className="text-base font-bold text-gray-900">{editingItem ? "Edit Item" : "Add New Item"}</h2><p className="text-xs text-gray-400 mt-0.5">{editingItem ? "Update item information" : "Fill in the details below"}</p></div>
                  <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all"><X size={14} className="text-gray-600" /></button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Item Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={clay.input} placeholder="e.g., Butter Chicken" /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category *</label><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className={clay.input}><option value="">Select…</option>{activeCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>{activeCategories.length === 0 && <p className="text-[10px] text-red-500 mt-1">Add a category first.</p>}</div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price (₹) *</label><input type="number" min="0" step="1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className={clay.input} /></div>
                  </div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Emoji</label><select value={formData.emoji} onChange={(e) => setFormData({ ...formData, emoji: e.target.value })} className={clay.input}>{foodEmojis.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Food Type</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.veg} onChange={() => setFormData({ ...formData, veg: true })} className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700">Vegetarian</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!formData.veg} onChange={() => setFormData({ ...formData, veg: false })} className="w-4 h-4 text-red-600" /><span className="text-sm text-gray-700">Non-Veg</span></label></div></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className={clay.input + " resize-none"} placeholder="Optional description…" /></div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]" /><span className="text-sm font-medium text-gray-700">Available for ordering</span></label>
                </div>
                <div className="px-4 py-3 border-t-2 border-gray-100 flex gap-2">
                  <button onClick={editingItem ? updateMenuItem : createMenuItem} disabled={activeCategories.length === 0} className={clay.btn.primary + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"}><Check size={14} />{editingItem ? "Update Item" : "Add Item"}</button>
                  <button onClick={closeModal} className={clay.btn.secondary + " flex-1 py-2.5 text-sm"}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeCategoryModal}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className={clay.modal + " overflow-hidden rounded-b-none sm:rounded-2xl"}>
                <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div><h2 className="text-base font-bold text-gray-900">{editingCategory ? "Edit Category" : "Add Category"}</h2><p className="text-xs text-gray-400 mt-0.5">{editingCategory ? "Update category details" : "Create a new menu category"}</p></div>
                  <button onClick={closeCategoryModal} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all"><X size={14} className="text-gray-600" /></button>
                </div>
                <div className="p-4 space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category Name *</label><input type="text" value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className={clay.input} placeholder="e.g., Appetizers, Main Course" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label><textarea value={categoryFormData.description} onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })} rows={2} className={clay.input + " resize-none"} placeholder="Optional…" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sort Order</label><input type="number" min="0" value={categoryFormData.sortOrder} onChange={(e) => setCategoryFormData({ ...categoryFormData, sortOrder: parseInt(e.target.value) || 0 })} className={clay.input} placeholder="0" /><p className="text-[10px] text-gray-400 mt-1">Lower = appears first</p></div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="categoryActive" checked={categoryFormData.isActive} onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })} className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]" /><span className="text-sm font-medium text-gray-700">Active and visible</span></label>
                </div>
                <div className="px-4 py-3 border-t-2 border-gray-100 flex gap-2">
                  <button onClick={editingCategory ? updateCategory : createCategory} className={clay.btn.primary + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"}><Check size={14} />{editingCategory ? "Update" : "Create Category"}</button>
                  <button onClick={closeCategoryModal} className={clay.btn.secondary + " flex-1 py-2.5 text-sm"}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowBulkModal(false)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className={clay.modal + " overflow-hidden rounded-b-none sm:rounded-2xl"}>
                <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div><h2 className="text-base font-bold text-gray-900">Bulk Import</h2><p className="text-xs text-gray-400 mt-0.5">Upload Excel or CSV file</p></div>
                  <button onClick={() => setShowBulkModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all"><X size={14} className="text-gray-600" /></button>
                </div>
                <div className="p-4 space-y-3">
                  {importStats && (
                    <div className="grid grid-cols-3 gap-2 text-center bg-blue-50 rounded-2xl p-3 shadow-[0_2px_0_#93c5fd]">
                      <div><p className="text-lg font-bold text-blue-900">{importStats.totalItems}</p><p className="text-[10px] text-blue-600 font-medium">Items</p></div>
                      <div><p className="text-lg font-bold text-green-700">{importStats.activeItems}</p><p className="text-[10px] text-blue-600 font-medium">Active</p></div>
                      <div><p className="text-lg font-bold text-purple-700">{importStats.totalCategories}</p><p className="text-[10px] text-blue-600 font-medium">Categories</p></div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
                    <div><p className="text-xs font-bold text-gray-600 mb-1.5">Required columns</p><div className="space-y-1">{[
                      { col: "Item Name*", note: "Food item name" },
                      { col: "Category*", note: "Existing or new — auto-created" },
                      { col: "Price (₹)*", note: "Positive number, no symbols" },
                    ].map(r => (<div key={r.col} className="flex items-center gap-2"><code className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-700 flex-shrink-0 whitespace-nowrap">{r.col}</code><span className="text-[10px] text-gray-400">{r.note}</span></div>))}</div></div>
                    <div className="pt-2 border-t border-gray-200"><p className="text-xs font-bold text-gray-600 mb-1">Optional columns</p><div className="flex flex-wrap gap-1">{[{ col: "Food Type", hint: "veg / non-veg" }, { col: "Description", hint: "" }, { col: "Emoji", hint: "one emoji" }, { col: "Is Active", hint: "Yes / No" }].map(c => (<span key={c.col} className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">{c.col}{c.hint ? ` (${c.hint})` : ""}</span>))}</div></div>
                    <div className="pt-2 border-t border-gray-200 flex items-start gap-1.5"><span className="text-amber-500 text-xs mt-0.5">⚠</span><p className="text-[10px] text-amber-700 leading-snug">Use the downloaded template — do not rename or reorder column headers.</p></div>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-[#a3e635] hover:bg-[#f9fff0] transition-all cursor-pointer">
                    <input type="file" ref={fileInputRef} onChange={handleBulkUpload} accept=".xlsx,.xls,.csv" className="hidden" id="bulk-file" />
                    <label htmlFor="bulk-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <FileSpreadsheet size={36} className="text-gray-400" />
                      <p className="text-sm font-semibold text-gray-600">Click to upload file</p>
                      <p className="text-[10px] text-gray-400">.xlsx · .xls · .csv</p>
                    </label>
                  </div>
                  {bulkLoading && (<div className="flex items-center justify-center gap-2 py-2"><Loader2 size={18} className="animate-spin text-[#a3e635]" /><p className="text-sm text-gray-500">Processing file...</p></div>)}
                  {bulkSuccess && (<div className="bg-green-50 rounded-2xl p-3 border border-green-200 shadow-[0_2px_0_#86efac]"><div className="flex items-center gap-1.5 mb-1"><CheckCircle size={15} className="text-green-600" /><p className="text-sm font-bold text-green-700">Upload successful!</p></div><p className="text-xs text-green-600">{bulkSuccess.totalRows} rows processed · {bulkSuccess.inserted} added{bulkSuccess.updated > 0 && `, ${bulkSuccess.updated} updated`}{bulkSuccess.categoriesCreated > 0 && `, ${bulkSuccess.categoriesCreated} new categories created`}</p></div>)}
                  {bulkErrors.length > 0 && (<div className="bg-red-50 rounded-2xl p-3 border border-red-200 shadow-[0_2px_0_#fca5a5] max-h-36 overflow-y-auto"><div className="flex items-center gap-1.5 mb-1 sticky top-0 bg-red-50"><AlertCircle size={15} className="text-red-600" /><p className="text-sm font-bold text-red-700">Errors ({bulkErrors.length})</p></div><div className="space-y-0.5">{bulkErrors.slice(0, 10).map((err, i) => (<p key={i} className="text-[10px] text-red-600">{err.row ? `Row ${err.row}: ` : ''}{err.error}{err.item && ` (${err.item})`}</p>))}{bulkErrors.length > 10 && <p className="text-[10px] text-red-400">+{bulkErrors.length - 10} more</p>}</div></div>)}
                </div>
                <div className="px-4 py-3 border-t-2 border-gray-100 flex gap-2">
                  <button onClick={() => setShowBulkModal(false)} className={clay.btn.secondary + " flex-1 py-2.5 text-sm"}>Close</button>
                  <button onClick={downloadTemplate} className={clay.btn.green + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"}><Download size={13} /> Download Template</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}