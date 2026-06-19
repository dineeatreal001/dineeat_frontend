"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CustomerCartContext = createContext();

export const useCustomerCart = () => {
  const context = useContext(CustomerCartContext);
  if (!context) {
    throw new Error('useCustomerCart must be used within CustomerCartProvider');
  }
  return context;
};

export default function CustomerCartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('customer_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error('Error parsing saved cart:', e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('customer_cart', JSON.stringify(cart));
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      setCartTotal(total);
    }
  }, [cart, isInitialized]);

  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item._id);
      if (existingItem) {
        return prevCart.map(i =>
          i.id === item._id ? { ...i, qty: i.qty + quantity } : i
        );
      }
      return [...prevCart, { 
        id: item._id,
        name: item.name, 
        price: item.price, 
        qty: quantity,
        veg: item.veg,
        emoji: item.emoji
      }];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, qty: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_cart');
    }
  };

  return (
    <CustomerCartContext.Provider value={{
      cart,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CustomerCartContext.Provider>
  );
}