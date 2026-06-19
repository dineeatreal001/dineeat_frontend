"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const PosContext = createContext();

export const usePosContext = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePosContext must be used within PosProvider');
  }
  return context;
};

export default function PosProvider({ children }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [orders, setOrders] = useState({});
  const [mode, setMode] = useState('dine_in');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get storeId from localStorage or storeData
  const getStoreIdFromStorage = () => {
    // First try to get from storeData
    const storeDataStr = localStorage.getItem("storeData");
    if (storeDataStr) {
      try {
        const storeData = JSON.parse(storeDataStr);
        const id = storeData.id || storeData._id;
        if (id) {
          console.log("Found storeId from storeData:", id);
          return id;
        }
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
    
    // Then try direct storeId
    const directStoreId = localStorage.getItem("storeId");
    if (directStoreId) {
      console.log("Found storeId from localStorage:", directStoreId);
      return directStoreId;
    }
    
    return null;
  };

  // Set storeId on mount
  useEffect(() => {
    const id = getStoreIdFromStorage();
    if (!id) {
      console.log("No storeId found, redirecting to login");
      router.push('/login');
      return;
    }
    setStoreId(id);
  }, [router]);

  // Fetch tables
  const fetchTables = async () => {
    if (!storeId) return;
    try {
      console.log("Fetching tables for storeId:", storeId);
      const response = await axios.get(`${API_URL}/api/tables/${storeId}`);
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/items/${storeId}`);
      if (response.data.success) {
        setMenuItems(response.data.items);
        
        // Extract unique categories
        const categories = [...new Set(response.data.items.map(item => item.category))];
        setMenuCategories(categories.map(cat => ({ id: cat, name: cat })));
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  // Fetch bills
  const fetchBills = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/bills/${storeId}`);
      if (response.data.success) {
        setBills(response.data.bills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  // Get order for a table
  const getTableOrder = async (tableId) => {
    if (!storeId) return null;
    
    // Check if we have the order in state first
    if (orders[tableId]) {
      return orders[tableId];
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/active/${storeId}/${tableId}`);
      if (response.data.success && response.data.order) {
        // Store in state
        setOrders(prev => ({
          ...prev,
          [tableId]: response.data.order
        }));
        return response.data.order;
      }
      return { items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { items: [], customer: '', phone: '', address: '', kotNote: '', covers: '', kotCount: 0 };
    }
  };

  // Update order
  const updateTableOrder = async (tableId, updateFn) => {
    if (!storeId) return;
    
    try {
      const currentOrder = await getTableOrder(tableId);
      const updatedOrder = updateFn(currentOrder);
      
      const response = await axios.post(`${API_URL}/api/orders/create-update`, {
        storeId,
        tableId,
        customer: updatedOrder.customer,
        phone: updatedOrder.phone,
        address: updatedOrder.address,
        covers: updatedOrder.covers,
        kotNote: updatedOrder.kotNote,
        mode,
        items: updatedOrder.items.map(item => ({
          itemId: item.id || item.itemId,
          name: item.name,
          price: item.price,
          qty: item.qty
        }))
      });
      
      if (response.data.success) {
        // Update local order state
        setOrders(prev => ({
          ...prev,
          [tableId]: response.data.order
        }));
        await fetchBills();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Add KOT
  const addKot = async (tableId) => {
    if (!storeId) return;
    
    try {
      const order = await getTableOrder(tableId);
      if (!order || order.items.length === 0) return;
      
      const subtotal = order.items.reduce((s, i) => s + (i.price * i.qty), 0);
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + tax;
      
      const response = await axios.post(`${API_URL}/api/bills/kot`, {
        storeId,
        orderId: order._id,
        tableId,
        customer: order.customer,
        phone: order.phone,
        items: order.items,
        subtotal,
        tax,
        total,
        kotNum: (order.kotCount || 0) + 1,
        mode
      });
      
      if (response.data.success) {
        await fetchBills();
        // Clear current order
        await updateTableOrder(tableId, () => ({
          items: [],
          customer: '',
          phone: '',
          address: '',
          kotNote: '',
          covers: '',
          kotCount: (order.kotCount || 0) + 1
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Error adding KOT:', error);
      throw error;
    }
  };

  // Generate bill for dine-in
  const generateBill = async (tableId) => {
    if (!storeId) return null;
    
    try {
      const order = await getTableOrder(tableId);
      if (!order || order.items.length === 0) return null;
      
      const response = await axios.post(`${API_URL}/api/bills/generate`, {
        storeId,
        orderId: order._id
      });
      
      if (response.data.success) {
        await fetchBills();
        // Clear current order
        await updateTableOrder(tableId, () => ({
          items: [],
          customer: '',
          phone: '',
          address: '',
          kotNote: '',
          covers: '',
          kotCount: 0
        }));
        return response.data.bill;
      }
      return null;
    } catch (error) {
      console.error('Error generating bill:', error);
      return null;
    }
  };

  // Create pickup order
  const createPickupOrder = async (orderData) => {
    if (!storeId) return null;
    
    try {
      const response = await axios.post(`${API_URL}/api/orders/pickup`, {
        storeId,
        ...orderData,
      });
      
      if (response.data.success) {
        await fetchBills();
        return response.data.order;
      }
      return null;
    } catch (error) {
      console.error('Error creating pickup order:', error);
      throw error;
    }
  };

  // Create quick bill (walk-in customer)
  const createQuickBill = async (billData) => {
    if (!storeId) return null;
    
    try {
      const response = await axios.post(`${API_URL}/api/orders/quick-bill`, {
        storeId,
        ...billData,
      });
      
      if (response.data.success) {
        await fetchBills();
        return response.data.bill;
      }
      return null;
    } catch (error) {
      console.error('Error creating quick bill:', error);
      throw error;
    }
  };

  // Initial data load
  useEffect(() => {
    if (storeId) {
      console.log("StoreId available, fetching data...");
      Promise.all([
        fetchTables(),
        fetchMenuItems(),
        fetchBills()
      ]).finally(() => setLoading(false));
    }
  }, [storeId]);

  const value = {
    // State
    storeId,
    tables,
    selectedTable,
    setSelectedTable,
    menuItems,
    menuCategories,
    bills,
    setBills,
    orders,
    setOrders,
    mode,
    setMode,
    loading,
    activeTab,
    setActiveTab,
    
    // Functions
    getTableOrder,
    updateTableOrder,
    addKot,
    generateBill,
    createPickupOrder,
    createQuickBill,
    fetchTables,
    fetchMenuItems,
    fetchBills,
  };

  return (
    <PosContext.Provider value={value}>
      {children}
    </PosContext.Provider>
  );
}