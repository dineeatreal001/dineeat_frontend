"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";

export default function ClientLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Reduced to 500ms for better UX
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Handle route changes
  useEffect(() => {
    if (!isClient) return;

    const handleRouteChangeStart = () => {
      setLoading(true);
    };
    
    const handleRouteChangeComplete = () => {
      setTimeout(() => setLoading(false), 300);
    };

    // Listen for route changes using Next.js router events
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args) => {
      handleRouteChangeStart();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      handleRouteChangeStart();
      return originalReplace.apply(router, args);
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router, isClient]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div 
        style={{ 
          opacity: loading ? 0 : 1, 
          transition: "opacity 0.3s ease",
          visibility: loading ? "hidden" : "visible"
        }}
      >
        {children}
      </div>
    </>
  );
}