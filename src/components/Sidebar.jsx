"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const menuGroups = [
  {
    label: "OPERATIONS",
    items: [
      { id: "overview",           icon: <DashIcon />,    label: "Dashboard",          path: "/dashboard" },
      { id: "orders",             icon: <OrderIcon />,   label: "Orders",             path: "/dashboard/orders" },
      { id: "live-tracking",      icon: <TrackIcon />,   label: "Live Tracking",      path: "/dashboard/live-tracking" },
      { id: "table-reservations", icon: <TableIcon />,   label: "Table Reservations", path: "/dashboard/table-reservations" },
      { id: "sales-report",       icon: <SalesIcon />,   label: "Sales Report",       path: "/dashboard/sales-report" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { id: "inventory", icon: <InvIcon />,      label: "Inventory", path: "/dashboard/inventory" },
      { id: "receipt",   icon: <ReceiptIcon />,  label: "Receipt",   path: "/dashboard/receipt" },
      { id: "staff",     icon: <StaffIcon />,    label: "Staff",     path: "/dashboard/staff" },
      { id: "qr-menu",   icon: <QrIcon />,       label: "QR Menu",   path: "/dashboard/qr-menu" },
      { id: "settings",  icon: <SettingsIcon />, label: "Settings",  path: "/dashboard/settings" },
      { id: "downloads", icon: <DownloadIcon />, label: "Downloads", path: "/dashboard/downloads" },
    ],
  },
];

// ─── Icon components ──────────────────────────────────────────────────────────
function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3h12M2 8h8M2 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M13 10.5v1l.7.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function TrackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
      <path d="M8 1.5V4M8 12v2.5M1.5 8H4M12 8h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function TableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 4V3M8 4V2.5M11 4V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 12v1M8 12v1.5M11 12v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1.5 8h13" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 8V4M10 8V4" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1"/>
    </svg>
  );
}
function InvIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5L8 2.5l6 3v5L8 13.5 2 10.5v-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 2.5v11M2 5.5l6 3 6-3" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h10v12l-2-1.5-2 1.5-2-1.5L5 14l-2-1.5V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M12 9c1.66 0 3 1.34 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function QrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="3.5" y="3.5" width="1" height="1" fill="currentColor"/>
      <rect x="11.5" y="3.5" width="1" height="1" fill="currentColor"/>
      <rect x="3.5" y="11.5" width="1" height="1" fill="currentColor"/>
      <path d="M9.5 9.5h2M9.5 12h3M11.5 9.5v2M12.5 11.5v3M9.5 14h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.27 1.27M11.33 11.33l1.27 1.27M12.6 3.4l-1.27 1.27M4.67 11.33l-1.27 1.27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function SalesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L6 4L8 7L11 3L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 13h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6" cy="4" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="11" cy="3" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="13" cy="5" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="2" cy="12" r="1" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 11v2h10v-2M8 3v6m-2.5-2L8 10l2.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Clay token helpers ───────────────────────────────────────────────────────
const clayNavActive = {
  background: "linear-gradient(135deg, rgba(74,222,128,0.16) 0%, rgba(22,163,74,0.10) 100%)",
  border: "1px solid rgba(74,222,128,0.22)",
  boxShadow: "0 4px 0 rgba(22,163,74,0.35), 0 6px 16px rgba(74,222,128,0.12)",
  borderRadius: 14,
};

const clayLogo = {
  background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
  boxShadow: "0 4px 0 #14532d, 0 6px 16px rgba(74,222,128,0.3)",
  borderRadius: 12,
};

const clayToggleBtn = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 3px 0 rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)",
  borderRadius: 10,
  color: "rgba(255,255,255,0.5)",
  cursor: "pointer",
  transition: "all 0.15s",
};

const clayLogoutCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 4px 0 rgba(0,0,0,0.25), 0 6px 16px rgba(0,0,0,0.15)",
  borderRadius: 14,
  transition: "all 0.15s",
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  const W_OPEN  = 240;
  const W_CLOSE = 64;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 10,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(3px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (sidebarOpen ? W_OPEN : 0) : (sidebarOpen ? W_OPEN : W_CLOSE),
          x: 0,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
        style={{
          position: "fixed", left: 0, top: 0,
          zIndex: 20,
          display: "flex", flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
          background: "linear-gradient(175deg, #0f1923 0%, #0d1520 55%, #0b1219 100%)",
          borderRight: "1px solid rgba(255,255,255,0.055)",
          boxShadow: sidebarOpen
            ? "8px 0 0 rgba(0,0,0,0.18), 12px 0 40px rgba(0,0,0,0.35)"
            : "4px 0 0 rgba(0,0,0,0.12), 6px 0 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Logo row ─────────────────────────────────────────── */}
        <div
          style={{
            height: 64, flexShrink: 0,
            display: "flex", alignItems: "center",
            padding: sidebarOpen ? "0 16px" : "0",
            justifyContent: sidebarOpen ? "space-between" : "center",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          {/* Logo mark */}
<div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", minWidth: 0 }}>
  <motion.div
    whileHover={{ translateY: -2, boxShadow: "0 6px 0 #14532d, 0 8px 20px rgba(74,222,128,0.35)" }}
    whileTap={{ translateY: 3, boxShadow: "0 1px 0 #14532d" }}
    style={{
      width: 34, height: 34, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
      overflow: "hidden",
      ...clayLogo,
    }}
  >
    <img src="/logo.png" alt="DineEat Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </motion.div>

  <motion.div
    animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }}
    transition={{ duration: 0.22, ease: "easeInOut" }}
    style={{ overflow: "hidden", whiteSpace: "nowrap" }}
  >
    <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "0.01em", display: "block", lineHeight: 1.2 }}>
      DineEat
    </span>
    <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em" }}>
      ADMIN PORTAL
    </span>
  </motion.div>
</div>

          {/* Collapse button — desktop only, visible when open */}
          {!isMobile && sidebarOpen && (
            <motion.button
              whileHover={{ translateY: 1 }}
              whileTap={{ translateY: 3, boxShadow: "none" }}
              onClick={() => setSidebarOpen(false)}
              style={{
                width: 28, height: 28, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...clayToggleBtn,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8 2.5L4.5 6.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          )}
        </div>

        {/* Expand button (icon rail) — desktop minimized only */}
        {!isMobile && !sidebarOpen && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, flexShrink: 0 }}>
            <motion.button
              whileHover={{ translateY: 1 }}
              whileTap={{ translateY: 3, boxShadow: "none" }}
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 34, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...clayToggleBtn,
              }}
              title="Expand sidebar"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M5 2.5L8.5 6.5L5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        )}

        {/* ── Nav ──────────────────────────────────────────────── */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "visible", /* ← changed from hidden so the bar isn't clipped */
            padding: "16px 10px 0",
            scrollbarWidth: "none",
          }}
        >
          {menuGroups.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              {/* Group label — only when expanded */}
              <motion.div
                animate={{ opacity: sidebarOpen ? 1 : 0, height: sidebarOpen ? "auto" : 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <span style={{
                  display: "block",
                  fontSize: 9.5, fontWeight: 700,
                  color: "rgba(255,255,255,0.22)",
                  letterSpacing: "0.12em",
                  padding: "0 10px",
                  marginBottom: 4,
                  marginTop: gi > 0 ? 16 : 0,
                }}>
                  {group.label}
                </span>
              </motion.div>

              {/* Divider between groups in icon-rail mode */}
              {!sidebarOpen && gi > 0 && (
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 10px" }} />
              )}

              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.id} href={item.path} style={{ textDecoration: "none" }}>
                    <NavItem item={item} isActive={isActive} sidebarOpen={sidebarOpen} />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom user / logout ─────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          {/* Upgrade Card - Glass morphism with gradient */}
          {sidebarOpen ? (
            <motion.div
              whileHover={{ translateY: -1, boxShadow: "0 6px 0 rgba(74,222,128,0.2), 0 8px 24px rgba(74,222,128,0.12)" }}
              whileTap={{ translateY: 2, boxShadow: "0 1px 0 rgba(74,222,128,0.1)" }}
              onClick={() => router.push("/dashboard/upgrade")}
              style={{
                margin: "0 12px 8px 12px",
                padding: "12px 14px",
                cursor: "pointer",
                background: "linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(22,163,74,0.08) 100%)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(74,222,128,0.15)",
                borderRadius: 14,
                boxShadow: "0 2px 0 rgba(74,222,128,0.15), 0 4px 16px rgba(74,222,128,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #4ade80, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
              }}>
                ⭐
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.3, margin: 0 }}>
                  Upgrade Now
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.2 }}>
                  Get premium features
                </p>
              </div>
              <span style={{ color: "rgba(74,222,128,0.5)", fontSize: 16, lineHeight: 1 }}>→</span>
            </motion.div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <Link href="/dashboard/upgrade">
                <motion.div
                  whileHover={{ translateY: -2, boxShadow: "0 5px 0 rgba(74,222,128,0.2), 0 8px 18px rgba(74,222,128,0.15)" }}
                  whileTap={{ translateY: 2, boxShadow: "0 1px 0 rgba(74,222,128,0.1)" }}
                  title="Upgrade"
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(22,163,74,0.10))",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(74,222,128,0.15)",
                    boxShadow: "0 2px 0 rgba(74,222,128,0.12), 0 4px 12px rgba(74,222,128,0.06)",
                    color: "#4ade80",
                    fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  ⭐
                </motion.div>
              </Link>
            </div>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "0 14px" }} />
          <div style={{ padding: 12 }}>
            {sidebarOpen ? (
              <motion.div
                whileHover={{ translateY: -1, boxShadow: "0 6px 0 rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.18)" }}
                whileTap={{ translateY: 2, boxShadow: "0 1px 0 rgba(0,0,0,0.2)" }}
                onClick={() => router.push("/")}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer", padding: "10px 12px",
                  ...clayLogoutCard,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #4ade80, #16a34a)",
                  boxShadow: "0 2px 0 #14532d, 0 4px 10px rgba(74,222,128,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#052e16", fontWeight: 800, fontSize: 10.5,
                }}>
                  AD
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap" }}>
                    Logout
                  </p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18, lineHeight: 1 }}>↪</span>
              </motion.div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Link href="/">
                  <motion.div
                    whileHover={{ translateY: -2, boxShadow: "0 5px 0 #14532d, 0 8px 18px rgba(74,222,128,0.3)" }}
                    whileTap={{ translateY: 2, boxShadow: "0 1px 0 #14532d" }}
                    title="Logout"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "linear-gradient(135deg, #4ade80, #16a34a)",
                      boxShadow: "0 3px 0 #14532d, 0 5px 14px rgba(74,222,128,0.25)",
                      color: "#052e16", fontWeight: 800, fontSize: 10.5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    AD
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, isActive, sidebarOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={isActive ? { y: 3, boxShadow: "none" } : { scale: 0.97 }}
      style={{
        position: "relative",
        display: "flex", alignItems: "center",
        height: 40, marginBottom: 4,
        padding: sidebarOpen ? "0 12px 0 16px" : "0",
        justifyContent: sidebarOpen ? "flex-start" : "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
        overflow: "visible",
        ...(isActive ? {
          ...clayNavActive,
          ...(hovered ? {
            boxShadow: "0 2px 0 rgba(22,163,74,0.35), 0 3px 8px rgba(74,222,128,0.12)",
            transform: "translateY(2px)",
          } : {}),
        } : {
          background: hovered ? "rgba(255,255,255,0.05)" : "transparent",
          border: "1px solid transparent",
          borderRadius: 14,
          boxShadow: hovered ? "0 2px 0 rgba(0,0,0,0.15)" : "none",
        }),
        transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
      }}
    >
      {/* Icon */}
      <span style={{
        color: isActive ? "#4ade80" : hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.38)",
        transition: "color 0.15s",
        display: "flex", flexShrink: 0,
        filter: isActive ? "drop-shadow(0 0 4px rgba(74,222,128,0.6))" : "none",
      }}>
        {item.icon}
      </span>

      {/* Label — shown when expanded */}
      <motion.div
        animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ overflow: "hidden", whiteSpace: "nowrap" }}
      >
        <span style={{
          fontSize: 13.5,
          fontWeight: isActive ? 700 : 400,
          color: isActive ? "#fff" : hovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.52)",
          transition: "color 0.15s",
        }}>
          {item.label}
        </span>
      </motion.div>
    </motion.div>
  );
}