"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Grid3x3, LayoutList, Table } from 'lucide-react';
import OrderPanel from '@/components/pos/OrderPanel';
import axios from 'axios';

// Clay Design Tokens
const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
  },
  card: "bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb,0_8px_20px_rgba(0,0,0,0.06)] border border-white/80",
};

// Veg/Non-Veg Indicator Component
function VegNonVegIndicator({ isVeg, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };
  
  const circleSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-md flex items-center justify-center ${isVeg ? 'bg-green-100' : 'bg-red-100'}`}>
      <div className={`${circleSizes[size]} rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
  );
}

// No Table Selected Component
function NoTableSelected() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className={clay.card + " text-center p-8 max-w-md w-full"}>
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_#e5e7eb]">
          <Table size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Table Selected</h3>
        <p className="text-gray-400 text-sm mb-4">Please select a table from the dropdown above to start taking orders</p>
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 mt-2">
          <p className="flex items-center gap-2 justify-center">💡 Tip: Click on any table card or use the table selector dropdown</p>
        </div>
      </div>
    </div>
  );
}

export default function Order({ ctx }) {
  const router = useRouter();
  
  // Safely destructure with defaults
  const { 
    selectedTable, 
    setSelectedTable, 
    updateTableOrder, 
    getTableOrder,
    storeId,
    tables,
    menuItems,
    menuCategories
  } = ctx || {};
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [localMenuItems, setLocalMenuItems] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const [localTables, setLocalTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Get storeId safely
  const getStoreId = () => {
    if (storeId) return storeId;
    
    if (typeof window !== 'undefined') {
      const storeData = localStorage.getItem("storeData");
      if (storeData) {
        try {
          const parsed = JSON.parse(storeData);
          return parsed.id || parsed._id;
        } catch (e) {
          console.error("Error parsing storeData:", e);
        }
      }
      const directStoreId = localStorage.getItem("storeId");
      if (directStoreId) return directStoreId;
    }
    return null;
  };

  const actualStoreId = getStoreId();

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    if (!actualStoreId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/items/${actualStoreId}`);
      if (response.data.success) {
        const itemsWithUniqueIds = response.data.items.map((item, index) => ({
          ...item,
          _id: item._id || `${item.name}_${index}_${Date.now()}`,
          uniqueKey: item._id || `${item.name}_${index}`
        }));
        setLocalMenuItems(itemsWithUniqueIds);
        
        // Get unique categories
        const categories = [...new Set(response.data.items.map(item => item.category).filter(Boolean))];
        setLocalCategories(categories.map(cat => ({ id: cat, name: cat })));
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  // Fetch tables from API
  const fetchTables = async () => {
    if (!actualStoreId) return;
    try {
      const response = await axios.get(`${API_URL}/api/tables/${actualStoreId}`);
      if (response.data.success) {
        setLocalTables(response.data.tables.filter(t => t.isActive !== false));
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchTables()]);
  }, [actualStoreId]);

  // Use provided data or fetched data
  const displayMenuItems = menuItems?.length > 0 ? menuItems : localMenuItems;
  const displayCategories = menuCategories?.length > 0 ? menuCategories : localCategories;
  const displayTables = tables?.length > 0 ? tables : localTables;

  const filtered = useMemo(() => {
    return displayMenuItems.filter(item => {
      const matchCat = category === 'all' || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch && item.available !== false;
    });
  }, [search, category, displayMenuItems]);

  const handleAddItem = (item) => {
    if (!selectedTable || !updateTableOrder) {
      console.warn('Cannot add item: No table selected or updateTableOrder missing');
      return;
    }
    updateTableOrder(selectedTable._id || selectedTable.id, (order) => {
      const existing = order.items?.find(i => (i.id === item._id || i.itemId === item._id));
      if (existing) {
        return { 
          ...order, 
          items: order.items.map(i => 
            (i.id === item._id || i.itemId === item._id) 
              ? { ...i, qty: i.qty + 1 } 
              : i
          ) 
        };
      }
      return { 
        ...order, 
        items: [...(order.items || []), { 
          id: item._id,
          itemId: item._id,
          uniqueOrderId: `${item._id}_${Date.now()}_${Math.random()}`,
          name: item.name, 
          price: item.price, 
          qty: 1,
          veg: item.veg
        }] 
      };
    });
  };

  const currentOrder = selectedTable && getTableOrder ? getTableOrder(selectedTable._id || selectedTable.id) : null;
  const isInOrder = (id) => currentOrder?.items?.some(i => (i.id === id || i.itemId === id));

  if (!ctx) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f5f5f0]">
        <div className={clay.card + " text-center p-8 max-w-md"}>
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-gray-600 font-medium">Context not available</p>
          <p className="text-gray-400 text-sm mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  if (loading && displayMenuItems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f5f5f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#f5f5f0]">
      {/* Left: Menu Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top controls - Improved UI */}
        <div className="p-4 border-b-2 border-gray-100 bg-white shadow-[0_4px_0_#e5e7eb]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-2xl shadow-[0_3px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px] transition-all"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft size={14} />
              Dashboard
            </button>

            {/* Table selector */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-1.5 shadow-[0_2px_0_#e5e7eb]">
              <span className="text-xs font-semibold text-gray-500">Table:</span>
              <select
                value={selectedTable?._id || selectedTable?.id || ''}
                onChange={e => {
                  const t = displayTables.find(t => (t._id || t.id) === e.target.value);
                  if (setSelectedTable) setSelectedTable(t || null);
                }}
                className="bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="">— Select —</option>
                {displayTables.map(t => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search - Only show when table is selected */}
            {selectedTable && (
              <div className="flex-1 relative max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            {/* View Toggle - Only show when table is selected */}
            {selectedTable && (
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 shadow-[0_2px_0_#d1d5db]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#a3e635] text-gray-900 shadow-[0_2px_0_#6aaa00]' : 'text-gray-500'}`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#a3e635] text-gray-900 shadow-[0_2px_0_#6aaa00]' : 'text-gray-500'}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            )}

            {selectedTable && (
              <div className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-2xl shadow-[0_2px_0_#86efac] flex items-center gap-1.5">
                <span>📍</span> {selectedTable.name}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area with Categories Sidebar and Menu Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar - Only show when table is selected */}
          {selectedTable && (
            <div className="w-44 bg-white border-r-2 border-gray-100 overflow-y-auto flex-shrink-0 shadow-[0_4px_0_#e5e7eb]">
              <div className="p-3">
                <button
                  onClick={() => setCategory('all')}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all mb-1.5 ${
                    category === 'all' 
                      ? 'bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="block">📋 All Items</span>
                </button>
                {displayCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all mb-1.5 ${
                      category === cat.id 
                        ? 'bg-[#a3e635] text-gray-900 shadow-[0_4px_0_#6aaa00]' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="block">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Grid/List */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#f5f5f0]">
            {!selectedTable ? (
              <NoTableSelected />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {filtered.map((item, index) => {
                      const inOrder = isInOrder(item._id);
                      const orderQty = currentOrder?.items?.find(i => (i.id === item._id || i.itemId === item._id))?.qty || 0;
                      const uniqueKey = item._id || item.uniqueKey || `${item.name}_${index}_${item.category || 'uncategorized'}`;
                      
                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => handleAddItem(item)}
                          className={`relative rounded-2xl p-4 transition-all text-left cursor-pointer ${
                            inOrder 
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[#a3e635] shadow-[0_6px_0_#6aaa00]' 
                              : 'bg-white border-2 border-gray-100 shadow-[0_6px_0_#e5e7eb] hover:border-[#a3e635] hover:shadow-[0_4px_0_#6aaa00] hover:translate-y-[2px]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-3xl">{item.emoji || '🍽️'}</span>
                            <VegNonVegIndicator isVeg={item.veg} size="sm" />
                          </div>
                          <div className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">{item.name}</div>
                          {item.description && (
                            <div className="text-[10px] text-gray-400 mb-2 line-clamp-1">{item.description}</div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-green-600">₹{item.price}</span>
                            {inOrder && (
                              <span className="px-2 py-0.5 bg-[#a3e635] text-gray-800 rounded-xl text-xs font-bold shadow-[0_2px_0_#6aaa00]">
                                {orderQty}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((item, index) => {
                      const inOrder = isInOrder(item._id);
                      const orderQty = currentOrder?.items?.find(i => (i.id === item._id || i.itemId === item._id))?.qty || 0;
                      const uniqueKey = item._id || item.uniqueKey || `${item.name}_${index}_${item.category || 'uncategorized'}`;
                      
                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => handleAddItem(item)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${
                            inOrder 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#a3e635] shadow-[0_4px_0_#6aaa00]' 
                              : 'bg-white border-2 border-gray-100 shadow-[0_4px_0_#e5e7eb] hover:border-[#a3e635] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px]'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <span className="text-3xl">{item.emoji || '🍽️'}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                              <VegNonVegIndicator isVeg={item.veg} size="sm" />
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-gray-400">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-green-600">₹{item.price}</span>
                            {inOrder && (
                              <span className="px-2 py-0.5 bg-[#a3e635] text-gray-800 rounded-xl text-xs font-bold shadow-[0_2px_0_#6aaa00]">
                                {orderQty}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {filtered.length === 0 && (
                  <div className={clay.card + " text-center p-12 max-w-md mx-auto"}>
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-gray-500 text-sm font-medium">No items found</p>
                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search or category filter</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right panel - OrderPanel */}
      <OrderPanel ctx={ctx} />
    </div>
  );
}