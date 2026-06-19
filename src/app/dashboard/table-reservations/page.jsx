"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import axios from "axios";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

const timeSlots = [
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM"
];

const occasions = ["Birthday", "Anniversary", "Business Dinner", "Date Night", "Casual Dining", "Family Gathering", "Other"];

// ─── KEY FIX: deterministic unique-key helper ────────────────────────────────
// The bug: when _id is undefined/null/empty-string every row gets key=""
// Fix: build a composite fallback that can never collide across rows
let _keyCounter = 0;
const _stableKeys = new WeakMap();
const getStableKey = (reservation, idx) => {
  // 1. Prefer MongoDB _id (most reliable)
  if (reservation._id && String(reservation._id).trim()) {
    return `id-${reservation._id}`;
  }
  // 2. reservationNumber (unique by schema)
  if (reservation.reservationNumber && String(reservation.reservationNumber).trim()) {
    return `rn-${reservation.reservationNumber}`;
  }
  // 3. Stable object-identity key (survives re-renders without creating new keys)
  if (!_stableKeys.has(reservation)) {
    _stableKeys.set(reservation, `obj-${++_keyCounter}`);
  }
  return _stableKeys.get(reservation);
};
// ─────────────────────────────────────────────────────────────────────────────

// Validation functions
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const validateGuests = (guests) => {
  const num = parseInt(guests);
  return !isNaN(num) && num >= 1 && num <= 20;
};

// ─── Clay design tokens (inline so no Tailwind config needed) ────────────────
const clay = {
  // Buttons
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    danger:
      "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue:
      "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    purple:
      "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6b21a8,0_8px_16px_rgba(168,85,247,0.35)] hover:shadow-[0_3px_0_#6b21a8,0_4px_8px_rgba(168,85,247,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  // Cards / panels
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  inputErr:
    "w-full px-3.5 py-2.5 bg-red-50 border-2 border-red-400 rounded-2xl focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)] transition-all",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
};

const statColors = [
  { label: "Total", key: "total", color: "#d1d5db", textColor: "text-gray-900" },
  { label: "Confirmed", key: "confirmed", color: "#86efac", textColor: "text-emerald-600" },
  { label: "Pending", key: "pending", color: "#fde68a", textColor: "text-amber-600" },
  { label: "Completed", key: "completed", color: "#93c5fd", textColor: "text-blue-600" },
  { label: "Cancelled", key: "cancelled", color: "#fca5a5", textColor: "text-red-500" },
  { label: "Today", key: "today", color: "#d8b4fe", textColor: "text-purple-600" },
];

