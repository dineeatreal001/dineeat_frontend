// ─── MENU DATA ────────────────────────────────────────────────────────────────
export const menuCategories = [
  { id: 'all', name: 'All' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'biryani', name: 'Biryani' },
  { id: 'burgers', name: 'Burgers' },
  { id: 'starters', name: 'Starters' },
  { id: 'main_course', name: 'Main Course' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'special', name: 'Special Menu' },
];

export const menuItems = [
  // Snacks
  { id: 1, name: 'Batata Vada',        price: 75,  category: 'snacks',    veg: true,  emoji: '🟡', color: '#f59e0b' },
  { id: 2, name: 'Aloo Tikki',         price: 80,  category: 'snacks',    veg: true,  emoji: '🟤', color: '#92400e' },
  { id: 3, name: 'Jalebi',             price: 55,  category: 'desserts',  veg: true,  emoji: '🟠', color: '#f97316' },
  { id: 4, name: 'Onion Pakoda',       price: 70,  category: 'starters',  veg: true,  emoji: '🟡', color: '#d97706' },
  { id: 5, name: 'Mirchi Bajji',       price: 80,  category: 'starters',  veg: true,  emoji: '🟢', color: '#16a34a' },
  { id: 6, name: 'Samosa',             price: 40,  category: 'snacks',    veg: true,  emoji: '🔺', color: '#ca8a04' },
  { id: 7, name: 'Pav Bhaji',          price: 90,  category: 'snacks',    veg: true,  emoji: '🟠', color: '#ea580c' },
  // Coffee & Beverages
  { id: 8, name: 'Filter Coffee',      price: 25,  category: 'coffee',    veg: true,  emoji: '☕', color: '#78350f' },
  { id: 9, name: 'Masala Chai',        price: 20,  category: 'coffee',    veg: true,  emoji: '🍵', color: '#d97706' },
  { id: 10, name: 'Cold Coffee',       price: 80,  category: 'beverages', veg: true,  emoji: '🥤', color: '#92400e' },
  { id: 11, name: 'Fresh Lime Soda',   price: 60,  category: 'beverages', veg: true,  emoji: '🍋', color: '#84cc16' },
  { id: 12, name: 'Mango Lassi',       price: 70,  category: 'beverages', veg: true,  emoji: '🥭', color: '#f59e0b' },
  // Biryani
  { id: 13, name: 'Veg Biryani Chef Special', price: 200, category: 'biryani', veg: true,  emoji: '🍚', color: '#ca8a04' },
  { id: 14, name: 'Chicken Biryani',   price: 280, category: 'biryani',   veg: false, emoji: '🍗', color: '#dc2626' },
  { id: 15, name: 'Mutton Biryani',    price: 350, category: 'biryani',   veg: false, emoji: '🥩', color: '#b91c1c' },
  // Burgers
  { id: 16, name: 'Egg Cheese Burger', price: 250, category: 'burgers',   veg: false, emoji: '🍔', color: '#f59e0b' },
  { id: 17, name: 'American Sub',      price: 210, category: 'burgers',   veg: false, emoji: '🥖', color: '#d97706' },
  { id: 18, name: 'Chicken Burger',    price: 250, category: 'burgers',   veg: false, emoji: '🍗', color: '#dc2626' },
  { id: 19, name: 'Steak Burger',      price: 150, category: 'burgers',   veg: false, emoji: '🥩', color: '#b91c1c' },
  { id: 20, name: 'Indian Taco',       price: 120, category: 'burgers',   veg: true,  emoji: '🌮', color: '#16a34a' },
  // Main Course
  { id: 21, name: 'Dal Makhani',       price: 160, category: 'main_course', veg: true, emoji: '🍲', color: '#92400e' },
  { id: 22, name: 'Paneer Butter Masala', price: 180, category: 'main_course', veg: true, emoji: '🧀', color: '#f97316' },
  { id: 23, name: 'Butter Naan',       price: 40,  category: 'main_course', veg: true, emoji: '🫓', color: '#ca8a04' },
  { id: 24, name: 'Tandoori Roti',     price: 20,  category: 'main_course', veg: true, emoji: '🫓', color: '#d97706' },
  // Starters
  { id: 25, name: 'Paneer Tikka',      price: 220, category: 'starters',  veg: true,  emoji: '🟡', color: '#f59e0b' },
  { id: 26, name: 'Chicken 65',        price: 260, category: 'starters',  veg: false, emoji: '🍗', color: '#dc2626' },
  { id: 27, name: 'Fish Fry',          price: 300, category: 'starters',  veg: false, emoji: '🐟', color: '#0891b2' },
  // Desserts
  { id: 28, name: 'Gulab Jamun',       price: 60,  category: 'desserts',  veg: true,  emoji: '🟤', color: '#92400e' },
  { id: 29, name: 'Ice Cream',         price: 80,  category: 'desserts',  veg: true,  emoji: '🍦', color: '#60a5fa' },
  { id: 30, name: 'Kheer',             price: 70,  category: 'desserts',  veg: true,  emoji: '🍮', color: '#fbbf24' },
];

