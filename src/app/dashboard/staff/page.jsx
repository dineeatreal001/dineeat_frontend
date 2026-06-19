"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    danger:
      "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-4 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

// Staff roles and permissions
const roles = [
  { 
    id: "admin", 
    name: "Admin", 
    icon: "👑", 
    color: "purple",
    permissions: ["all_access", "manage_staff", "manage_hotels", "view_reports", "manage_inventory", "manage_orders", "manage_kot", "manage_billing", "view_analytics"]
  },
  { 
    id: "manager", 
    name: "Manager", 
    icon: "📊", 
    color: "blue",
    permissions: ["view_reports", "manage_inventory", "manage_orders", "manage_kot", "manage_billing", "view_analytics", "manage_staff"]
  },
  { 
    id: "cashier", 
    name: "Cashier", 
    icon: "💰", 
    color: "green",
    permissions: ["manage_billing", "process_payments", "view_orders", "print_receipts", "handle_refunds"]
  },
  { 
    id: "waiter", 
    name: "Waiter", 
    icon: "🍽️", 
    color: "orange",
    permissions: ["take_orders", "view_kot", "manage_tables", "call_waiter", "split_bill"]
  },
  { 
    id: "kitchen_staff", 
    name: "Kitchen Staff", 
    icon: "👨‍🍳", 
    color: "red",
    permissions: ["view_kot", "update_kot_status", "view_orders", "manage_inventory"]
  },
  { 
    id: "delivery_partner", 
    name: "Delivery Partner", 
    icon: "🛵", 
    color: "yellow",
    permissions: ["view_delivery_orders", "update_delivery_status", "view_customer_details"]
  },
];

// Sample staff data
const initialStaff = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@dineeat.com",
    phone: "+91 98765 43210",
    role: "admin",
    status: "active",
    joinDate: "2024-01-01",
    shift: "Morning",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43211",
    salary: 45000,
    permissions: ["all_access"]
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@dineeat.com",
    phone: "+91 98765 43211",
    role: "manager",
    status: "active",
    joinDate: "2024-01-15",
    shift: "Evening",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43212",
    salary: 35000,
    permissions: ["view_reports", "manage_inventory", "manage_orders", "manage_kot", "manage_billing", "view_analytics"]
  },
  {
    id: 3,
    name: "Amit Singh",
    email: "amit@dineeat.com",
    phone: "+91 98765 43212",
    role: "waiter",
    status: "active",
    joinDate: "2024-02-01",
    shift: "Morning",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43213",
    salary: 18000,
    assignedTables: [1, 2, 3, 4],
    permissions: ["take_orders", "view_kot", "manage_tables", "call_waiter", "split_bill"]
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "neha@dineeat.com",
    phone: "+91 98765 43213",
    role: "cashier",
    status: "active",
    joinDate: "2024-02-10",
    shift: "Evening",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43214",
    salary: 22000,
    permissions: ["manage_billing", "process_payments", "view_orders", "print_receipts", "handle_refunds"]
  },
  {
    id: 5,
    name: "Vikram Mehta",
    email: "vikram@dineeat.com",
    phone: "+91 98765 43214",
    role: "kitchen_staff",
    status: "active",
    joinDate: "2024-02-15",
    shift: "Morning",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43215",
    salary: 20000,
    permissions: ["view_kot", "update_kot_status", "view_orders", "manage_inventory"]
  },
  {
    id: 6,
    name: "Sanjay Patel",
    email: "sanjay@dineeat.com",
    phone: "+91 98765 43215",
    role: "waiter",
    status: "inactive",
    joinDate: "2024-01-20",
    shift: "Night",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43216",
    salary: 18000,
    assignedTables: [5, 6, 7, 8],
    permissions: ["take_orders", "view_kot", "manage_tables", "call_waiter", "split_bill"]
  },
  {
    id: 7,
    name: "Meera Joshi",
    email: "meera@dineeat.com",
    phone: "+91 98765 43216",
    role: "delivery_partner",
    status: "active",
    joinDate: "2024-03-01",
    shift: "Evening",
    address: "Mumbai, India",
    emergencyContact: "+91 98765 43217",
    salary: 15000,
    permissions: ["view_delivery_orders", "update_delivery_status", "view_customer_details"]
  },
];

