// components/AuthGuard.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("chaosstoredineeat");
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      if (loggedIn !== "1" || !token) {
        router.push("/login");
        return false;
      }

      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          setIsAuthorized(true);
          return true;
        } else {
          // Token expired
          localStorage.removeItem("chaosstoredineeat");
          localStorage.removeItem("authToken");
          localStorage.removeItem("storeData");
          localStorage.removeItem("storeId");
          sessionStorage.removeItem("authToken");
          router.push("/login");
          return false;
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.push("/login");
        return false;
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060f08] to-[#0a1a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-white/60">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}