// ─── TABLES CONFIG ─────────────────────────────────────────────────────────────
export const tableSections = [
  { id: 'all',        name: 'All' },
  { id: 'non_ac',     name: 'Non AC Section' },
  { id: 'ac_bar',     name: 'AC Section & BAR' },
  { id: 'rooms',      name: 'Rooms' },
  { id: 'vip',        name: 'VIP' },
  { id: 'pickup',     name: 'Pickup' },
];

export const tables = [
  // Non AC
  { id: 1,  name: 'Table1',      section: 'non_ac' },
  { id: 2,  name: 'Table2',      section: 'non_ac' },
  { id: 3,  name: 'Table3',      section: 'non_ac' },
  { id: 4,  name: 'Table4',      section: 'non_ac' },
  { id: 5,  name: 'Table5',      section: 'non_ac' },
  { id: 6,  name: 'Table6',      section: 'non_ac' },
  { id: 7,  name: 'Table7',      section: 'non_ac' },
  { id: 8,  name: 'Table8',      section: 'non_ac' },
  { id: 9,  name: 'Table9',      section: 'non_ac' },
  { id: 10, name: 'Table10',     section: 'non_ac' },
  // Rooms
  { id: 11, name: 'Room1',       section: 'rooms' },
  { id: 12, name: 'Room2',       section: 'rooms' },
  { id: 13, name: 'Room3',       section: 'rooms' },
  { id: 14, name: 'Room4',       section: 'rooms' },
  { id: 15, name: 'Room5',       section: 'rooms' },
  { id: 16, name: 'Room6',       section: 'rooms' },
  // AC & Bar
  { id: 17, name: 'Bar Table 1', section: 'ac_bar' },
  { id: 18, name: 'Bar Table 2', section: 'ac_bar' },
  { id: 19, name: 'Bar Table 3', section: 'ac_bar' },
  { id: 20, name: 'Bar Table 4', section: 'ac_bar' },
  // VIP
  { id: 21, name: 'VIP 1',       section: 'vip' },
  { id: 22, name: 'VIP 2',       section: 'vip' },
  { id: 23, name: 'VIP 3',       section: 'vip' },
  { id: 24, name: 'VIP 4',       section: 'vip' },
];

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
export const saveOrders = (orders) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hotel_pos_orders', JSON.stringify(orders));
  }
};

export const loadOrders = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('hotel_pos_orders')) || {};
    } catch { return {}; }
  }
  return {};
};

export const saveBills = (bills) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hotel_pos_bills', JSON.stringify(bills));
  }
};

export const loadBills = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('hotel_pos_bills')) || [];
    } catch { return []; }
  }
  return [];
};

export const saveCustomers = (customers) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hotel_pos_customers', JSON.stringify(customers));
  }
};

export const loadCustomers = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('hotel_pos_customers')) || [];
    } catch { return []; }
  }
  return [];
};