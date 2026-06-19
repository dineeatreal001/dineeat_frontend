"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, Barcode, Upload, Download, Printer, FileText, AlertCircle } from "lucide-react";
import axios from "axios";

export default function BarcodeManagement({ storeId }) {
  const [barcodes, setBarcodes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingBarcode, setEditingBarcode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [bulkData, setBulkData] = useState("");
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [formData, setFormData] = useState({
    barcodeNumber: "",
    itemId: "",
    itemName: "",
    price: 0,
    status: "active",
    notes: "",
  });

  const scanInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch barcodes
  const fetchBarcodes = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/barcodes/${storeId}`);
      if (response.data.success) {
        setBarcodes(response.data.barcodes);
      }
    } catch (error) {
      console.error("Error fetching barcodes:", error);
    }
  };

  // Fetch menu items for dropdown
  const fetchMenuItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/items/${storeId}`);
      if (response.data.success) {
        setMenuItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchBarcodes(), fetchMenuItems()]);
  }, [storeId]);

  // Generate random barcode number
  const generateBarcodeNumber = () => {
    const prefix = "890";
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const barcode = prefix + random;
    setFormData({ ...formData, barcodeNumber: barcode });
  };

  // Handle scan input
  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      const response = await axios.post(`${API_URL}/api/barcodes/scan`, {
        storeId,
        barcodeNumber: scanInput,
      });

      if (response.data.success && response.data.item) {
        setScanMessage(`✅ Item added: ${response.data.item.itemName} - ₹${response.data.item.price}`);
        setScanInput("");
        if (window.onBarcodeScanned) {
          window.onBarcodeScanned(response.data.item);
        }
      } else {
        setScanMessage("❌ Barcode not found in system");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      setScanMessage("❌ Error scanning barcode");
    }

    setTimeout(() => setScanMessage(""), 3000);
  };

  // Create barcode
  const createBarcode = async () => {
    if (!formData.barcodeNumber || !formData.itemId) {
      alert("Please fill all required fields");
      return;
    }

    const selectedItem = menuItems.find(item => item._id === formData.itemId);

    try {
      const response = await axios.post(`${API_URL}/api/barcodes/create`, {
        storeId,
        barcodeNumber: formData.barcodeNumber,
        itemId: formData.itemId,
        itemName: selectedItem?.name,
        price: selectedItem?.price,
        status: formData.status,
        notes: formData.notes,
      });

      if (response.data.success) {
        await fetchBarcodes();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating barcode:", error);
      alert(error.response?.data?.message || "Failed to create barcode");
    }
  };

  // Update barcode
  const updateBarcode = async () => {
    if (!formData.barcodeNumber || !formData.itemId) {
      alert("Please fill all required fields");
      return;
    }

    const selectedItem = menuItems.find(item => item._id === formData.itemId);

    try {
      const response = await axios.put(`${API_URL}/api/barcodes/${editingBarcode._id}`, {
        barcodeNumber: formData.barcodeNumber,
        itemId: formData.itemId,
        itemName: selectedItem?.name,
        price: selectedItem?.price,
        status: formData.status,
        notes: formData.notes,
      });

      if (response.data.success) {
        await fetchBarcodes();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating barcode:", error);
      alert(error.response?.data?.message || "Failed to update barcode");
    }
  };

  // Delete barcode
  const deleteBarcode = async (barcodeId) => {
    if (!confirm("Are you sure you want to delete this barcode?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/barcodes/${barcodeId}`);

      if (response.data.success) {
        await fetchBarcodes();
      }
    } catch (error) {
      console.error("Error deleting barcode:", error);
      alert(error.response?.data?.message || "Failed to delete barcode");
    }
  };

  // Toggle barcode status
  const toggleBarcodeStatus = async (barcode) => {
    try {
      const response = await axios.put(`${API_URL}/api/barcodes/toggle/${barcode._id}`);

      if (response.data.success) {
        await fetchBarcodes();
      }
    } catch (error) {
      console.error("Error toggling barcode status:", error);
      alert(error.response?.data?.message || "Failed to update barcode status");
    }
  };

  // Parse CSV data
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['barcode', 'itemname', 'price'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setBulkErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return null;
    }

    const items = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const item = {};
      
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });

      // Validate required fields
      if (!item.barcode) {
        errors.push(`Row ${i + 1}: Barcode number is required`);
        continue;
      }
      if (!item.itemname) {
        errors.push(`Row ${i + 1}: Item name is required`);
        continue;
      }
      if (!item.price || isNaN(item.price)) {
        errors.push(`Row ${i + 1}: Valid price is required`);
        continue;
      }

      // Check if barcode already exists
      const existingBarcode = barcodes.find(b => b.barcodeNumber === item.barcode);
      if (existingBarcode) {
        errors.push(`Row ${i + 1}: Barcode ${item.barcode} already exists`);
        continue;
      }

      // Find matching menu item
      const menuItem = menuItems.find(mi => 
        mi.name.toLowerCase() === item.itemname.toLowerCase()
      );

      if (!menuItem) {
        errors.push(`Row ${i + 1}: Menu item "${item.itemname}" not found`);
        continue;
      }

      items.push({
        barcodeNumber: item.barcode,
        itemId: menuItem._id,
        itemName: menuItem.name,
        price: parseFloat(item.price),
        status: item.status === 'inactive' ? 'inactive' : 'active',
        notes: item.notes || '',
      });
    }

    setBulkErrors(errors);
    return items;
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      setBulkData(csvText);
      const items = parseCSV(csvText);
      if (items && items.length > 0) {
        setBulkPreview(items);
      }
    };
    reader.readAsText(file);
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (bulkPreview.length === 0) {
      alert("No valid items to import");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of bulkPreview) {
      try {
        const response = await axios.post(`${API_URL}/api/barcodes/create`, {
          storeId,
          ...item,
        });
        if (response.data.success) {
          successCount++;
        }
      } catch (error) {
        failCount++;
        console.error("Error importing barcode:", error);
      }
    }

    alert(`Import completed!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
    await fetchBarcodes();
    closeBulkModal();
  };

  // Download sample CSV template
  const downloadTemplate = () => {
    const headers = ["barcode", "itemName", "price", "status", "notes"];
    const sampleData = [
      "8901234567890,Butter Chicken,450,active,Popular dish",
      "8901234567891,Paneer Tikka,320,active,Spicy",
      "8901234567892,Garlic Naan,40,active,Best seller",
    ];
    
    const csvContent = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export barcodes to CSV
  const exportToCSV = () => {
    const headers = ["Barcode Number", "Item Name", "Price", "Status", "Notes", "Created At"];
    const data = barcodes.map(b => [
      b.barcodeNumber,
      b.itemName,
      b.price,
      b.status,
      b.notes || "",
      new Date(b.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...data].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcodes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print barcode labels
  const printBarcodeLabel = (barcode) => {
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Label</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: white;
            }
            .label {
              text-align: center;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
              width: 300px;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 32px;
              letter-spacing: 2px;
              margin: 20px 0;
              font-weight: bold;
            }
            .item-name {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
            }
            .price {
              font-size: 14px;
              color: #4ade80;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="item-name">${barcode.itemName}</div>
            <div class="barcode">${barcode.barcodeNumber}</div>
            <div class="price">₹${barcode.price}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Print multiple barcode labels
  const printMultipleLabels = () => {
    const selectedBarcodes = barcodes.filter(b => b.status === "active");
    if (selectedBarcodes.length === 0) {
      alert("No active barcodes to print");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    let htmlContent = `
      <html>
        <head>
          <title>Barcode Labels</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .labels-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .label {
              text-align: center;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              letter-spacing: 2px;
              margin: 15px 0;
              font-weight: bold;
            }
            .item-name {
              font-size: 14px;
              font-weight: bold;
              margin: 10px 0;
            }
            .price {
              font-size: 12px;
              color: #4ade80;
              font-weight: bold;
            }
            @media print {
              .label {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
    `;

    selectedBarcodes.forEach(barcode => {
      htmlContent += `
        <div class="label">
          <div class="item-name">${barcode.itemName}</div>
          <div class="barcode">${barcode.barcodeNumber}</div>
          <div class="price">₹${barcode.price}</div>
        </div>
      `;
    });

    htmlContent += `
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const openModal = (barcode = null) => {
    if (barcode) {
      setEditingBarcode(barcode);
      setFormData({
        barcodeNumber: barcode.barcodeNumber,
        itemId: barcode.itemId,
        itemName: barcode.itemName,
        price: barcode.price,
        status: barcode.status,
        notes: barcode.notes || "",
      });
    } else {
      setEditingBarcode(null);
      setFormData({
        barcodeNumber: "",
        itemId: "",
        itemName: "",
        price: 0,
        status: "active",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBarcode(null);
    setFormData({
      barcodeNumber: "",
      itemId: "",
      itemName: "",
      price: 0,
      status: "active",
      notes: "",
    });
  };

  const openBulkModal = () => {
    setBulkData("");
    setBulkPreview([]);
    setBulkErrors([]);
    setUploadFile(null);
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkData("");
    setBulkPreview([]);
    setBulkErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    const selectedItem = menuItems.find(item => item._id === itemId);
    if (selectedItem) {
      setFormData({
        ...formData,
        itemId: selectedItem._id,
        itemName: selectedItem.name,
        price: selectedItem.price,
      });
    }
  };

  const filteredBarcodes = barcodes.filter(b => {
    const matchesSearch = b.barcodeNumber.includes(searchTerm) || 
                         b.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeBarcodes = barcodes.filter(b => b.status === "active").length;
  const inactiveBarcodes = barcodes.filter(b => b.status === "inactive").length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading barcodes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Barcode Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage barcodes for direct billing and quick item lookup</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openBulkModal}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Upload size={16} />
                Bulk Import
              </button>
              <button
                onClick={exportToCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => openModal()}
                className="bg-[#a3e635] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add Barcode
              </button>
            </div>
          </div>

          {/* Barcode Scanner Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Barcode size={16} />
              Barcode Scanner
            </h3>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="flex-1 relative">
                <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan or enter barcode number..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-2"
              >
                <Barcode size={16} />
                Scan
              </button>
            </form>
            {scanMessage && (
              <div className={`mt-3 text-sm ${scanMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                {scanMessage}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by barcode number or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{barcodes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Barcodes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{activeBarcodes}</p>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{inactiveBarcodes}</p>
            <p className="text-xs text-gray-500 mt-1">Inactive</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{menuItems.length}</p>
            <p className="text-xs text-gray-500 mt-1">Linked Items</p>
          </div>
        </div>

        {/* Barcodes Table */}
        <div className="p-6">
          {filteredBarcodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">🏷️</div>
              <p className="text-gray-500 text-sm">No barcodes found</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-[#a3e635] hover:text-[#bef264] text-sm font-medium"
              >
                + Add your first barcode
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-xs text-gray-500">
                    <th className="px-4 py-3 text-left font-semibold">Barcode Number</th>
                    <th className="px-4 py-3 text-left font-semibold">Item Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBarcodes.map((barcode, idx) => (
                    <motion.tr
                      key={barcode._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono font-semibold text-gray-900">{barcode.barcodeNumber}</code>
                       </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{barcode.itemName}</p>
                       </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-green-600">₹{barcode.price}</p>
                       </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          barcode.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {barcode.status}
                        </span>
                        </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {new Date(barcode.createdAt).toLocaleDateString()}
                        </p>
                        </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => printBarcodeLabel(barcode)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Print Label"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => openModal(barcode)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteBarcode(barcode._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => toggleBarcodeStatus(barcode)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                              barcode.status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {barcode.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </div>
                        </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Barcode Modal */}
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
              className="bg-white rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingBarcode ? "Edit Barcode" : "Add New Barcode"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingBarcode ? "Update barcode information" : "Create a new barcode for quick billing"}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Menu Item *</label>
                  <select
                    value={formData.itemId}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition"
                  >
                    <option value="">Select an item</option>
                    {menuItems.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} - ₹{item.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Number *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcodeNumber}
                      onChange={(e) => setFormData({ ...formData, barcodeNumber: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition font-mono"
                      placeholder="Enter barcode number"
                    />
                    <button
                      type="button"
                      onClick={generateBarcodeNumber}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unique barcode number for this item</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635] transition"
                    placeholder="Additional notes about this barcode..."
                  />
                </div>

                {formData.itemId && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Selected Item:</p>
                    <p className="text-sm font-semibold text-gray-900">{formData.itemName}</p>
                    <p className="text-sm font-bold text-green-600">₹{formData.price}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={editingBarcode ? updateBarcode : createBarcode}
                  disabled={!formData.barcodeNumber || !formData.itemId}
                  className="flex-1 bg-[#a3e635] text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  {editingBarcode ? "Update Barcode" : "Create Barcode"}
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

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={closeBulkModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Bulk Import Barcodes</h2>
                  <p className="text-sm text-gray-500 mt-1">Import multiple barcodes using CSV file</p>
                </div>
                <button onClick={closeBulkModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">Instructions</h3>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• CSV file must have headers: <strong>barcode, itemName, price, status, notes</strong></li>
                        <li>• <strong>barcode</strong> - Unique barcode number (required)</li>
                        <li>• <strong>itemName</strong> - Must match existing menu item names exactly (required)</li>
                        <li>• <strong>price</strong> - Numeric value (required)</li>
                        <li>• <strong>status</strong> - "active" or "inactive" (optional, defaults to active)</li>
                        <li>• <strong>notes</strong> - Additional information (optional)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download Template */}
                <div>
                  <button
                    onClick={downloadTemplate}
                    className="text-[#a3e635] hover:text-[#bef264] text-sm font-medium flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Sample CSV Template
                  </button>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#a3e635] transition">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csvUpload"
                    />
                    <label
                      htmlFor="csvUpload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload size={32} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload CSV file</span>
                      <span className="text-xs text-gray-400">or drag and drop</span>
                    </label>
                  </div>
                </div>

                {/* Preview Section */}
                {bulkPreview.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Preview ({bulkPreview.length} items)
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Barcode</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Item Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bulkPreview.slice(0, 5).map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 font-mono text-xs">{item.barcodeNumber}</td>
                              <td className="px-3 py-2">{item.itemName}</td>
                              <td className="px-3 py-2">₹{item.price}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {bulkPreview.length > 5 && (
                            <tr>
                              <td colSpan="4" className="px-3 py-2 text-center text-xs text-gray-500">
                                and {bulkPreview.length - 5} more items...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Errors Section */}
                {bulkErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-2">Errors ({bulkErrors.length})</h3>
                        <ul className="text-xs text-red-800 space-y-1 max-h-32 overflow-y-auto">
                          {bulkErrors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkPreview.length === 0}
                    className="flex-1 bg-[#a3e635] text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    Import {bulkPreview.length} Barcodes
                  </button>
                  <button
                    onClick={closeBulkModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}