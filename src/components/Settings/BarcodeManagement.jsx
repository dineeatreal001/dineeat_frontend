"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, Barcode, Upload, Download, Printer, FileText, AlertCircle, Layers } from "lucide-react";
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
    purple:
      "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6d28d9,0_8px_16px_rgba(168,85,247,0.3)] hover:shadow-[0_3px_0_#6d28d9,0_4px_8px_rgba(168,85,247,0.3)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue:
      "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.3)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#047857,0_8px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_3px_0_#047857,0_4px_8px_rgba(16,185,129,0.3)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  input:
    "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// JsBarcode CDN — loaded lazily into print windows so labels are real, scannable barcodes
const JSBARCODE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/JsBarcode/3.11.5/JsBarcode.all.min.js";

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

  // ─── Print a single barcode label ──────────────────────────────────────
  // Renders a real, scannable CODE128 barcode (via JsBarcode) sized for a
  // standard 50mm x 30mm thermal/adhesive label.
  const printBarcodeLabel = (barcode) => {
    const printWindow = window.open('', '_blank', 'width=420,height=340');
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Label - ${barcode.itemName}</title>
          <script src="${JSBARCODE_CDN}"></script>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: 50mm;
              height: 30mm;
              font-family: Arial, Helvetica, sans-serif;
              background: #fff;
            }
            .label {
              width: 50mm;
              height: 30mm;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .item-name {
              font-size: 8px;
              font-weight: 700;
              max-width: 46mm;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: 1mm;
            }
            svg {
              width: 44mm;
              height: 15mm;
            }
            .price {
              font-size: 9px;
              font-weight: 700;
              margin-top: 1mm;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="item-name">${barcode.itemName}</div>
            <svg id="barcode"></svg>
            <div class="price">₹${barcode.price}</div>
          </div>
          <script>
            window.onload = function () {
              try {
                JsBarcode("#barcode", "${barcode.barcodeNumber}", {
                  format: "CODE128",
                  width: 1.6,
                  height: 42,
                  displayValue: true,
                  fontSize: 10,
                  margin: 0,
                });
              } catch (e) {}
              setTimeout(function () { window.print(); }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ─── Print all active barcodes as a sheet of labels ───────────────────
  // 3-column grid of 50mm x 30mm labels on an A4 sheet, each with a real
  // scannable CODE128 barcode.
  const printMultipleLabels = () => {
    const selectedBarcodes = barcodes.filter(b => b.status === "active");
    if (selectedBarcodes.length === 0) {
      alert("No active barcodes to print");
      return;
    }

    let labelsHtml = "";
    let barcodeScripts = "";

    selectedBarcodes.forEach((barcode, idx) => {
      labelsHtml += `
        <div class="label">
          <div class="item-name">${barcode.itemName}</div>
          <svg id="barcode-${idx}"></svg>
          <div class="price">₹${barcode.price}</div>
        </div>
      `;
      barcodeScripts += `
        try {
          JsBarcode("#barcode-${idx}", "${barcode.barcodeNumber}", {
            format: "CODE128",
            width: 1.3,
            height: 36,
            displayValue: true,
            fontSize: 9,
            margin: 0,
          });
        } catch (e) {}
      `;
    });

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Labels</title>
          <script src="${JSBARCODE_CDN}"></script>
          <style>
            @page { size: A4; margin: 10mm; }
            * { box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .labels-container {
              display: grid;
              grid-template-columns: repeat(3, 50mm);
              gap: 4mm;
            }
            .label {
              width: 50mm;
              height: 30mm;
              border: 1px dashed #ccc;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              page-break-inside: avoid;
            }
            .item-name {
              font-size: 7px;
              font-weight: 700;
              max-width: 46mm;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: 1mm;
            }
            svg {
              width: 44mm;
              height: 13mm;
            }
            .price {
              font-size: 8px;
              font-weight: 700;
              margin-top: 1mm;
            }
            @media print {
              .label { border: 1px dashed #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function () {
              ${barcodeScripts}
              setTimeout(function () { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      <div className={clay.card + " p-8 text-center"}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#a3e635] mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-medium">Loading barcodes...</p>
      </div>
    );
  }

  return (
    <>
      <div className={clay.card + " overflow-hidden"}>
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b-2 border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Barcode Management</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage barcodes for direct billing and quick item lookup</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={printMultipleLabels}
                className={clay.btn.green + " px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"}
                title="Print all active barcodes as a label sheet"
              >
                <Layers size={14} className="sm:w-4 sm:h-4" />
                <span>Print All Barcodes</span>
              </button>
              <button
                onClick={openBulkModal}
                className={clay.btn.purple + " px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"}
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <span>Bulk Import</span>
              </button>
              <button
                onClick={exportToCSV}
                className={clay.btn.blue + " px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"}
              >
                <Download size={14} className="sm:w-4 sm:h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => openModal()}
                className={clay.btn.primary + " px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"}
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span>Add Barcode</span>
              </button>
            </div>
          </div>

          {/* Barcode Scanner Section */}
          <div className="mt-4 p-3 sm:p-4 bg-[#f9fff0] rounded-2xl border-2 border-gray-100">
            <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Barcode size={16} className="text-[#6aaa00]" />
              Barcode Scanner
            </h3>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan or enter barcode number..."
                  className={clay.input + " pl-9 font-mono text-sm"}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className={clay.btn.primary + " px-4 py-2 text-xs sm:text-sm flex items-center justify-center gap-2"}
              >
                <Barcode size={16} />
                Scan
              </button>
            </form>
            {scanMessage && (
              <div className={`mt-3 text-xs sm:text-sm font-semibold ${scanMessage.includes("✅") ? "text-emerald-600" : "text-red-600"}`}>
                {scanMessage}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by barcode number or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={clay.input + " pl-9 text-sm"}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-6 bg-gray-50 border-b border-gray-100">
          <div className="text-center bg-white rounded-2xl p-3 shadow-[0_4px_0_#e5e7eb]">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{barcodes.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-3 shadow-[0_4px_0_#a7f3d0]">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{activeBarcodes}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Active</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-3 shadow-[0_4px_0_#e5e7eb]">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">{inactiveBarcodes}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Inactive</p>
          </div>
          <div className="text-center bg-white rounded-2xl p-3 shadow-[0_4px_0_#e9d5ff]">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{menuItems.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Linked Items</p>
          </div>
        </div>

        {/* Barcodes Table */}
        <div className="p-3 sm:p-6">
          {filteredBarcodes.length === 0 ? (
            <div className="text-center py-10 sm:py-12">
              <div className="text-5xl sm:text-6xl mb-3">🏷️</div>
              <p className="text-gray-400 text-sm font-medium">No barcodes found</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-[#a3e635] hover:text-[#84cc16] text-sm font-semibold transition"
              >
                + Add your first barcode
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr className="text-[10px] sm:text-xs text-gray-500">
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Barcode Number</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Item Name</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Price</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Created</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBarcodes.map((barcode, idx) => (
                    <motion.tr
                      key={barcode._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                      className="hover:bg-[#f9fff0] transition"
                    >
                      <td className="px-3 sm:px-4 py-3">
                        <code className="text-xs sm:text-sm font-mono font-semibold text-gray-900">{barcode.barcodeNumber}</code>
                       </td>
                      <td className="px-3 sm:px-4 py-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{barcode.itemName}</p>
                       </td>
                      <td className="px-3 sm:px-4 py-3">
                        <p className="text-xs sm:text-sm font-bold text-emerald-600">₹{barcode.price}</p>
                       </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-bold ${
                          barcode.status === "active"
                            ? "bg-emerald-100 text-emerald-700 shadow-[0_1px_0_#6ee7b7]"
                            : "bg-gray-100 text-gray-500 shadow-[0_1px_0_#d1d5db]"
                        }`}>
                          {barcode.status}
                        </span>
                        </td>
                      <td className="px-3 sm:px-4 py-3">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {new Date(barcode.createdAt).toLocaleDateString()}
                        </p>
                        </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => printBarcodeLabel(barcode)}
                            className="p-1.5 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition shadow-[0_1px_0_#d8b4fe] active:translate-y-[1px]"
                            title="Print Label"
                          >
                            <Printer size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={() => openModal(barcode)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition shadow-[0_1px_0_#93c5fd] active:translate-y-[1px]"
                            title="Edit"
                          >
                            <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBarcode(barcode._id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition shadow-[0_1px_0_#fca5a5] active:translate-y-[1px]"
                            title="Delete"
                          >
                            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleBarcodeStatus(barcode)}
                            className={`px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                              barcode.status === "active"
                                ? "bg-emerald-100 text-emerald-700 shadow-[0_1px_0_#6ee7b7] active:translate-y-[1px]"
                                : "bg-gray-100 text-gray-500 shadow-[0_1px_0_#d1d5db] active:translate-y-[1px]"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={clay.modal + " overflow-hidden"}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                      {editingBarcode ? "Edit Barcode" : "Add New Barcode"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                      {editingBarcode ? "Update barcode information" : "Create a new barcode for quick billing"}
                    </p>
                  </div>
                  <button onClick={closeModal} className="bg-gray-100 text-gray-600 rounded-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all flex-shrink-0">
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Select Menu Item *</label>
                    <select
                      value={formData.itemId}
                      onChange={(e) => handleItemSelect(e.target.value)}
                      className={clay.input + " text-sm"}
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
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Barcode Number *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.barcodeNumber}
                        onChange={(e) => setFormData({ ...formData, barcodeNumber: e.target.value })}
                        className={clay.input + " flex-1 font-mono text-sm"}
                        placeholder="Enter barcode number"
                      />
                      <button
                        type="button"
                        onClick={generateBarcodeNumber}
                        className={clay.btn.ghost + " px-3 py-2 text-xs sm:text-sm"}
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Unique barcode number for this item</p>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={clay.input + " text-sm"}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className={clay.input + " text-sm"}
                      placeholder="Additional notes about this barcode..."
                    />
                  </div>

                  {formData.itemId && (
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <p className="text-[10px] sm:text-xs text-gray-400">Selected Item:</p>
                      <p className="text-sm font-bold text-gray-900">{formData.itemName}</p>
                      <p className="text-sm font-bold text-emerald-600">₹{formData.price}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={editingBarcode ? updateBarcode : createBarcode}
                    disabled={!formData.barcodeNumber || !formData.itemId}
                    className={clay.btn.primary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"}
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    {editingBarcode ? "Update Barcode" : "Create Barcode"}
                  </button>
                  <button
                    onClick={closeModal}
                    className={clay.btn.secondary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm"}
                  >
                    Cancel
                  </button>
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={closeBulkModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={clay.modal + " overflow-hidden"}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Bulk Import Barcodes</h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Import multiple barcodes using CSV file</p>
                  </div>
                  <button onClick={closeBulkModal} className="bg-gray-100 text-gray-600 rounded-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all flex-shrink-0">
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-blue-900 mb-1">Instructions</h3>
                        <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1">
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
                      className="text-[#84cc16] hover:text-[#6aaa00] text-xs sm:text-sm font-semibold flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Sample CSV Template
                    </button>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upload CSV File</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#a3e635] transition bg-gray-50">
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
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Click to upload CSV file</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">or drag and drop</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Section */}
                  {bulkPreview.length > 0 && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">
                        Preview ({bulkPreview.length} items)
                      </h3>
                      <div className="overflow-x-auto border-2 border-gray-100 rounded-2xl">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Barcode</th>
                              <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Item Name</th>
                              <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Price</th>
                              <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bulkPreview.slice(0, 5).map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 font-mono text-xs">{item.barcodeNumber}</td>
                                <td className="px-3 py-2 text-xs sm:text-sm">{item.itemName}</td>
                                <td className="px-3 py-2 text-xs sm:text-sm">₹{item.price}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-bold ${
                                    item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {bulkPreview.length > 5 && (
                              <tr>
                                <td colSpan="4" className="px-3 py-2 text-center text-[10px] sm:text-xs text-gray-400">
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
                    <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-red-900 mb-2">Errors ({bulkErrors.length})</h3>
                          <ul className="text-[10px] sm:text-xs text-red-800 space-y-1 max-h-32 overflow-y-auto">
                            {bulkErrors.map((error, idx) => (
                              <li key={idx}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 sm:p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkPreview.length === 0}
                    className={clay.btn.primary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"}
                  >
                    <Upload size={14} className="sm:w-4 sm:h-4" />
                    Import {bulkPreview.length} Barcodes
                  </button>
                  <button
                    onClick={closeBulkModal}
                    className={clay.btn.secondary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm"}
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