// Attendance data
const attendanceData = [
  { id: 1, staffId: 1, date: "2024-01-20", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "present" },
  { id: 2, staffId: 2, date: "2024-01-20", checkIn: "02:00 PM", checkOut: "10:00 PM", status: "present" },
  { id: 3, staffId: 3, date: "2024-01-20", checkIn: "09:15 AM", checkOut: "05:45 PM", status: "present" },
  { id: 4, staffId: 4, date: "2024-01-20", checkIn: "02:30 PM", checkOut: "10:30 PM", status: "late" },
  { id: 5, staffId: 5, date: "2024-01-20", checkIn: "09:00 AM", checkOut: null, status: "present" },
];

// Leave requests
const leaveRequests = [
  { id: 1, staffId: 3, staffName: "Amit Singh", fromDate: "2024-01-25", toDate: "2024-01-27", reason: "Family function", status: "pending" },
  { id: 2, staffId: 4, staffName: "Neha Gupta", fromDate: "2024-01-28", toDate: "2024-01-29", reason: "Medical emergency", status: "approved" },
];

// AddStaffModal Component
const AddStaffModal = ({ isOpen, onClose, onAdd, formData, setFormData, roles }) => {
  if (!isOpen) return null;

  return (
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
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Staff Member</h2>
            <p className="text-sm text-gray-400 mt-0.5">Create a new staff account with role-based access</p>
          </div>
          <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={clay.input} placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={clay.input} placeholder="staff@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={clay.input} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role *</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className={clay.input}>
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.icon} {role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Shift</label>
              <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className={clay.input}>
                <option value="Morning">Morning (9 AM - 6 PM)</option>
                <option value="Evening">Evening (2 PM - 11 PM)</option>
                <option value="Night">Night (11 PM - 8 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Salary (₹/month)</label>
              <input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className={clay.input} placeholder="Enter salary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Emergency Contact Number</label>
            <input type="tel" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} className={clay.input} placeholder="Emergency contact number" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className={clay.input} placeholder="Full address" />
          </div>

          {formData.role && (
            <div className="bg-blue-50 rounded-2xl p-4 shadow-[0_2px_0_#93c5fd]">
              <p className="text-sm font-bold text-blue-800 mb-2">Default Permissions for {roles.find(r => r.id === formData.role)?.name}:</p>
              <div className="flex flex-wrap gap-2">
                {roles.find(r => r.id === formData.role)?.permissions.slice(0, 5).map(perm => (
                  <span key={perm} className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-xl shadow-[0_1px_0_#93c5fd]">✓ {perm.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onAdd} className={clay.btn.primary + " flex-1 py-3 text-sm"}>Add Staff Member</button>
            <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// PermissionsModal Component
const PermissionsModal = ({ isOpen, onClose, onSave, staff, roles }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(staff?.permissions || []);
  const rolePermissions = roles.find(r => r.id === staff?.role)?.permissions || [];

  if (!isOpen || !staff) return null;

  const togglePermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  return (
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
        className={clay.modal + " max-w-2xl w-full"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Permissions</h2>
            <p className="text-sm text-gray-400 mt-0.5">{staff.name} - {staff.role}</p>
          </div>
          <button onClick={onClose} className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}>×</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {rolePermissions.map(permission => (
              <label key={permission} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 shadow-[0_2px_0_#e5e7eb] transition-all">
                <input type="checkbox" checked={selectedPermissions.includes(permission)} onChange={() => togglePermission(permission)} className="w-4 h-4 text-[#a3e635] rounded" />
                <span className="text-sm font-medium text-gray-700 capitalize">{permission.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => onSave(staff.id, selectedPermissions)} className={clay.btn.primary + " flex-1 py-3 text-sm"}>Save Permissions</button>
            <button onClick={onClose} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]",
    inactive: "bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]",
    leave: "bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]",
  };
  return <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold capitalize ${styles[status] || styles.active}`}>{status}</span>;
};

// Role Badge Component
const RoleBadge = ({ roleId }) => {
  const role = roles.find(r => r.id === roleId);
  const colorMap = {
    purple: "bg-purple-100 text-purple-700 shadow-[0_2px_0_#d8b4fe]",
    blue: "bg-blue-100 text-blue-700 shadow-[0_2px_0_#93c5fd]",
    green: "bg-green-100 text-green-700 shadow-[0_2px_0_#86efac]",
    orange: "bg-orange-100 text-orange-700 shadow-[0_2px_0_#fdba74]",
    red: "bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]",
    yellow: "bg-yellow-100 text-yellow-700 shadow-[0_2px_0_#fde68a]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-bold ${colorMap[role?.color] || "bg-gray-100 text-gray-700 shadow-[0_2px_0_#d1d5db]"}`}>
      <span>{role?.icon}</span> {role?.name}
    </span>
  );
};

export default function StaffPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [staff, setStaff] = useState(initialStaff);
  const [activeTab, setActiveTab] = useState("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", role: "", shift: "Morning", salary: "", address: "", emergencyContact: ""
  });

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const addStaff = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      alert("Please fill all required fields");
      return;
    }

    const roleData = roles.find(r => r.id === formData.role);
    
    const newStaff = {
      id: staff.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      shift: formData.shift,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      salary: parseFloat(formData.salary) || 0,
      permissions: roleData?.permissions || []
    };

    setStaff([newStaff, ...staff]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", phone: "", role: "", shift: "Morning", salary: "", address: "", emergencyContact: "" });
  };

  const updateStaffStatus = (id, newStatus) => {
    setStaff(staff.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
  };

  const updateStaffPermissions = (staffId, permissions) => {
    setStaff(staff.map(member => 
      member.id === staffId ? { ...member, permissions: permissions } : member
    ));
    setShowPermissionsModal(false);
    setSelectedStaff(null);
  };

  const deleteStaff = (id) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setStaff(staff.filter(member => member.id !== id));
    }
  };

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === "active").length,
    inactive: staff.filter(s => s.status === "inactive").length,
    onLeave: staff.filter(s => s.status === "leave").length,
    present: attendanceData.filter(a => a.status === "present").length,
  };

  const statColors = [
    { label: "Total Staff", key: "total", color: "#93c5fd", textColor: "text-blue-600", icon: "👥", value: stats.total },
    { label: "Active", key: "active", color: "#86efac", textColor: "text-green-600", icon: "✅", value: stats.active },
    { label: "Present Today", key: "present", color: "#d8b4fe", textColor: "text-purple-600", icon: "📋", value: stats.present },
    { label: "On Leave", key: "leave", color: "#fdba74", textColor: "text-orange-600", icon: "🏖️", value: stats.onLeave },
  ];

  // Staff List Tab
  const StaffListTab = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search staff by name, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={clay.input + " pl-10"} />
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className={clay.btn.primary + " px-5 py-2.5 text-sm"}>+ Add Staff</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-4 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer">
          <option value="all">📋 All Roles</option>
          {roles.map(role => <option key={role.id} value={role.id}>{role.icon} {role.name}</option>)}
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all cursor-pointer">
          <option value="all">📊 All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">❌ Inactive</option>
          <option value="leave">🏖️ On Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.06)] border border-white/80 p-6 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#84cc16] flex items-center justify-center text-2xl font-bold text-gray-800 shadow-[0_4px_0_#4d7c00]">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{member.email}</p>
                </div>
              </div>
              <RoleBadge roleId={member.role} />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">📞 Phone:</span><span className="font-medium text-gray-700">{member.phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">⏰ Shift:</span><span className="font-medium text-gray-700">{member.shift}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">📅 Join Date:</span><span className="font-medium text-gray-700">{member.joinDate}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">💰 Salary:</span><span className="font-medium text-green-600">₹{member.salary.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">📊 Status:</span><StatusBadge status={member.status} /></div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
              <button onClick={() => { setSelectedStaff(member); setShowPermissionsModal(true); }} className="flex-1 px-3 py-2 text-xs font-bold bg-purple-100 text-purple-600 rounded-xl shadow-[0_2px_0_#d8b4fe] hover:translate-y-[1px] hover:shadow-[0_1px_0_#d8b4fe] transition-all">🔑 Permissions</button>
              <button onClick={() => updateStaffStatus(member.id, member.status === 'active' ? 'inactive' : 'active')} className="flex-1 px-3 py-2 text-xs font-bold bg-amber-100 text-amber-700 rounded-xl shadow-[0_2px_0_#fde68a] hover:translate-y-[1px] hover:shadow-[0_1px_0_#fde68a] transition-all">{member.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}</button>
              <button onClick={() => deleteStaff(member.id)} className="px-3 py-2 text-xs font-bold bg-red-100 text-red-600 rounded-xl shadow-[0_2px_0_#fca5a5] hover:translate-y-[1px] hover:shadow-[0_1px_0_#fca5a5] transition-all">🗑️</button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredStaff.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-400 text-sm font-medium">No staff members found</p>
        </div>
      )}
    </div>
  );

  // Roles & Permissions Tab
  const RolesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role, idx) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.06)] border border-white/80 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-${role.color}-100 flex items-center justify-center text-3xl shadow-[0_4px_0_#d1d5db]`}>{role.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Role ID: {role.id}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map(perm => (
                <div key={perm} className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-xl shadow-[0_1px_0_#e5e7eb]">
                  <span className="text-green-500">✓</span> {perm.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Attendance Tab
  const AttendanceTab = () => (
    <div className={clay.card + " overflow-hidden"}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b-2 border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Check In</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Check Out</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {attendanceData.map((record, idx) => {
              const staffMember = staff.find(s => s.id === record.staffId);
              return (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="hover:bg-[#f9fff0] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-800">{staffMember?.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge roleId={staffMember?.role} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{record.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{record.checkIn || "-"}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{record.checkOut || "-"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-2xl text-xs font-bold ${
                      record.status === 'present' ? 'bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]' : 
                      record.status === 'late' ? 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]' : 
                      'bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]'
                    }`}>{record.status}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Leave Requests Tab
  const LeaveRequestsTab = () => (
    <div className="space-y-4">
      {leaveRequests.map((request, idx) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_24px_rgba(0,0,0,0.06)] border border-white/80 p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{request.staffName}</h3>
              <p className="text-sm text-gray-500 mt-1">📅 From {request.fromDate} to {request.toDate}</p>
              <p className="text-sm text-gray-600 mt-2">📝 Reason: {request.reason}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <span className={`inline-flex px-4 py-1.5 rounded-2xl text-sm font-bold ${
                request.status === 'pending' ? 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]' : 
                'bg-emerald-100 text-emerald-700 shadow-[0_2px_0_#6ee7b7]'
              }`}>{request.status}</span>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-xl shadow-[0_2px_0_#065f46] hover:translate-y-[1px] hover:shadow-[0_1px_0_#065f46] transition-all">✓ Approve</button>
                  <button className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-xl shadow-[0_2px_0_#b91c1c] hover:translate-y-[1px] hover:shadow-[0_1px_0_#b91c1c] transition-all">✗ Reject</button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const tabs = [
    { id: "staff", label: "Staff List", icon: "👥", component: StaffListTab },
    { id: "roles", label: "Roles & Permissions", icon: "🔑", component: RolesTab },
    { id: "attendance", label: "Attendance", icon: "📅", component: AttendanceTab },
    { id: "leaves", label: "Leave Requests", icon: "🏖️", component: LeaveRequestsTab },
  ];

  const CurrentComponent = tabs.find(tab => tab.id === activeTab)?.component || StaffListTab;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} hotels={hotels} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"} ml-10`}>
        <div className="pt-24 pr-6 pb-8">
          
          {/* Page Header */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Staff Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage staff, roles, attendance and permissions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statColors.map(({ label, color, textColor, icon, value }) => (
              <div key={label} className={clay.statCard(color)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className={`text-2xl font-semibold mt-1 ${textColor}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b-2 border-gray-100 overflow-x-auto pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap rounded-t-2xl ${
                  activeTab === tab.id
                    ? 'bg-white text-[#a3e635] shadow-[0_-4px_0_#a3e635]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <CurrentComponent />
        </div>
      </div>

      <AnimatePresence>
        <AddStaffModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addStaff}
          formData={formData}
          setFormData={setFormData}
          roles={roles}
        />
        <PermissionsModal 
          isOpen={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedStaff(null);
          }}
          onSave={updateStaffPermissions}
          staff={selectedStaff}
          roles={roles}
        />
      </AnimatePresence>
    </div>
  );
}