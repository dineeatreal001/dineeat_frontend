// CustomerOrderPage.tsx (updated with Profile tab)
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import CustomerCartProvider from '@/context/CustomerCartContext';
import { useAuth } from '@/context/AuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import Header from '@/components/customer/Header';
import SearchBar from '@/components/customer/SearchBar';
import HeroCarousel from '@/components/customer/HeroCarousel';
import Categories from '@/components/customer/Categories';
import TopSelling from '@/components/customer/TopSelling';
import MenuItems from '@/components/customer/MenuItems';
import BottomNav from '@/components/customer/BottomNav';
import CartDrawer from '@/components/customer/CartDrawer';
import OrderStatus from '@/components/customer/OrderStatus';
import History from '@/components/Customer/History';
import Profile from '@/components/Customer/Profile';
import GoogleLoginModal from '@/components/Customer/GoogleLoginModal';
import { useCustomerCart } from '@/context/CustomerCartContext';

// Clay Design Tokens
const clay = {
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  }
};

// Inner component that uses the cart context
function CustomerOrderContent() {
  const params = useParams();
  const router = useRouter();
  const { hotelName, tableId } = params;
  const { cart, clearCart } = useCustomerCart();
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  
  const [storeData, setStoreData] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showCart, setShowCart] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [tableError, setTableError] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [tableVerified, setTableVerified] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (hotelName) localStorage.setItem('current_hotel_name', hotelName);
    if (tableId) localStorage.setItem('current_table_id', tableId);
  }, [hotelName, tableId]);

  useEffect(() => {
    const checkExistingOrder = async () => {
      if (user && user.phone && storeId) {
        try {
          const response = await axios.get(`${API_URL}/api/customer-order/active`, {
            params: { storeId, phone: user.phone }
          });
          if (response.data.hasActiveOrder) {
            setExistingOrder(response.data.order);
            setCurrentOrder(response.data.order);
            setShowOrderStatus(true);
            setActiveTab('status');
          } else {
            setExistingOrder(null);
          }
        } catch (error) {
          console.error('Error checking existing order:', error);
        }
      }
    };
    if (user && storeId) checkExistingOrder();
  }, [user, storeId]);

  useEffect(() => {
    if (!authLoading && !user && (showCart || pendingAction)) setShowLoginModal(true);
  }, [authLoading, user, showCart, pendingAction]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        console.log("Fetching store for hotel:", hotelName);
        const storeResponse = await axios.get(`${API_URL}/api/customer/store/${hotelName}`);
        
        if (!storeResponse.data.success) {
          setTableError("Restaurant not found. Please check the QR code.");
          setLoading(false);
          return;
        }
        
        const store = storeResponse.data.store;
        setStoreData(store);
        setStoreId(store._id);
        
        if (tableId) {
          try {
            const tableResponse = await axios.get(`${API_URL}/api/customer/table/check/${encodeURIComponent(hotelName)}/${tableId}`);
            if (tableResponse.data.success) {
              setTableVerified(true);
              setTableError(null);
              setTableInfo(tableResponse.data.table);
              
              const categoriesResponse = await axios.get(`${API_URL}/api/customer/categories/${store._id}`);
              if (categoriesResponse.data.success) setCategories(categoriesResponse.data.categories);
              
              const menuResponse = await axios.get(`${API_URL}/api/customer/menu/${store._id}`);
              if (menuResponse.data.success) {
                const items = menuResponse.data.items.filter(item => item.available !== false);
                setMenuItems(items);
                setTopSelling([...items].sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 6));
              }
            } else {
              setTableVerified(false);
              setTableError(tableResponse.data.message);
              setTableInfo(tableResponse.data.table || null);
            }
          } catch (tableError) {
            setTableError(tableError.response?.data?.message || "Unable to verify table");
            setTableVerified(false);
          }
        } else {
          setTableError("No table ID provided");
          setTableVerified(false);
        }
        
        setCarouselImages([
          { id: 1, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", title: "Special Offer", subtitle: "20% off on orders above ₹500" },
          { id: 2, url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", title: "Free Delivery", subtitle: "On orders above ₹300" },
          { id: 3, url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", title: "Happy Hours", subtitle: "6 PM - 8 PM" }
        ]);
      } catch (error) {
        console.error('Error fetching store data:', error);
        setTableError("Unable to load restaurant data");
      } finally {
        setLoading(false);
      }
    };
    if (hotelName) fetchStoreData();
    else setTableError("Invalid QR code");
  }, [hotelName, tableId]);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    const result = await signInWithGoogle();
    setLoginLoading(false);
    if (result.success) {
      setShowLoginModal(false);
      if (pendingAction === 'cart') setShowCart(true);
      setPendingAction(null);
    } else alert('Failed to sign in');
  };

  const handleCartClick = () => {
    if (!tableVerified) { alert("Please scan a valid table QR code"); return; }
    if (!user) { setPendingAction('cart'); setShowLoginModal(true); }
    else setShowCart(true);
  };

  const handleOrderPlace = (order) => {
    setCurrentOrder(order);
    setExistingOrder(order);
    setShowOrderStatus(true);
    setShowCart(false);
    setActiveTab('status');
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Table Error Page
  if (!loading && (tableError || !tableVerified)) {
    const isNotFound = tableError?.includes("not found") || tableError?.includes("Invalid");
    const isOccupied = tableError?.includes("occupied");
    let icon = "🍽️", title = "Table Unavailable";
    if (isNotFound) { icon = "🔍"; title = "QR Code Not Recognized"; }
    else if (isOccupied) { icon = "🔴"; title = "Table Currently Occupied"; }
    
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
        <div className={clay.card + " p-8 text-center max-w-md w-full"}>
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{tableError}</p>
          <button onClick={() => window.location.reload()} className={clay.btn.primary + " w-full py-3 text-sm"}>Scan Valid QR Code</button>
          <p className="text-xs text-gray-400 mt-4">Please scan the QR code placed on your table to continue.</p>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerLayout>
        <Header 
          hotelName={storeData?.storeInfo?.companyName || hotelName}
          tableNumber={tableInfo?.name || tableId?.slice(-4) || "Unknown"}
          cartItemCount={cart.reduce((sum, item) => sum + item.qty, 0)}
          onCartClick={handleCartClick}
          user={user}
          tableVerified={tableVerified}
        />
        
        <div className="pb-20">
          {activeTab === 'home' && (
            <>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <HeroCarousel images={carouselImages} />
              <TopSelling items={topSelling} />
              <Categories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
              <MenuItems items={filteredMenuItems} cart={cart} />
            </>
          )}
          {activeTab === 'status' && (
            <OrderStatus order={currentOrder} onClose={() => { setShowOrderStatus(false); setActiveTab('home'); }} />
          )}
          {activeTab === 'history' && (
            <History onContinueOrder={(order) => { setExistingOrder(order); setCurrentOrder(order); setShowOrderStatus(true); setActiveTab('status'); }} />
          )}
          {activeTab === 'profile' && (
            <Profile />
          )}
        </div>
        
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} cartItemCount={cart.reduce((sum, item) => sum + item.qty, 0)} onCartClick={handleCartClick} user={user} />
        
        <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} tableNumber={tableInfo?.name || tableId?.slice(-4) || "Unknown"} hotelName={hotelName} storeId={storeId} tableInfo={tableInfo} onOrderPlaced={handleOrderPlace} user={user} existingOrder={existingOrder} />
      </CustomerLayout>
      
      <GoogleLoginModal isOpen={showLoginModal} onClose={() => { setShowLoginModal(false); setPendingAction(null); }} onLogin={handleGoogleLogin} loading={loginLoading} />
    </>
  );
}

export default function CustomerOrderPage() {
  return (
    <CustomerCartProvider>
      <CustomerOrderContent />
    </CustomerCartProvider>
  );
}