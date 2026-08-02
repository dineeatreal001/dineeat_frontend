"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Printer, Settings, ChevronDown, ChevronUp, LayoutGrid, MapPin } from "lucide-react";
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
  },
  card: "bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80`,
  input:
    "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// Printer options
const printerOptions = [
  { id: "epson_tm20", name: "Epson TM-T20", type: "usb" },
  { id: "epson_tm88", name: "Epson TM-T88", type: "usb" },
  { id: "star_tsp100", name: "Star TSP100", type: "usb" },
  { id: "network_printer", name: "Network Printer", type: "network" },
  { id: "no_printer", name: "No Printer", type: "none" },
];

export default function TablesManagement({ storeId }) {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hall Modal States
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [hallFormData, setHallFormData] = useState({
    name: "",
    description: "",
    printerId: "no_printer",
    printerName: "No Printer",
    printKOT: true,
    printBill: true,
    allowReservations: true,
    allowWalkIn: true,
  });

  // Table Modal States
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableFormData, setTableFormData] = useState({
    name: "",
    capacity: 2,
    location: "",
    isActive: true,
  });

  // Hall Settings Modal
  const [showHallSettingsModal, setShowHallSettingsModal] = useState(false);
  const [settingsHall, setSettingsHall] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const HALLS_API = `${API_URL}/api/halls`;

  // ─── Fetch halls on mount / when storeId changes ─────────────────────────
  useEffect(() => {
    if (storeId) fetchHalls();
  }, [storeId]);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${HALLS_API}/${storeId}`);
      if (data.success) {
        setHalls(data.halls);
        // keep selectedHall in sync with fresh data (if it still exists)
        setSelectedHall((prev) => {
          if (!prev) return prev;
          const updated = data.halls.find((h) => h._id === prev._id);
          return updated || null;
        });
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to load halls");
    } finally {
      setLoading(false);
    }
  };

  // ─── Hall CRUD Operations ──────────────────────────────────────────────
  const createHall = async () => {
    if (!hallFormData.name) {
      alert("Please enter hall name");
      return;
    }

    const payload = {
      storeId,
      name: hallFormData.name,
      description: hallFormData.description,
      printerId: hallFormData.printerId,
      printerName:
        printerOptions.find((p) => p.id === hallFormData.printerId)?.name ||
        "No Printer",
      printKOT: hallFormData.printKOT,
      printBill: hallFormData.printBill,
      allowReservations: hallFormData.allowReservations,
      allowWalkIn: hallFormData.allowWalkIn,
    };

    try {
      setSaving(true);
      if (editingHall) {
        const { data } = await axios.put(
          `${HALLS_API}/${editingHall._id}`,
          payload
        );
        if (data.success) {
          setHalls((prev) =>
            prev.map((h) => (h._id === data.hall._id ? data.hall : h))
          );
          if (selectedHall?._id === data.hall._id) setSelectedHall(data.hall);
        }
      } else {
        const { data } = await axios.post(`${HALLS_API}/create`, payload);
        if (data.success) {
          setHalls((prev) => [...prev, data.hall]);
        }
      }
      closeHallModal();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to save hall");
    } finally {
      setSaving(false);
    }
  };

  const updateHallSettings = async () => {
    if (!settingsHall) return;

    try {
      setSaving(true);
      const { data } = await axios.put(`${HALLS_API}/${settingsHall._id}`, {
        printerId: settingsHall.printerId,
        printerName: settingsHall.printerName,
        printKOT: settingsHall.printKOT,
        printBill: settingsHall.printBill,
        allowReservations: settingsHall.allowReservations,
        allowWalkIn: settingsHall.allowWalkIn,
      });
      if (data.success) {
        setHalls((prev) =>
          prev.map((h) => (h._id === data.hall._id ? data.hall : h))
        );
        if (selectedHall?._id === data.hall._id) setSelectedHall(data.hall);
      }
      setShowHallSettingsModal(false);
      setSettingsHall(null);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const deleteHall = async (hallId) => {
    const hall = halls.find((h) => h._id === hallId);
    if (hall.tables.length > 0) {
      alert(
        `Cannot delete hall with ${hall.tables.length} tables. Please delete or move tables first.`
      );
      return;
    }

    if (confirm(`Are you sure you want to delete "${hall.name}" hall?`)) {
      try {
        const { data } = await axios.delete(`${HALLS_API}/${hallId}`);
        if (data.success) {
          setHalls((prev) => prev.filter((h) => h._id !== hallId));
          if (selectedHall?._id === hallId) {
            setSelectedHall(null);
          }
        }
      } catch (error) {
        console.log(error);
        alert(error?.response?.data?.message || "Failed to delete hall");
      }
    }
  };

  // ─── Table CRUD Operations ─────────────────────────────────────────────
  const createTable = async () => {
    if (!tableFormData.name) {
      alert("Please enter table name");
      return;
    }
    if (!selectedHall) return;

    const payload = {
      name: tableFormData.name,
      capacity: tableFormData.capacity,
      location: tableFormData.location,
      isActive: tableFormData.isActive,
    };

    try {
      setSaving(true);
      let data;
      if (editingTable) {
        ({ data } = await axios.put(
          `${HALLS_API}/${selectedHall._id}/tables/${editingTable._id}`,
          payload
        ));
      } else {
        ({ data } = await axios.post(
          `${HALLS_API}/${selectedHall._id}/tables`,
          payload
        ));
      }

      if (data.success) {
        setHalls((prev) =>
          prev.map((h) => (h._id === data.hall._id ? data.hall : h))
        );
        setSelectedHall(data.hall);
      }
      closeTableModal();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to save table");
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (tableId) => {
    if (!selectedHall) return;
    if (confirm("Are you sure you want to delete this table?")) {
      try {
        const { data } = await axios.delete(
          `${HALLS_API}/${selectedHall._id}/tables/${tableId}`
        );
        if (data.success) {
          setHalls((prev) =>
            prev.map((h) => (h._id === data.hall._id ? data.hall : h))
          );
          setSelectedHall(data.hall);
        }
      } catch (error) {
        console.log(error);
        alert(error?.response?.data?.message || "Failed to delete table");
      }
    }
  };

  const toggleTableStatus = async (tableId) => {
    if (!selectedHall) return;
    try {
      const { data } = await axios.put(
        `${HALLS_API}/${selectedHall._id}/tables/${tableId}/toggle`
      );
      if (data.success) {
        setHalls((prev) =>
          prev.map((h) => (h._id === data.hall._id ? data.hall : h))
        );
        setSelectedHall(data.hall);
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to update table status");
    }
  };

  // ─── Modal Handlers ─────────────────────────────────────────────────────
  const openHallModal = (hall = null) => {
    if (hall) {
      setEditingHall(hall);
      setHallFormData({
        name: hall.name,
        description: hall.description || "",
        printerId: hall.printerId || "no_printer",
        printKOT: hall.printKOT,
        printBill: hall.printBill,
        allowReservations: hall.allowReservations,
        allowWalkIn: hall.allowWalkIn,
      });
    } else {
      setEditingHall(null);
      setHallFormData({
        name: "",
        description: "",
        printerId: "no_printer",
        printKOT: true,
        printBill: true,
        allowReservations: true,
        allowWalkIn: true,
      });
    }
    setShowHallModal(true);
  };

  const closeHallModal = () => {
    setShowHallModal(false);
    setEditingHall(null);
    setHallFormData({
      name: "",
      description: "",
      printerId: "no_printer",
      printKOT: true,
      printBill: true,
      allowReservations: true,
      allowWalkIn: true,
    });
  };

  const openTableModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setTableFormData({
        name: table.name,
        capacity: table.capacity,
        location: table.location || "",
        isActive: table.isActive,
      });
    } else {
      setEditingTable(null);
      setTableFormData({
        name: "",
        capacity: 2,
        location: "",
        isActive: true,
      });
    }
    setShowTableModal(true);
  };

  const closeTableModal = () => {
    setShowTableModal(false);
    setEditingTable(null);
    setTableFormData({
      name: "",
      capacity: 2,
      location: "",
      isActive: true,
    });
  };

  const openHallSettings = (hall) => {
    setSettingsHall({ ...hall });
    setShowHallSettingsModal(true);
  };

  const updateSettingsField = (field, value) => {
    setSettingsHall((prev) => ({ ...prev, [field]: value }));
  };

  // Stats for selected hall
  const totalTables = selectedHall?.tables.length || 0;
  const activeTables = selectedHall?.tables.filter((t) => t.isActive).length || 0;
  const inactiveTables = selectedHall?.tables.filter((t) => !t.isActive).length || 0;

  return (
    <>
      <div className={clay.card + " overflow-hidden"}>
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b-2 border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Tables Management</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage halls, printers, and table configurations</p>
            </div>
            <button
              onClick={() => openHallModal()}
              className={clay.btn.primary + " px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center"}
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span>Add New Hall</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-400 text-sm font-medium">Loading halls...</p>
          </div>
        ) : halls.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-3">🏛️</div>
            <p className="text-gray-400 text-sm font-medium">No halls added yet</p>
            <button
              onClick={() => openHallModal()}
              className="mt-4 text-[#a3e635] hover:text-[#84cc16] text-sm font-semibold transition"
            >
              + Add your first hall
            </button>
          </div>
        ) : (
          <>
            {/* Halls Grid */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <LayoutGrid size={16} />
                Dining Halls / Sections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {halls.map((hall) => (
                  <motion.div
                    key={hall._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedHall(hall)}
                    className={`rounded-xl p-3 cursor-pointer transition-all border-2 ${
                      selectedHall?._id === hall._id
                        ? "border-[#a3e635] bg-[#f9fff0] shadow-[0_4px_0_#6aaa00]"
                        : "border-gray-200 bg-white shadow-[0_4px_0_#e5e7eb] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏛️</span>
                          <h4 className="font-bold text-gray-800">{hall.name}</h4>
                        </div>
                        {hall.description && (
                          <p className="text-xs text-gray-400 mt-1">{hall.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            🪑 {hall.tables.length} tables
                          </span>
                          <span className="text-xs text-gray-500">
                            🖨️ {hall.printerName}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openHallSettings(hall)}
                          className="p-1.5 text-purple-600 bg-purple-50 rounded-lg shadow-[0_1px_0_#d8b4fe] active:translate-y-[1px] transition-all"
                        >
                          <Settings size={12} />
                        </button>
                        <button
                          onClick={() => openHallModal(hall)}
                          className="p-1.5 text-blue-600 bg-blue-50 rounded-lg shadow-[0_1px_0_#93c5fd] active:translate-y-[1px] transition-all"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteHall(hall._id)}
                          className="p-1.5 text-red-600 bg-red-50 rounded-lg shadow-[0_1px_0_#fca5a5] active:translate-y-[1px] transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Hall Details */}
            {selectedHall && (
              <>
                {/* Hall Info Bar */}
                <div className="px-4 py-3 sm:px-6 bg-[#f9fff0] border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} className="text-[#a3e635]" />
                      {selectedHall.name} • {selectedHall.tables.length} Tables
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">🖨️ {selectedHall.printerName}</span>
                      {selectedHall.printKOT && <span className="flex items-center gap-1">✅ KOT Enabled</span>}
                      {selectedHall.printBill && <span className="flex items-center gap-1">✅ Bill Print Enabled</span>}
                      {selectedHall.allowReservations && <span className="flex items-center gap-1">📅 Reservations Allowed</span>}
                      {selectedHall.allowWalkIn && <span className="flex items-center gap-1">🚶 Walk-ins Allowed</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => openTableModal()}
                    className={clay.btn.primary + " px-3 py-1.5 text-xs flex items-center gap-1"}
                  >
                    <Plus size={12} />
                    Add Table to {selectedHall.name}
                  </button>
                </div>

                {/* Stats for selected hall */}
                <div className="grid grid-cols-3 gap-2 p-3 sm:p-6 bg-gray-50 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{totalTables}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Total Tables</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{activeTables}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">{inactiveTables}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Inactive</p>
                  </div>
                </div>

                {/* Tables Grid */}
                <div className="p-3 sm:p-6">
                  {selectedHall.tables.length === 0 ? (
                    <div className="text-center py-10 sm:py-12">
                      <div className="text-4xl sm:text-5xl mb-3">🪑</div>
                      <p className="text-gray-400 text-sm font-medium">No tables in this hall</p>
                      <button
                        onClick={() => openTableModal()}
                        className="mt-4 text-[#a3e635] hover:text-[#84cc16] text-sm font-semibold transition"
                      >
                        + Add your first table to {selectedHall.name}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {selectedHall.tables.map((table, idx) => (
                        <motion.div
                          key={table._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                          className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-200 w-full ${
                            table.isActive
                              ? "bg-white shadow-[0_4px_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.05)] border border-white/80"
                              : "bg-gray-50 border border-gray-100 opacity-60"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{table.name}</h3>
                                <span className={`inline-flex px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-bold ${
                                  table.isActive
                                    ? "bg-emerald-100 text-emerald-700 shadow-[0_1px_0_#6ee7b7]"
                                    : "bg-gray-100 text-gray-500 shadow-[0_1px_0_#d1d5db]"
                                }`}>
                                  {table.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              {table.location && (
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">📍 {table.location}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => openTableModal(table)}
                                className="p-1.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition shadow-[0_1px_0_#93c5fd] active:translate-y-[1px]"
                              >
                                <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTable(table._id)}
                                className="p-1.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition shadow-[0_1px_0_#fca5a5] active:translate-y-[1px]"
                              >
                                <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase">Capacity:</span>
                              <span className="inline-flex w-6 h-6 sm:w-7 sm:h-7 items-center justify-center rounded-xl bg-gray-100 text-xs sm:text-sm font-bold text-gray-700 shadow-[0_1px_0_#d1d5db]">
                                {table.capacity}
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-500">guests</span>
                            </div>
                            <button
                              onClick={() => toggleTableStatus(table._id)}
                              className={`px-2 py-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                                table.isActive
                                  ? "bg-emerald-100 text-emerald-700 shadow-[0_1px_0_#6ee7b7] active:translate-y-[1px]"
                                  : "bg-gray-100 text-gray-500 shadow-[0_1px_0_#d1d5db] active:translate-y-[1px]"
                              }`}
                            >
                              {table.isActive ? "✓ Active" : "✗ Inactive"}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Hall Modal */}
      <AnimatePresence>
        {showHallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={closeHallModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={clay.modal + " overflow-hidden"}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                      {editingHall ? "Edit Hall" : "Add New Hall"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                      {editingHall ? "Update hall information" : "Create a new dining hall or section"}
                    </p>
                  </div>
                  <button onClick={closeHallModal} className="bg-gray-100 text-gray-600 rounded-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all flex-shrink-0">
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hall Name *</label>
                    <input
                      type="text"
                      value={hallFormData.name}
                      onChange={(e) => setHallFormData({ ...hallFormData, name: e.target.value })}
                      className={clay.input + " text-sm"}
                      placeholder="e.g., Ground Floor, First Floor, Terrace"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                    <input
                      type="text"
                      value={hallFormData.description}
                      onChange={(e) => setHallFormData({ ...hallFormData, description: e.target.value })}
                      className={clay.input + " text-sm"}
                      placeholder="e.g., Main dining area with garden view"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Printer Selection</label>
                    <select
                      value={hallFormData.printerId}
                      onChange={(e) => setHallFormData({ ...hallFormData, printerId: e.target.value })}
                      className={clay.input + " text-sm"}
                    >
                      {printerOptions.map(printer => (
                        <option key={printer.id} value={printer.id}>{printer.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-600 mb-2">Printer Permissions</p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Print KOT (Kitchen Order Ticket)</span>
                      <input
                        type="checkbox"
                        checked={hallFormData.printKOT}
                        onChange={(e) => setHallFormData({ ...hallFormData, printKOT: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Print Bill / Receipt</span>
                      <input
                        type="checkbox"
                        checked={hallFormData.printBill}
                        onChange={(e) => setHallFormData({ ...hallFormData, printBill: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-600 mb-2">Hall Permissions</p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Allow Table Reservations</span>
                      <input
                        type="checkbox"
                        checked={hallFormData.allowReservations}
                        onChange={(e) => setHallFormData({ ...hallFormData, allowReservations: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Allow Walk-in Customers</span>
                      <input
                        type="checkbox"
                        checked={hallFormData.allowWalkIn}
                        onChange={(e) => setHallFormData({ ...hallFormData, allowWalkIn: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={createHall}
                    disabled={saving}
                    className={clay.btn.primary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"}
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    {editingHall ? "Update Hall" : "Create Hall"}
                  </button>
                  <button
                    onClick={closeHallModal}
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

      {/* Add/Edit Table Modal */}
      <AnimatePresence>
        {showTableModal && selectedHall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={closeTableModal}
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
                      {editingTable ? "Edit Table" : "Add New Table"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                      {editingTable ? "Update table information" : `Add table to ${selectedHall.name}`}
                    </p>
                  </div>
                  <button onClick={closeTableModal} className="bg-gray-100 text-gray-600 rounded-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all flex-shrink-0">
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Table Name *</label>
                    <input
                      type="text"
                      value={tableFormData.name}
                      onChange={(e) => setTableFormData({ ...tableFormData, name: e.target.value })}
                      className={clay.input + " text-sm"}
                      placeholder="e.g., Table 1, Window Seat"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={tableFormData.capacity}
                      onChange={(e) => setTableFormData({ ...tableFormData, capacity: parseInt(e.target.value) || 1 })}
                      className={clay.input + " text-sm"}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location / Area</label>
                    <input
                      type="text"
                      value={tableFormData.location}
                      onChange={(e) => setTableFormData({ ...tableFormData, location: e.target.value })}
                      className={clay.input + " text-sm"}
                      placeholder="e.g., Window Side, Garden, VIP Area"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="tableActive"
                      checked={tableFormData.isActive}
                      onChange={(e) => setTableFormData({ ...tableFormData, isActive: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635] focus:ring-offset-0"
                    />
                    <label htmlFor="tableActive" className="text-xs sm:text-sm font-medium text-gray-700">
                      Table is active and available
                    </label>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={createTable}
                    disabled={saving}
                    className={clay.btn.primary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"}
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    {editingTable ? "Update Table" : "Create Table"}
                  </button>
                  <button
                    onClick={closeTableModal}
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

      {/* Hall Settings Modal */}
      <AnimatePresence>
        {showHallSettingsModal && settingsHall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowHallSettingsModal(false)}
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
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Hall Settings</h2>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{settingsHall.name}</p>
                  </div>
                  <button onClick={() => setShowHallSettingsModal(false)} className="bg-gray-100 text-gray-600 rounded-xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all flex-shrink-0">
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Printer</label>
                    <select
                      value={settingsHall.printerId}
                      onChange={(e) => {
                        const printer = printerOptions.find(p => p.id === e.target.value);
                        updateSettingsField("printerId", e.target.value);
                        updateSettingsField("printerName", printer?.name || "No Printer");
                      }}
                      className={clay.input + " text-sm"}
                    >
                      {printerOptions.map(printer => (
                        <option key={printer.id} value={printer.id}>{printer.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-600 mb-2">Printer Permissions</p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Print KOT</span>
                      <input
                        type="checkbox"
                        checked={settingsHall.printKOT}
                        onChange={(e) => updateSettingsField("printKOT", e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Print Bill</span>
                      <input
                        type="checkbox"
                        checked={settingsHall.printBill}
                        onChange={(e) => updateSettingsField("printBill", e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-600 mb-2">Hall Permissions</p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Allow Reservations</span>
                      <input
                        type="checkbox"
                        checked={settingsHall.allowReservations}
                        onChange={(e) => updateSettingsField("allowReservations", e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">Allow Walk-ins</span>
                      <input
                        type="checkbox"
                        checked={settingsHall.allowWalkIn}
                        onChange={(e) => updateSettingsField("allowWalkIn", e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={updateHallSettings}
                    disabled={saving}
                    className={clay.btn.primary + " flex-1 py-2.5 sm:py-3 text-xs sm:text-sm disabled:opacity-60"}
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowHallSettingsModal(false)}
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