// ─── Shared Modal Shell ───────────────────────────────────────────────────────
const ModalShell = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 16 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={clay.modal + " max-w-2xl w-full max-h-[92vh] overflow-y-auto"}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ─── Booking Modal ────────────────────────────────────────────────────────────
const BookingModal = ({ isOpen, onClose, onCreateBooking, bookingForm, setBookingForm, tables, availableTables, loadingTables }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const e = {};
    if (!bookingForm.customerName.trim()) e.customerName = "Customer name is required";
    if (!bookingForm.phone) e.phone = "Phone number is required";
    else if (!validatePhone(bookingForm.phone)) e.phone = "Please enter a valid 10-digit phone number";
    if (bookingForm.email && !validateEmail(bookingForm.email)) e.email = "Please enter a valid email address";
    if (!bookingForm.tableId) e.tableId = "Please select a table";
    if (!validateGuests(bookingForm.guests)) e.guests = "Guests must be between 1 and 20";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (!isOpen) return null;

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );

  return (
    <ModalShell onClose={onClose}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">New Reservation</h2>
          <p className="text-sm text-gray-400 mt-0.5">Book a table for your customer</p>
        </div>
        <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer Name *" error={errors.customerName}>
            <input type="text" value={bookingForm.customerName}
              onChange={(e) => { setBookingForm({ ...bookingForm, customerName: e.target.value }); if (errors.customerName) setErrors({ ...errors, customerName: null }); }}
              className={errors.customerName ? clay.inputErr : clay.input} placeholder="Enter customer name" />
          </Field>
          <Field label="Phone Number *" error={errors.phone}>
            <input type="tel" value={bookingForm.phone}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setBookingForm({ ...bookingForm, phone: v }); if (errors.phone) setErrors({ ...errors, phone: null }); }}
              className={errors.phone ? clay.inputErr : clay.input} placeholder="10-digit mobile number" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" error={errors.email}>
            <input type="email" value={bookingForm.email}
              onChange={(e) => { setBookingForm({ ...bookingForm, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: null }); }}
              className={errors.email ? clay.inputErr : clay.input} placeholder="customer@example.com" />
          </Field>
          <Field label="Number of Guests *" error={errors.guests}>
            <input type="number" min="1" max="20" value={bookingForm.guests}
              onChange={(e) => { setBookingForm({ ...bookingForm, guests: e.target.value }); if (errors.guests) setErrors({ ...errors, guests: null }); }}
              className={errors.guests ? clay.inputErr : clay.input} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date *">
            <input type="date" value={bookingForm.date} min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              className={clay.input} />
          </Field>
          <Field label="Time *">
            <select value={bookingForm.time} onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} className={clay.input}>
              {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Table *" error={errors.tableId}>
            <select value={bookingForm.tableId}
              onChange={(e) => { setBookingForm({ ...bookingForm, tableId: e.target.value }); if (errors.tableId) setErrors({ ...errors, tableId: null }); }}
              className={errors.tableId ? clay.inputErr : clay.input} disabled={loadingTables}>
              <option value="">Select Table</option>
              {availableTables.map((table, idx) => (
                <option key={`avail-${table._id || idx}`} value={table._id}>
                  {table.name} (Cap: {table.capacity}) — {table.location || "General"}
                </option>
              ))}
            </select>
            {loadingTables && <p className="text-xs text-gray-400 mt-1">Loading tables…</p>}
            {!loadingTables && availableTables.length === 0 && <p className="text-xs text-red-500 mt-1">No tables available for selected date/time</p>}
          </Field>
          <Field label="Duration (Hours)">
            <select value={bookingForm.duration} onChange={(e) => setBookingForm({ ...bookingForm, duration: e.target.value })} className={clay.input}>
              {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Occasion">
          <select value={bookingForm.occasion} onChange={(e) => setBookingForm({ ...bookingForm, occasion: e.target.value })} className={clay.input}>
            <option value="">Select Occasion</option>
            {occasions.map(occ => <option key={occ} value={occ}>{occ}</option>)}
          </select>
        </Field>

        <Field label="Special Requests">
          <textarea value={bookingForm.specialRequests} onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
            rows={3} className={clay.input} placeholder="Any special requests or preferences…" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button onClick={() => { if (validateForm()) onCreateBooking(); }}
            disabled={availableTables.length === 0 || loadingTables}
            className={clay.btn.primary + " flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"}>
            Create Reservation
          </button>
          <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3"}>Cancel</button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
const RescheduleModal = ({ isOpen, onClose, onReschedule, reservation }) => {
  const [newDate, setNewDate] = useState(reservation?.date || "");
  const [newTime, setNewTime] = useState(reservation?.time || "");

  useEffect(() => {
    if (reservation) { setNewDate(reservation.date); setNewTime(reservation.time); }
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Reschedule Reservation</h2>
        <p className="text-sm text-gray-400 mt-0.5">{reservation.customerName} · {reservation.reservationNumber}</p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Date</label>
          <input type="date" value={newDate} min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNewDate(e.target.value)} className={clay.input} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Time</label>
          <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className={clay.input}>
            {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onReschedule(newDate, newTime)} className={clay.btn.primary + " flex-1 py-3"}>
            Confirm Reschedule
          </button>
          <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3"}>Cancel</button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({ isOpen, onClose, onCancel, reservation }) => {
  const [reason, setReason] = useState("");
  if (!isOpen || !reservation) return null;

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Cancel Reservation</h2>
        <p className="text-sm text-gray-400 mt-0.5">{reservation.customerName} · {reservation.reservationNumber}</p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cancellation Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            className={clay.input} placeholder="Please provide reason for cancellation…" />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onCancel(reason)} className={clay.btn.danger + " flex-1 py-3"}>
            Confirm Cancellation
          </button>
          <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3"}>Go Back</button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
const ViewDetailsModal = ({ isOpen, onClose, reservation }) => {
  if (!isOpen || !reservation) return null;

  const Row = ({ label, value, badge }) => (
    <div className="bg-gray-50 rounded-2xl px-4 py-3">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      {badge ? badge : <p className="text-sm font-semibold text-gray-800">{value || "N/A"}</p>}
    </div>
  );

  const statusColors = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
          <p className="text-sm text-gray-400 mt-0.5">{reservation.reservationNumber}</p>
        </div>
        <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-3">
        <Row label="Customer Name" value={reservation.customerName} />
        <Row label="Phone" value={reservation.phone} />
        <Row label="Email" value={reservation.email} />
        <Row label="Guests" value={reservation.guests} />
        <Row label="Table" value={reservation.tableName} />
        <Row label="Status" badge={
          <span className={`inline-flex mt-1 px-2.5 py-1 rounded-xl text-xs font-bold ${statusColors[reservation.status] || "bg-gray-100 text-gray-600"}`}>
            {reservation.status}
          </span>
        } />
        <Row label="Date" value={reservation.date} />
        <Row label="Time" value={reservation.time} />
        <Row label="Duration" value={`${reservation.duration} hour${reservation.duration !== 1 ? "s" : ""}`} />
        <Row label="Occasion" value={reservation.occasion} />
        {reservation.specialRequests && (
          <div className="col-span-2 bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Special Requests</p>
            <p className="text-sm text-gray-700">{reservation.specialRequests}</p>
          </div>
        )}
        {reservation.cancellationReason && (
          <div className="col-span-2 bg-red-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-0.5">Cancellation Reason</p>
            <p className="text-sm text-red-600">{reservation.cancellationReason}</p>
          </div>
        )}
        <div className="col-span-2 pt-2">
          <button onClick={onClose} className={clay.btn.secondary + " w-full py-3"}>Close</button>
        </div>
      </div>
    </ModalShell>
  );
};

// ─── Status Badge (claymorphic pill) ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    confirmed: "bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]",
    pending:   "bg-amber-100  text-amber-700  shadow-[0_2px_0_#fcd34d]",
    cancelled: "bg-red-100    text-red-600    shadow-[0_2px_0_#fca5a5]",
    completed: "bg-blue-100   text-blue-700   shadow-[0_2px_0_#93c5fd]",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, today: 0 });
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [storeId, setStoreId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getStoreIdFromStorage = () => {
    const storeDataStr = localStorage.getItem("storeData");
    if (storeDataStr) {
      try {
        const storeData = JSON.parse(storeDataStr);
        const id = storeData.id || storeData._id;
        if (id) { setStoreId(id); return id; }
      } catch (e) { console.error("Error parsing storeData:", e); }
    }
    const directStoreId = localStorage.getItem("storeId");
    if (directStoreId) { setStoreId(directStoreId); return directStoreId; }
    return null;
  };

  const fetchReservations = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;
    try {
      const params = new URLSearchParams();
      params.append("storeId", currentStoreId);
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (activeTab === "today") params.append("date", selectedDate);
      const response = await axios.get(`${API_URL}/api/reservations/?${params.toString()}`);
      if (response.data.success) setReservations(response.data.reservations);
    } catch (error) { console.error("Error fetching reservations:", error); }
  };

  const fetchStats = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;
    try {
      const response = await axios.get(`${API_URL}/api/reservations/stats/${currentStoreId}`);
      if (response.data.success) setStats(response.data.stats);
    } catch (error) { console.error("Error fetching stats:", error); }
  };

  const fetchTables = async () => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId) return;
    try {
      const response = await axios.get(`${API_URL}/api/tables/${currentStoreId}`);
      if (response.data.success) setTables(response.data.tables);
    } catch (error) { console.error("Error fetching tables:", error); }
  };

  const fetchAvailableTables = async (date, time) => {
    const currentStoreId = getStoreIdFromStorage();
    if (!currentStoreId || !date || !time) return;
    setLoadingTables(true);
    try {
      const response = await axios.get(`${API_URL}/api/reservations/available-tables`, {
        params: { storeId: currentStoreId, date, time }
      });
      if (response.data.success) setAvailableTables(response.data.tables);
    } catch (error) { console.error("Error fetching available tables:", error); }
    finally { setLoadingTables(false); }
  };

  const [bookingForm, setBookingForm] = useState({
    customerName: "", phone: "", email: "", tableId: "",
    date: new Date().toISOString().split("T")[0],
    time: "07:00 PM", duration: 2, guests: 2,
    occasion: "", specialRequests: "", bookingSource: "Online"
  });

  useEffect(() => {
    if (showBookingModal && bookingForm.date && bookingForm.time)
      fetchAvailableTables(bookingForm.date, bookingForm.time);
  }, [bookingForm.date, bookingForm.time, showBookingModal]);

  useEffect(() => {
    getStoreIdFromStorage();
    Promise.all([fetchReservations(), fetchStats(), fetchTables()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (storeId) { fetchReservations(); fetchStats(); }
  }, [activeTab, searchTerm, filterStatus, selectedDate, storeId]);

  // ── FIXED: deduplicate with getStableKey ──────────────────────────────────
  const getFilteredReservations = () => {
    let filtered = [...reservations];
    if (activeTab === "upcoming") filtered = filtered.filter(r => r.status !== "cancelled" && r.status !== "completed");
    else if (activeTab === "today") filtered = filtered.filter(r => r.date === selectedDate && r.status !== "cancelled");

    // Deduplicate: prefer rows where _id exists; fall back to composite
    const seen = new Set();
    return filtered.filter(res => {
      const key = getStableKey(res, -1);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const resetBookingForm = () => setBookingForm({
    customerName: "", phone: "", email: "", tableId: "",
    date: new Date().toISOString().split("T")[0],
    time: "07:00 PM", duration: 2, guests: 2,
    occasion: "", specialRequests: "", bookingSource: "Online"
  });

  const createBooking = async () => {
    if (!bookingForm.customerName || !bookingForm.phone || !bookingForm.tableId) {
      alert("Please fill all required fields"); return;
    }
    const currentStoreId = getStoreIdFromStorage();
    const selectedTable = tables.find(t => t._id === bookingForm.tableId);
    try {
      const response = await axios.post(`${API_URL}/api/reservations/`, {
        storeId: currentStoreId, customerName: bookingForm.customerName, phone: bookingForm.phone,
        email: bookingForm.email, tableId: bookingForm.tableId, tableName: selectedTable.name,
        date: bookingForm.date, time: bookingForm.time, duration: parseInt(bookingForm.duration),
        guests: parseInt(bookingForm.guests), occasion: bookingForm.occasion,
        specialRequests: bookingForm.specialRequests, bookingSource: bookingForm.bookingSource, status: "confirmed"
      });
      if (response.data.success) {
        await fetchReservations(); await fetchStats();
        setShowBookingModal(false); resetBookingForm();
        alert("Reservation created successfully!");
      }
    } catch (error) { alert(error.response?.data?.message || "Failed to create reservation"); }
  };

  const approveReservation = async (id) => {
    try {
      const r = await axios.put(`${API_URL}/api/reservations/approve/${id}`);
      if (r.data.success) { await fetchReservations(); await fetchStats(); }
    } catch { alert("Failed to approve reservation"); }
  };

  const rescheduleReservation = async (newDate, newTime) => {
    if (!newDate || !newTime) return;
    try {
      const r = await axios.put(`${API_URL}/api/reservations/reschedule/${selectedReservation._id}`, { date: newDate, time: newTime });
      if (r.data.success) { await fetchReservations(); await fetchStats(); setShowRescheduleModal(false); setSelectedReservation(null); }
    } catch { alert("Failed to reschedule reservation"); }
  };

  const cancelReservation = async (reason) => {
    try {
      const r = await axios.put(`${API_URL}/api/reservations/cancel/${selectedReservation._id}`, { reason });
      if (r.data.success) { await fetchReservations(); await fetchStats(); setShowCancelModal(false); setSelectedReservation(null); }
    } catch { alert("Failed to cancel reservation"); }
  };

  const completeReservation = async (id) => {
    try {
      const r = await axios.put(`${API_URL}/api/reservations/complete/${id}`);
      if (r.data.success) { await fetchReservations(); await fetchStats(); }
    } catch { alert("Failed to complete reservation"); }
  };

  const filteredReservations = getFilteredReservations();
  const todayCount = reservations.filter(r => r.date === selectedDate && r.status !== "cancelled").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading reservations…</p>
        </div>
      </div>
    );
  }

  const tabBtn = (tab, label) => (
    <button onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150 ${
        activeTab === tab
          ? "bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00] translate-y-0 hover:translate-y-[1px] hover:shadow-[0_3px_0_#6aaa00]"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-[0_3px_0_#d1d5db] hover:translate-y-[1px] hover:shadow-[0_2px_0_#d1d5db]"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} hotels={hotels} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Table Reservations</h1>
              <p className="text-gray-400 text-sm mt-1">Manage all table bookings and reservations</p>
            </div>
            <button onClick={() => setShowBookingModal(true)}
              className={clay.btn.primary + " px-6 py-3 text-sm"}>
              + New Reservation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            {statColors.map(({ label, key, color, textColor }) => (
              <div key={key} className={clay.statCard(color)}>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-semibold mt-1 ${textColor}`}>
                  {key === "today" ? todayCount : stats[key] ?? 0}
                </p>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className={clay.card + " mb-6"}>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search by customer name, reservation ID or phone…"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white transition-all" />
              </div>
            </div>

            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {tabBtn("upcoming", "Upcoming")}
                {tabBtn("today", "Today")}
                {tabBtn("all", "All Reservations")}
              </div>
              <div className="flex gap-2">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all">
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className={clay.card + " overflow-hidden"}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                    {["Reservation ID", "Customer", "Table", "Date & Time", "Guests", "Status", "Source", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-20">
                        <div className="text-5xl mb-3">📅</div>
                        <p className="text-gray-400 text-sm font-medium">No reservations found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation, idx) => {
                      // ── KEY FIX: use getStableKey, never empty string ──
                      const uniqueKey = getStableKey(reservation, idx);

                      return (
                        <motion.tr key={uniqueKey}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                          className="hover:bg-[#f9fff0] transition-colors group">

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-gray-800">{reservation.reservationNumber || "—"}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString() : ""}</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-gray-800">{reservation.customerName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{reservation.phone}</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 font-medium">{reservation.tableName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{reservation.guests} guests</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-800">{reservation.date}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{reservation.time} · {reservation.duration}h</p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex w-8 h-8 items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-700 shadow-[0_2px_0_#d1d5db]">
                              {reservation.guests}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={reservation.status} />
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-500">{reservation.bookingSource}</p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {reservation.status === "confirmed" && (<>
                                <button onClick={() => { setSelectedReservation(reservation); setShowRescheduleModal(true); }}
                                  className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-600 rounded-xl shadow-[0_2px_0_#93c5fd] hover:translate-y-[1px] hover:shadow-[0_1px_0_#93c5fd] transition-all">
                                  Reschedule
                                </button>
                                <button onClick={() => completeReservation(reservation._id)}
                                  className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-600 rounded-xl shadow-[0_2px_0_#d8b4fe] hover:translate-y-[1px] hover:shadow-[0_1px_0_#d8b4fe] transition-all">
                                  Complete
                                </button>
                                <button onClick={() => { setSelectedReservation(reservation); setShowCancelModal(true); }}
                                  className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-xl shadow-[0_2px_0_#fca5a5] hover:translate-y-[1px] hover:shadow-[0_1px_0_#fca5a5] transition-all">
                                  Cancel
                                </button>
                              </>)}

                              {reservation.status === "pending" && (<>
                                <button onClick={() => approveReservation(reservation._id)}
                                  className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-600 rounded-xl shadow-[0_2px_0_#6ee7b7] hover:translate-y-[1px] hover:shadow-[0_1px_0_#6ee7b7] transition-all">
                                  Approve
                                </button>
                                <button onClick={() => { setSelectedReservation(reservation); setShowCancelModal(true); }}
                                  className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-xl shadow-[0_2px_0_#fca5a5] hover:translate-y-[1px] hover:shadow-[0_1px_0_#fca5a5] transition-all">
                                  Reject
                                </button>
                              </>)}

                              <button onClick={() => { setSelectedReservation(reservation); setShowViewModal(true); }}
                                className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-xl shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] hover:shadow-[0_1px_0_#d1d5db] transition-all">
                                View
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal key="booking-modal"
            isOpen={showBookingModal} onClose={() => setShowBookingModal(false)}
            onCreateBooking={createBooking} bookingForm={bookingForm} setBookingForm={setBookingForm}
            tables={tables} availableTables={availableTables} loadingTables={loadingTables} />
        )}
        {showRescheduleModal && (
          <RescheduleModal key="reschedule-modal"
            isOpen={showRescheduleModal} onClose={() => { setShowRescheduleModal(false); setSelectedReservation(null); }}
            onReschedule={rescheduleReservation} reservation={selectedReservation} />
        )}
        {showCancelModal && (
          <CancelModal key="cancel-modal"
            isOpen={showCancelModal} onClose={() => { setShowCancelModal(false); setSelectedReservation(null); }}
            onCancel={cancelReservation} reservation={selectedReservation} />
        )}
        {showViewModal && (
          <ViewDetailsModal key="view-modal"
            isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedReservation(null); }}
            reservation={selectedReservation} />
        )}
      </AnimatePresence>
    </div>
  );
}