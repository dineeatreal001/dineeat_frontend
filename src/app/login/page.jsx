"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem("chaosstoredineeat");
    if (loggedIn === "1") {
      // Verify if token is still valid
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.exp > Date.now() / 1000) {
            router.push("/dashboard");
          } else {
            // Token expired, clear storage
            localStorage.removeItem("chaosstoredineeat");
            localStorage.removeItem("authToken");
            localStorage.removeItem("storeData");
            localStorage.removeItem("storeId");
          }
        } catch (err) {
          console.error("Token decode error:", err);
        }
      }
    }
  }, [router]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const response = await axios.post(
      `${API_URL}/api/store-auth/login`,
      {
        email: email,
        password: password,
        rememberMe: rememberMe,  // ← MAKE SURE THIS IS INCLUDED
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      // Store login flag - THIS SHOULD NOW WORK
      localStorage.setItem("chaosstoredineeat", "1");
      
      // Store store data
      localStorage.setItem("storeData", JSON.stringify(response.data.store));
      localStorage.setItem("storeId", response.data.storeId);
      
      // Store JWT token
      if (response.data.token) {
        if (rememberMe) {
          localStorage.setItem("authToken", response.data.token);
        } else {
          sessionStorage.setItem("authToken", response.data.token);
        }
        
        // Decode and store JWT data
        try {
          const decodedToken = jwt.decode(response.data.token);
          localStorage.setItem("jwtDecoded", JSON.stringify(decodedToken));
          
          if (decodedToken && decodedToken.exp) {
            localStorage.setItem("tokenExpiry", decodedToken.exp.toString());
          }
        } catch (decodeErr) {
          console.error("JWT decode error:", decodeErr);
        }
      }
      
      // Verify localStorage was set
      console.log("chaosstoredineeat:", localStorage.getItem("chaosstoredineeat")); // Should print "1"
      console.log("storeData:", localStorage.getItem("storeData"));
      
      // Redirect to dashboard
      router.push("/dashboard");
    }
  } catch (err) {
    console.error("Login error:", err);
    
    if (err.response) {
      setError(err.response.data.message || "Login failed. Please try again.");
    } else if (err.request) {
      setError("Unable to connect to server. Please check your connection.");
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060f08] to-[#0a1a0f] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3e635]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c6ff4d]/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#84cc16]/5 rounded-full blur-[150px]" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-[480px]"
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
    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg overflow-hidden"
    transition={{ duration: 0.3 }}
  >
    <img src="/logo.jpeg" alt="DineEat Logo" className="w-full h-full object-cover" />
  </motion.div>
  DineEat
</Link>
          <p className="text-white/50 text-sm mt-3">Restaurant billing made effortless.</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/50 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#a3e635] hover:text-[#c6ff4d] transition-colors font-semibold">
                Register
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#a3e635] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#a3e635] focus:ring-[#a3e635] focus:ring-offset-0 cursor-pointer"
                  disabled={loading}
                />
                <span className="text-white/60 text-sm">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[#a3e635] hover:text-[#c6ff4d] text-sm transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={!loading ? { scale: 1.02, backgroundColor: "#bef264" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className="w-full bg-[#a3e635] text-[#0d2010] py-3 rounded-xl font-bold text-base cursor-pointer transition-all mt-6 shadow-lg hover:shadow-[#a3e635]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#0d2010]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log In →"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-white/40">OR</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              New to DineEat?{" "}
              <Link href="/register" className="text-[#a3e635] hover:text-[#c6ff4d] font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-white/30 text-xs mt-8"
        >
          Secure login • Bank-grade encryption
        </motion.p>
      </motion.div>
    </div>
  );
}