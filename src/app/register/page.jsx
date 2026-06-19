"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const [hotelName, setHotelName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await axios.post(
        `${API_URL}/api/demo-requests/create`,
        {
          hotelName,
          phoneNumber,
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setShowPopup(true);
        setHotelName("");
        setPhoneNumber("");
        setEmail("");
      } else {
        throw new Error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response) {
        setError(error.response.data.message || "Failed to submit request. Please try again.");
      } else if (error.request) {
        setError("Unable to connect to server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openWhatsApp = () => {
    const message = `Hello DineEat! I'm interested in your restaurant management platform.%0A%0A🏨 Hotel Name: ${hotelName || 'Not provided'}%0A📞 Phone: ${phoneNumber || 'Not provided'}%0A📧 Email: ${email || 'Not provided'}`;
    window.open(`https://wa.me/919860481137?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060f08] to-[#0a1a0f] flex items-center justify-center p-4 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3e635]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c6ff4d]/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#84cc16]/5 rounded-full blur-[150px]" />
      </div>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (hotelName && phoneNumber && email) {
            openWhatsApp();
          } else {
            alert("Please fill in your details first before starting a chat.");
          }
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl cursor-pointer group"
      >
        {/* Proper WhatsApp SVG Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="white"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M12.031 2.001c-5.25 0-9.5 4.25-9.5 9.5 0 1.688.438 3.281 1.281 4.719l-1.281 4.688 4.813-1.25c1.344.75 2.875 1.156 4.438 1.156 5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5zm0 17.5c-1.438 0-2.844-.375-4.063-1.063l-4.5 1.188 1.219-4.375c-.75-1.25-1.156-2.688-1.156-4.188 0-4.5 3.656-8.156 8.156-8.156s8.156 3.656 8.156 8.156-3.656 8.438-8.156 8.438zm4.688-6.125c-.25-.125-1.469-.719-1.688-.813-.219-.094-.375-.125-.531.125-.156.25-.625.813-.781.969-.156.156-.281.188-.531.063-.25-.125-1.063-.375-2-1.219-.719-.656-1.219-1.469-1.344-1.719-.156-.25-.031-.375.094-.5.125-.125.281-.344.406-.5.125-.156.188-.281.281-.469.094-.188.047-.344-.031-.5-.078-.156-.688-1.688-.938-2.313-.25-.594-.5-.5-.688-.5-.156 0-.344-.031-.531-.031-.188 0-.5.063-.75.344-.281.281-1.094 1.063-1.094 2.594 0 1.531 1.125 3.031 1.281 3.219.156.188 2.125 3.281 5.094 4.594.75.313 1.344.5 1.781.656.75.25 1.438.219 1.969.125.625-.094 1.469-.594 1.688-1.188.219-.594.219-1.094.156-1.188-.063-.094-.219-.156-.469-.281z"/>
        </svg>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat on WhatsApp
        </div>
      </motion.a>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-[500px]"
      >
        {/* Logo/Brand Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white tracking-tight no-underline">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-[#a3e635] flex items-center justify-center text-xl shadow-lg"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              🍽️
            </motion.div>
            DineEat
          </Link>
          <p className="text-white/50 text-sm mt-3">Restaurant billing made effortless.</p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Get Started with DineEat</h1>
            <p className="text-white/50 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#a3e635] hover:text-[#c6ff4d] transition-colors font-semibold">
                Sign In
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hotel Name Field */}
            <div>
              <label htmlFor="hotelName" className="block text-white/80 text-sm font-medium mb-2">
                Hotel / Restaurant Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="hotelName"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
                  placeholder="Enter your restaurant name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-white/80 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
                  placeholder="+91 98765 43210"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Request Button */}
            <motion.button
              whileHover={!isSubmitting ? { scale: 1.02, backgroundColor: "#bef264" } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#a3e635] text-[#0d2010] py-3 rounded-xl font-bold text-base cursor-pointer transition-all mt-6 shadow-lg hover:shadow-[#a3e635]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0d2010]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Request...
                </>
              ) : (
                <>
                  Request Demo →
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-white/40">Or</span>
            </div>
          </div>

          {/* WhatsApp Chat Option */}
          <div className="text-center">
            <p className="text-white/50 text-sm mb-3">Prefer to talk to us directly?</p>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border border-[#25D366]/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 2.001c-5.25 0-9.5 4.25-9.5 9.5 0 1.688.438 3.281 1.281 4.719l-1.281 4.688 4.813-1.25c1.344.75 2.875 1.156 4.438 1.156 5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5zm0 17.5c-1.438 0-2.844-.375-4.063-1.063l-4.5 1.188 1.219-4.375c-.75-1.25-1.156-2.688-1.156-4.188 0-4.5 3.656-8.156 8.156-8.156s8.156 3.656 8.156 8.156-3.656 8.438-8.156 8.438zm4.688-6.125c-.25-.125-1.469-.719-1.688-.813-.219-.094-.375-.125-.531.125-.156.25-.625.813-.781.969-.156.156-.281.188-.531.063-.25-.125-1.063-.375-2-1.219-.719-.656-1.219-1.469-1.344-1.719-.156-.25-.031-.375.094-.5.125-.125.281-.344.406-.5.125-.156.188-.281.281-.469.094-.188.047-.344-.031-.5-.078-.156-.688-1.688-.938-2.313-.25-.594-.5-.5-.688-.5-.156 0-.344-.031-.531-.031-.188 0-.5.063-.75.344-.281.281-1.094 1.063-1.094 2.594 0 1.531 1.125 3.031 1.281 3.219.156.188 2.125 3.281 5.094 4.594.75.313 1.344.5 1.781.656.75.25 1.438.219 1.969.125.625-.094 1.469-.594 1.688-1.188.219-.594.219-1.094.156-1.188-.063-.094-.219-.156-.469-.281z"/>
              </svg>
              Chat with us on WhatsApp
            </button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-white/30 text-xs mt-8"
        >
          Join 12,000+ restaurants • Start your 30-day free trial
        </motion.p>
      </motion.div>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closePopup}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-[#060f08] to-[#0a1a0f] rounded-2xl p-8 max-w-md w-full border border-[#a3e635]/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Animation */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#a3e635]/20 flex items-center justify-center"
                >
                  <svg className="w-10 h-10 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Request Sent! 🎉
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-sm mb-6"
                >
                  Thank you for your interest in DineEat! Our team will get back to you within 24 hours.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <button
                    onClick={closePopup}
                    className="w-full bg-[#a3e635] text-[#0d2010] py-2.5 rounded-xl font-semibold hover:bg-[#bef264] transition-all"
                  >
                    Got it, thanks!
                  </button>
                  
                  <button
                    onClick={() => {
                      closePopup();
                      openWhatsApp();
                    }}
                    className="w-full bg-transparent border border-white/20 text-white py-2.5 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                      <path d="M12.031 2.001c-5.25 0-9.5 4.25-9.5 9.5 0 1.688.438 3.281 1.281 4.719l-1.281 4.688 4.813-1.25c1.344.75 2.875 1.156 4.438 1.156 5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5zm0 17.5c-1.438 0-2.844-.375-4.063-1.063l-4.5 1.188 1.219-4.375c-.75-1.25-1.156-2.688-1.156-4.188 0-4.5 3.656-8.156 8.156-8.156s8.156 3.656 8.156 8.156-3.656 8.438-8.156 8.438z"/>
                    </svg>
                    Chat on WhatsApp Now
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}