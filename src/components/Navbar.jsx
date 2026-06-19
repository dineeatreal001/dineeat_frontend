"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Search suggestions data ──────────────────────────────────────────────────
const SEARCH_PAGES = [
  { name: "Dashboard",          path: "/dashboard",                    keywords: ["home", "main", "overview"] },
  { name: "Orders",             path: "/dashboard/orders",             keywords: ["order", "sales", "transactions"] },
  { name: "Live Tracking",      path: "/dashboard/live-tracking",      keywords: ["track", "live", "real-time", "monitor"] },
  { name: "Table Reservations", path: "/dashboard/table-reservations", keywords: ["reservation", "booking", "table", "reserve"] },
  { name: "POS",                path: "/dashboard/pos",                keywords: ["point of sale", "billing", "counter"] },
  { name: "Inventory",          path: "/dashboard/inventory",          keywords: ["stock", "items", "supplies", "ingredients"] },
  { name: "Receipts",           path: "/dashboard/receipt",            keywords: ["bill", "invoice", "receipt", "payment"] },
  { name: "Staff",              path: "/dashboard/staff",              keywords: ["employee", "team", "workers"] },
  { name: "QR Menu",            path: "/dashboard/qr-menu",            keywords: ["qr", "menu", "scan", "code"] },
  { name: "Settings",           path: "/dashboard/settings",           keywords: ["config", "preferences", "setup"] },
];

// ─── Notification data ────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, type: "order",   message: "New order from Spice Villa",       sub: "ORD-006 · ₹2,840",      time: "2 min ago",  read: false },
  { id: 2, type: "alert",   message: "Low inventory: Rice stock critical",sub: "Inventory alert",        time: "15 min ago", read: false },
  { id: 3, type: "payment", message: "Payment received successfully",    sub: "₹2,450 · Rajesh Kumar",  time: "1 hr ago",   read: true  },
  { id: 4, type: "hotel",   message: "New hotel registration request",   sub: "Pending approval",        time: "3 hrs ago",  read: true  },
];

const NOTIF_ICONS = { order: "🛵", alert: "⚠️", payment: "💳", hotel: "🏨" };

// ─── Outside click hook ───────────────────────────────────────────────────────
function useOutsideClose(refs, onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (refs.every((r) => r.current && !r.current.contains(e.target))) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs, onClose]);
}

// ─── Clay tokens ──────────────────────────────────────────────────────────────
const clayIconBtn = (active) => ({
  width: 36, height: 36,
  background: active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
  border: active ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.09)",
  boxShadow: active
    ? "0 4px 0 rgba(22,163,74,0.4), 0 6px 14px rgba(74,222,128,0.18)"
    : "0 4px 0 rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.18)",
  borderRadius: 12,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s",
  position: "relative",
});

const clayDropdown = {
  background: "linear-gradient(160deg, #141e2a 0%, #0f1923 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  boxShadow: "0 8px 0 rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
  overflow: "hidden",
  zIndex: 50,
};

const clayProfileBtn = (active) => ({
  height: 42,
  background: active ? "rgba(74,222,128,0.09)" : "rgba(255,255,255,0.05)",
  border: active ? "1px solid rgba(74,222,128,0.22)" : "1px solid rgba(255,255,255,0.08)",
  boxShadow: active
    ? "0 4px 0 rgba(22,163,74,0.35), 0 6px 16px rgba(74,222,128,0.15)"
    : "0 4px 0 rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.15)",
  borderRadius: 14,
  display: "flex", alignItems: "center", gap: 8,
  padding: "0 10px",
  cursor: "pointer",
  transition: "all 0.15s",
});

