"use client";
import { useState } from 'react';
import { Search, Plus, X, Edit2, Save } from 'lucide-react';
import { saveCustomers } from '@/lib/data';

export default function Customers({ ctx }) {
  const { customers, setCustomers, addNotification } = ctx;
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.phone) {
      addNotification('Please fill name and phone');
      return;
    }
    if (editId) {
      const updated = customers.map(c => c.id === editId ? { ...c, ...form } : c);
      setCustomers(updated);
      saveCustomers(updated);
      addNotification('Customer updated');
    } else {
      const newC = { 
        ...form, 
        id: Date.now(), 
        visits: 0, 
        totalSpend: 0, 
        joinedAt: new Date().toISOString() 
      };
      const updated = [newC, ...customers];
      setCustomers(updated);
      saveCustomers(updated);
      addNotification('Customer added');
    }
    setForm({ name: '', phone: '', email: '', address: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '' });
    setEditId(c.id);
    setShowAdd(true);
  };

  const deleteCustomer = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      saveCustomers(updated);
      addNotification('Customer removed');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex gap-3 items-center flex-shrink-0 bg-white">
        <h2 className="text-sm font-bold text-gray-800">Customers</h2>
        <div className="flex-1" />
        
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search customers..." 
            className="pl-9 pr-3 py-1.5 w-48 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Add Button */}
        <button 
          onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', phone: '', email: '', address: '' }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition shadow-sm"
        >
          <Plus size={13} /> Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-400 text-sm">
              {customers.length === 0 ? 'No customers yet. Add your first customer!' : 'No customers found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-xs text-gray-500">
                  <th className="px-3 py-3 text-left font-semibold">Name</th>
                  <th className="px-3 py-3 text-left font-semibold">Phone</th>
                  <th className="px-3 py-3 text-left font-semibold">Email</th>
                  <th className="px-3 py-3 text-left font-semibold">Address</th>
                  <th className="px-3 py-3 text-left font-semibold">Joined</th>
                  <th className="px-3 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition text-sm">
                    <td className="px-3 py-3 font-semibold text-gray-800">{c.name}</td>
                    <td className="px-3 py-3 font-mono text-green-600">{c.phone}</td>
                    <td className="px-3 py-3 text-gray-500">{c.email || '—'}</td>
                    <td className="px-3 py-3 text-gray-500">{c.address || '—'}</td>
                    <td className="px-3 py-3 text-gray-400 text-xs">
                      {new Date(c.joinedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(c)} 
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteCustomer(c.id)} 
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editId ? 'Edit Customer' : 'Add New Customer'}
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Customer name" 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                    placeholder="+91 XXXXXXXXXX" 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  placeholder="email@example.com" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <input 
                  value={form.address} 
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                  placeholder="Customer address" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button 
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                onClick={() => { setShowAdd(false); setEditId(null); }}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                onClick={handleSave}
              >
                <Save size={14} /> {editId ? 'Update' : 'Save Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}