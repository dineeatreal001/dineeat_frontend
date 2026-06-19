// Profile.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, MapPin, Calendar, 
  Star, Gift, Coffee, Trophy, ChevronRight,
  Settings, LogOut, Award, Sparkles, Clock,
  Crown, Heart, Share2, Edit2, CheckCircle,
  X, Shield, CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginModal from '@/components/Customer/GoogleLoginModal';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Clay Design Tokens
const clay = {
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost: "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
  },
};

// Loyalty Program Component
function LoyaltyProgram({ visits, nextReward, onClaimReward }) {
  const [showRewardModal, setShowRewardModal] = useState(false);
  
  // Calculate loyalty tier based on visits
  const getTier = (visits) => {
    if (visits >= 50) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', icon: '💎', min: 50 };
    if (visits >= 25) return { name: 'Platinum', color: 'from-purple-400 to-pink-500', icon: '🏆', min: 25 };
    if (visits >= 10) return { name: 'Gold', color: 'from-amber-400 to-yellow-500', icon: '🥇', min: 10 };
    if (visits >= 5) return { name: 'Silver', color: 'from-gray-400 to-gray-500', icon: '🥈', min: 5 };
    return { name: 'Bronze', color: 'from-orange-400 to-amber-500', icon: '🥉', min: 0 };
  };
  
  const tier = getTier(visits);
  const nextTier = getTier(visits + 1);
  const progressToNextTier = nextTier.min > tier.min ? ((visits - tier.min) / (nextTier.min - tier.min)) * 100 : 100;
  const visitsToNextTier = nextTier.min - visits;
  
  // Calculate next visit reward based on current visits
  const getNextVisitReward = (visits) => {
    const nextVisitNum = visits + 1;
    if (nextVisitNum === 5) return { type: 'Free Coffee', value: 'Free Coffee on next visit', icon: '☕', discount: '100% off on any coffee' };
    if (nextVisitNum === 10) return { type: '15% Off', value: '15% off on total bill', icon: '🎁', discount: '15% off on your next order' };
    if (nextVisitNum === 15) return { type: 'Free Dessert', value: 'Complimentary Dessert', icon: '🍰', discount: 'Free dessert of your choice' };
    if (nextVisitNum === 20) return { type: '20% Off', value: '20% off on total bill', icon: '🎉', discount: '20% off on your next order' };
    if (nextVisitNum === 25) return { type: 'VIP Access', value: 'VIP Table Reservation', icon: '👑', discount: 'Priority table booking' };
    if (nextVisitNum === 30) return { type: 'Free Meal', value: 'Complimentary Meal (up to ₹500)', icon: '🍽️', discount: 'Free meal worth ₹500' };
    if (nextVisitNum === 40) return { type: '25% Off', value: '25% off on total bill', icon: '🎊', discount: '25% off on your next order' };
    if (nextVisitNum === 50) return { type: 'Diamond Member', value: 'Diamond Status + ₹1000 Voucher', icon: '💎', discount: '₹1000 dining voucher' };
    return { type: 'Loyalty Stamp', value: `${nextVisitNum}th visit milestone`, icon: '⭐', discount: `${nextVisitNum} stamps collected` };
  };
  
  const nextRewardData = getNextVisitReward(visits);
  const canClaimReward = visits > 0 && visits % 5 === 0;
  
  // Sample reward history
  const rewardHistory = [
    { id: 1, reward: 'Free Coffee', claimedAt: '2024-05-15', visits: 5 },
    { id: 2, reward: '15% Off', claimedAt: '2024-05-28', visits: 10 },
    { id: 3, reward: 'Free Dessert', claimedAt: '2024-06-10', visits: 15 },
  ];
  
  // Active offers
  const activeOffers = [
    { id: 1, title: 'Birthday Special', description: 'Get 20% off on your birthday month', validUntil: 'Valid for 30 days', icon: '🎂' },
    { id: 2, title: 'Refer a Friend', description: 'Get ₹100 off on next visit', validUntil: 'Valid for unlimited uses', icon: '👥' },
    { id: 3, title: 'Weekend Brunch', description: '10% off on orders above ₹1000', validUntil: 'Sat & Sun only', icon: '🍳' },
  ];
  
  return (
    <div className="space-y-4">
      {/* Loyalty Tier Card */}
      <div className={clay.card + " p-5 overflow-hidden relative"}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tier.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Loyalty Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{tier.icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{tier.name} Member</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#a3e635]">{visits}</p>
            <p className="text-[10px] text-gray-400">Total Visits</p>
          </div>
        </div>
        
        {/* Progress to next tier */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{tier.name}</span>
            <span className="text-gray-500">{nextTier.name}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextTier}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
            />
          </div>
          {visitsToNextTier > 0 && (
            <p className="text-[10px] text-gray-400 mt-2">{visitsToNextTier} more visits to reach {nextTier.name}</p>
          )}
        </div>
      </div>
      
      {/* Next Visit Reward - Exciting Game Style */}
      <div className="relative">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 shadow-[0_8px_0_#b45309] cursor-pointer"
          onClick={() => setShowRewardModal(true)}
        >
          <div className="absolute -top-2 -right-2">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <Sparkles size={16} className="text-amber-500" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
              <span className="text-4xl">{nextRewardData.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-semibold uppercase tracking-wider">🎁 Next Visit Reward</p>
              <p className="text-lg font-bold text-white">{nextRewardData.type}</p>
              <p className="text-sm text-white/90 mt-0.5">{nextRewardData.discount}</p>
            </div>
            <ChevronRight size={20} className="text-white/70" />
          </div>
        </motion.div>
        
        {/* Progress to next reward */}
        <div className="mt-3 px-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Progress to next reward</span>
            <span className="text-gray-700 font-medium">{visits % 5}/5 visits</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(visits % 5) * 20}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>
      </div>
      
      {/* Claim Reward Button */}
      {canClaimReward && (
        <motion.button
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          onClick={onClaimReward}
          className="w-full py-4 bg-gradient-to-r from-[#a3e635] to-[#84cc16] text-gray-900 font-bold rounded-2xl shadow-[0_6px_0_#4d7c00] hover:shadow-[0_3px_0_#4d7c00] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150 flex items-center justify-center gap-2"
        >
          <Gift size={18} /> Claim Your Reward!
        </motion.button>
      )}
      
      {/* Active Offers */}
      <div className={clay.card + " p-5"}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-[#a3e635]" />
          <h3 className="text-sm font-bold text-gray-800">Active Offers</h3>
        </div>
        <div className="space-y-3">
          {activeOffers.map((offer) => (
            <div key={offer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl shadow-[0_2px_0_#e5e7eb]">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-xl">
                {offer.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{offer.title}</p>
                <p className="text-xs text-gray-500">{offer.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{offer.validUntil}</p>
              </div>
              <button className="text-[#a3e635] text-xs font-bold bg-white px-3 py-1.5 rounded-xl shadow-[0_2px_0_#e5e7eb] active:translate-y-[1px]">
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reward History */}
      <div className={clay.card + " p-5"}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[#a3e635]" />
          <h3 className="text-sm font-bold text-gray-800">Reward History</h3>
        </div>
        <div className="space-y-2">
          {rewardHistory.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{reward.reward}</p>
                  <p className="text-[10px] text-gray-400">Claimed on {new Date(reward.claimedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Visit #{reward.visits}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#b45309]">
                  <span className="text-4xl">{nextRewardData.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Next Visit Reward!</h2>
                <p className="text-gray-500 text-sm mb-4">You're just one visit away from unlocking this reward</p>
                <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
                  <p className="text-2xl font-bold text-amber-700">{nextRewardData.type}</p>
                  <p className="text-sm text-amber-600 mt-1">{nextRewardData.discount}</p>
                </div>
                <p className="text-xs text-gray-400">Visit again on your next dining experience to claim this reward!</p>
                <button 
                  onClick={() => setShowRewardModal(false)}
                  className="mt-4 w-full py-3 bg-[#a3e635] text-gray-900 rounded-2xl font-bold shadow-[0_4px_0_#6aaa00] active:translate-y-[2px] transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Profile Component
export default function Profile() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [visits, setVisits] = useState(18); // Sample visits data - would come from API
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  
  // Sample user stats
  const userStats = {
    totalSpent: 12500,
    totalOrders: 24,
    favoriteItem: 'Butter Chicken',
    memberSince: '2024-01-15',
  };
  
  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    const result = await signInWithGoogle();
    setLoginLoading(false);
    if (result.success) {
      setShowLoginModal(false);
    }
  };
  
  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };
  
  const handleClaimReward = () => {
    alert('🎉 Congratulations! Your reward has been claimed. The offer will be applied on your next visit.');
    // API call to claim reward would go here
  };
  
  const memberSinceDate = new Date(userStats.memberSince).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  });
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_0_#d1d5db]">
            <User size={44} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to DineEat</h3>
          <p className="text-gray-400 text-sm mb-6">Login to view your profile and earn rewards</p>
          <button onClick={() => setShowLoginModal(true)} className={clay.btn.primary + " px-6 py-3 text-sm"}>
            Login with Google
          </button>
        </div>
        
        <GoogleLoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleGoogleLogin}
          loading={loginLoading}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-900 rounded-b-3xl shadow-[0_12px_0_#1f2937] px-6 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-20 h-20 rounded-2xl border-2 border-[#a3e635] shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#84cc16] flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-gray-800">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <button 
              onClick={() => setShowEditModal(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_0_#d1d5db] active:translate-y-[1px]"
            >
              <Edit2 size={12} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">Member since {memberSinceDate}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/10 rounded-2xl shadow-[0_3px_0_rgba(0,0,0,0.2)] active:translate-y-[2px]">
            <LogOut size={18} className="text-white/70" />
          </button>
        </div>
      </div>
      
      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className={clay.card + " p-3 text-center"}>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-[0_2px_0_#86efac]">
              <CreditCard size={18} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">₹{userStats.totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">Total Spent</p>
          </div>
          <div className={clay.card + " p-3 text-center"}>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-[0_2px_0_#93c5fd]">
              <Coffee size={18} className="text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">{userStats.totalOrders}</p>
            <p className="text-[10px] text-gray-400">Total Orders</p>
          </div>
          <div className={clay.card + " p-3 text-center"}>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-[0_2px_0_#fde68a]">
              <Star size={18} className="text-amber-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">{userStats.favoriteItem}</p>
            <p className="text-[10px] text-gray-400">Favorite Item</p>
          </div>
        </div>
        
        {/* Loyalty Program */}
        <LoyaltyProgram 
          visits={visits} 
          nextReward="Free Coffee"
          onClaimReward={handleClaimReward}
        />
        
        {/* Menu Items */}
        <div className={clay.card + " p-5"}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-[#a3e635]" />
            <h3 className="text-sm font-bold text-gray-800">Menu Favorites</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Butter Chicken', orders: 12, icon: '🍗' },
              { name: 'Garlic Naan', orders: 18, icon: '🥖' },
              { name: 'Mango Lassi', orders: 8, icon: '🥭' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">Ordered {item.orders} times</p>
                  </div>
                </div>
                <Heart size={16} className="text-red-400" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Settings */}
        <div className={clay.card + " p-5"}>
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-[#a3e635]" />
            <h3 className="text-sm font-bold text-gray-800">Settings</h3>
          </div>
          <div className="space-y-2">
            {[
              { icon: Shield, label: 'Privacy Policy', action: () => alert('Privacy Policy') },
              { icon: Share2, label: 'Refer a Friend', action: () => alert('Share referral link') },
              { icon: Crown, label: 'Terms & Conditions', action: () => alert('Terms & Conditions') },
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={item.action}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                    <input 
                      type="text" 
                      value={editForm.name || user.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowEditModal(false)} className={clay.btn.secondary + " flex-1 py-3 text-sm"}>Cancel</button>
                  <button onClick={() => { alert('Profile updated!'); setShowEditModal(false); }} className={clay.btn.primary + " flex-1 py-3 text-sm"}>Save Changes</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}