const clayAvatar = {
  width: 28, height: 28, borderRadius: "50%",
  background: "linear-gradient(135deg, #4ade80, #16a34a)",
  boxShadow: "0 2px 0 #14532d, 0 4px 10px rgba(74,222,128,0.25)",
  color: "#052e16", fontWeight: 800, fontSize: 10.5,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

const clayNotifItem = (unread) => ({
  padding: "11px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  background: unread ? "rgba(74,222,128,0.05)" : "transparent",
  display: "flex", gap: 11, alignItems: "flex-start",
  cursor: "pointer", transition: "background 0.15s",
});

const clayMenuItemBase = {
  width: "100%", textAlign: "left",
  padding: "8px 10px",
  background: "transparent", border: "none",
  fontSize: 13, borderRadius: 11,
  cursor: "pointer",
  display: "flex", alignItems: "center", gap: 10,
  transition: "background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.15s",
  textDecoration: "none",
};

// ─── Dropdown shell ───────────────────────────────────────────────────────────
function Dropdown({ children, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", ...clayDropdown, ...style }}
    >
      {children}
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({ sidebarOpen, setSidebarOpen, storeData }) {
  const router = useRouter();
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportW, setViewportW] = useState(1200);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setViewportW(w);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useOutsideClose([notifRef],   () => setShowNotif(false));
  useOutsideClose([profileRef], () => setShowProfile(false));
  useOutsideClose([searchRef],  () => { setShowSuggestions(false); setSelectedIdx(-1); });

  // Ctrl+D shortcut to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  const hotelName = storeData?.companyName || storeData?.name || "DineEat";
  const userRole  = "Admin";

  const filteredSuggestions = searchQuery.trim()
    ? SEARCH_PAGES.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);
    setShowSuggestions(v.trim().length > 0);
    setSelectedIdx(-1);
  };

  const handleSuggestionSelect = (page) => {
    router.push(page.path);
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIdx(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || !filteredSuggestions.length) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setSelectedIdx((p) => Math.min(p + 1, filteredSuggestions.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setSelectedIdx((p) => Math.max(p - 1, -1)); }
    if (e.key === "Enter")      { e.preventDefault(); handleSuggestionSelect(filteredSuggestions[selectedIdx >= 0 ? selectedIdx : 0]); }
    if (e.key === "Escape")     { setShowSuggestions(false); setSelectedIdx(-1); inputRef.current?.blur(); }
    if (e.key === "Tab" && selectedIdx >= 0) { e.preventDefault(); handleSuggestionSelect(filteredSuggestions[selectedIdx]); }
  };

  // Sidebar width for navbar left offset
  const W_SIDEBAR = isMobile ? 0 : (sidebarOpen ? 240 : 64);
  // Dropdown max width capped to viewport
  const dropdownW = Math.min(320, viewportW - 40);
  // Search width
  const searchW = searchFocus ? 280 : 200;

  return (
    <motion.nav
      animate={{ left: W_SIDEBAR }}
      transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
      style={{
        position: "fixed", right: 0, top: 0, zIndex: 10,
        display: "flex", alignItems: "center",
        height: 64,
        background: "linear-gradient(90deg, #0f1923 0%, #0d1520 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 28px rgba(0,0,0,0.3)",
        paddingLeft: 16, paddingRight: 16,
        gap: 10,
      }}
    >
      {/* ── Hamburger (mobile only) ─────────────────────────────── */}
      {isMobile && (
        <motion.button
          whileHover={{ y: 1 }}
          whileTap={{ y: 3, boxShadow: "none" }}
          onClick={() => setSidebarOpen((p) => !p)}
          style={{
            flexShrink: 0,
            width: 36, height: 36,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 3px 0 rgba(0,0,0,0.25), 0 5px 12px rgba(0,0,0,0.18)",
            borderRadius: 11,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </motion.button>
      )}

      {/* ── Page title + date (desktop only) ───────────────────── */}
      {!isMobile && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Dashboard</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 1 }}>{today}</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Search (hidden on mobile) ───────────────────────────── */}
      {!isMobile && (
        <div ref={searchRef} style={{ position: "relative", flexShrink: 0 }}>
          <motion.div animate={{ width: searchW }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages... (Ctrl+D)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { setSearchFocus(true); if (searchQuery.trim()) setShowSuggestions(true); }}
                onBlur={() => setSearchFocus(false)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%", height: 36,
                  background: searchFocus ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                  border: searchFocus ? "1px solid rgba(74,222,128,0.45)" : "1px solid rgba(255,255,255,0.09)",
                  boxShadow: searchFocus
                    ? "0 4px 0 rgba(22,163,74,0.25), 0 6px 16px rgba(74,222,128,0.12)"
                    : "0 3px 0 rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 13,
                  paddingLeft: 36, paddingRight: searchQuery ? 32 : 40,
                  outline: "none", transition: "all 0.2s",
                }}
              />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <path d="M9.5 9.5L12 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {searchQuery ? (
                <button
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); inputRef.current?.focus(); }}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                    cursor: "pointer", fontSize: 13, display: "flex",
                  }}
                >✕</button>
              ) : (
                <div style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace",
                  letterSpacing: "0.5px", pointerEvents: "none",
                }}>⌘D</div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <Dropdown style={{ width: searchW, left: 0, right: "auto" }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Pages
                  </span>
                </div>
                {filteredSuggestions.map((page, idx) => (
                  <motion.button
                    key={page.path}
                    whileHover={{ background: "rgba(255,255,255,0.06)" }}
                    onClick={() => handleSuggestionSelect(page)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 14px",
                      background: selectedIdx === idx ? "rgba(255,255,255,0.06)" : "transparent",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{page.name}</p>
                      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)" }}>{page.path}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>↵</span>
                  </motion.button>
                ))}
                <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>↑ ↓ navigate · Enter go · Esc close</p>
                </div>
              </Dropdown>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Divider (desktop only) */}
      {!isMobile && (
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
      )}

      {/* ── Notifications ───────────────────────────────────────── */}
      <div ref={notifRef} style={{ position: "relative", flexShrink: 0 }}>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ y: 3, boxShadow: "none" }}
          onClick={() => { setShowNotif((p) => !p); setShowProfile(false); }}
          style={clayIconBtn(showNotif)}
        >
          <BellIcon />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              width: 16, height: 16,
              background: "linear-gradient(135deg, #f87171, #dc2626)",
              boxShadow: "0 2px 0 #991b1b, 0 3px 8px rgba(239,68,68,0.4)",
              color: "#fff", fontSize: 8, fontWeight: 800,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #0d1520",
            }}>
              {unread}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotif && (
            <Dropdown style={{ width: dropdownW }}>
              <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>Notifications</span>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={markAllRead}
                  style={{
                    fontSize: 11, color: "#4ade80", fontWeight: 700,
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    boxShadow: "0 2px 0 rgba(22,163,74,0.3)",
                    borderRadius: 8, padding: "3px 8px", cursor: "pointer",
                  }}
                >
                  Mark all read
                </motion.button>
              </div>

              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifs.map((n) => (
                  <motion.div
                    key={n.id}
                    whileHover={{ background: "rgba(255,255,255,0.05)" }}
                    style={clayNotifItem(!n.read)}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>
                      {NOTIF_ICONS[n.type]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: n.read ? 400 : 600, color: n.read ? "rgba(255,255,255,0.5)" : "#fff", marginBottom: 2 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)" }}>{n.sub}</p>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", whiteSpace: "nowrap", flexShrink: 0, paddingTop: 1 }}>
                      {n.time}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                <motion.button
                  whileHover={{ color: "#86efac" }}
                  style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                >
                  View all notifications →
                </motion.button>
              </div>
            </Dropdown>
          )}
        </AnimatePresence>
      </div>

      {/* ── Profile ─────────────────────────────────────────────── */}
      <div ref={profileRef} style={{ position: "relative", flexShrink: 0 }}>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ y: 3, boxShadow: "none" }}
          onClick={() => { setShowProfile((p) => !p); setShowNotif(false); }}
          style={clayProfileBtn(showProfile)}
        >
          <div style={clayAvatar}>{hotelName.charAt(0).toUpperCase()}</div>
          {/* Name + role — desktop only */}
          {!isMobile && (
            <>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", lineHeight: 1.25, whiteSpace: "nowrap" }}>{hotelName}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", whiteSpace: "nowrap" }}>{userRole}</p>
              </div>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ color: "rgba(255,255,255,0.32)" }}>
                <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {showProfile && (
            <Dropdown style={{ width: Math.min(218, viewportW - 40) }}>
              <div style={{
                padding: "14px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: 11, alignItems: "center",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #4ade80, #16a34a)",
                  boxShadow: "0 3px 0 #14532d, 0 5px 14px rgba(74,222,128,0.28)",
                  color: "#052e16", fontWeight: 800, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{hotelName.charAt(0).toUpperCase()}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{hotelName}</p>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)" }}>{userRole}</p>
                </div>
              </div>

              <div style={{ padding: "6px" }}>
                {[
                  { label: "Profile Settings", icon: <SettingsMenuIcon /> },
                  { label: "Billing",          icon: <BillingIcon /> },
                  { label: "Support",          icon: <SupportIcon /> },
                ].map(({ label, icon }) => (
                  <ProfileMenuItem key={label} icon={icon} label={label} />
                ))}
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "5px 0" }} />
                <ProfileMenuItem icon={<LogoutIcon />} label="Logout" danger href="/" />
              </div>
            </Dropdown>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// ─── ProfileMenuItem ──────────────────────────────────────────────────────────
function ProfileMenuItem({ icon, label, danger, href }) {
  const El = href ? "a" : "button";
  return (
    <El
      href={href}
      style={{ ...clayMenuItemBase, color: danger ? "#f87171" : "rgba(255,255,255,0.58)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "rgba(248,113,113,0.09)" : "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = danger ? "#f87171" : "#fff";
        e.currentTarget.style.boxShadow = danger ? "0 2px 0 rgba(185,28,28,0.3)" : "0 2px 0 rgba(0,0,0,0.2)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "#f87171" : "rgba(255,255,255,0.58)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "none"; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    >
      <span style={{ opacity: 0.75, display: "flex" }}>{icon}</span>
      {label}
    </El>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2C5.79 2 4 3.79 4 6v3.5L2.5 11h11L12 9.5V6c0-2.21-1.79-4-4-4z"
        stroke="rgba(255,255,255,0.65)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 12.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5"
        stroke="rgba(255,255,255,0.65)" strokeWidth="1.3"/>
    </svg>
  );
}
function SettingsMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M11.07 2.93L10.01 3.99M3.99 10.01L2.93 11.07"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 9h2M9 9h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function SupportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 5.5c0-1.1 1.34-2 2.5-2s2.5.9 2.5 2c0 1.1-1.12 1.67-2 2-.89.33-1.5.83-1.5 1.5M7 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2.5H2.5c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5h2.5M9.5 4.5L12 7l-2.5 2.5M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}