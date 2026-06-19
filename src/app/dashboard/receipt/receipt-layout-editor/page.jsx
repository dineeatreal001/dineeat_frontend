"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// ─── Clay Design Tokens ────────────────────────────────────────────────────────
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    ghost:
      "bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-[0_4px_0_#9ca3af,0_6px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_0_#9ca3af,0_3px_6px_rgba(0,0,0,0.06)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150",
    danger:
      "bg-red-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#b91c1c,0_8px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_3px_0_#b91c1c,0_4px_8px_rgba(239,68,68,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  input:
    "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
};

// ─── Layout Templates ──────────────────────────────────────────────────────────
const LAYOUTS = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional receipt layout with centered header",
    icon: "🧾",
    thumbnail: "classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean boxed layout with section dividers",
    icon: "✨",
    thumbnail: "modern",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Minimal layout for quick bills",
    icon: "⚡",
    thumbnail: "compact",
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Full info layout with logo area",
    icon: "📋",
    thumbnail: "detailed",
  },
];

const FONT_OPTIONS = [
  { value: "'Courier New', monospace", label: "Courier New (Classic)" },
  { value: "'Arial', sans-serif", label: "Arial (Clean)" },
  { value: "'Georgia', serif", label: "Georgia (Elegant)" },
  { value: "'Helvetica', sans-serif", label: "Helvetica (Modern)" },
  { value: "'Times New Roman', serif", label: "Times New Roman (Formal)" },
];

const FONT_SIZES = [
  { value: "10px", label: "XS (10px)" },
  { value: "11px", label: "SM (11px)" },
  { value: "12px", label: "MD (12px) — Default" },
  { value: "13px", label: "LG (13px)" },
  { value: "14px", label: "XL (14px)" },
];

// ─── Default Config ────────────────────────────────────────────────────────────
const defaultConfig = {
  restaurantName: "DineEat Restaurant",
  tagline: "Fine Dining Experience",
  address: "123 Restaurant Street, Food City",
  phone: "+91 98765 43210",
  gst: "27AAABC1234D1Z",
  footerLine1: "Thank you for dining with us!",
  footerLine2: "Visit again soon!",
  footerLine3: "Powered by DineEat POS",
  showLogo: false,
  logoUrl: "",
  showGST: true,
  showTagline: true,
  showTableInfo: true,
  showFooter: true,
  font: "'Courier New', monospace",
  fontSize: "12px",
  headerAlign: "center",
  showOrderType: true,
  showPhone: true,
  taxLabel: "GST (5%)",
  taxRate: 5,
  currencySymbol: "₹",
};

// ─── Receipt Preview Components ───────────────────────────────────────────────
const sampleReceipt = {
  orderNumber: "ORD-2024-0042",
  customer: "Rahul Sharma",
  phone: "+91 98765 43210",
  tableId: "T-05",
  mode: "dine_in",
  createdAt: new Date().toISOString(),
  status: "Completed",
  paymentStatus: "Paid",
  items: [
    { name: "Butter Chicken", qty: 2, price: 320 },
    { name: "Garlic Naan", qty: 4, price: 60 },
    { name: "Mango Lassi", qty: 2, price: 120 },
    { name: "Gulab Jamun", qty: 1, price: 80 },
  ],
};

function ClassicPreview({ cfg, mini = false }) {
  const subtotal = sampleReceipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * (cfg.taxRate / 100));
  const total = subtotal + tax;
  const scale = mini ? 0.52 : 1;
  return (
    <div
      style={{
        fontFamily: cfg.font,
        fontSize: cfg.fontSize,
        width: "300px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        background: "white",
        padding: "16px",
        color: "#111",
        lineHeight: 1.5,
      }}
    >
      {cfg.showLogo && cfg.logoUrl && (
        <div style={{ textAlign: "center", marginBottom: "8px", display: "flex", justifyContent: "center" }}>
          <img src={cfg.logoUrl} alt="logo" style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain", display: "block", margin: "0 auto" }} />
        </div>
      )}
      <div style={{ textAlign: cfg.headerAlign, borderBottom: "1px dashed #999", paddingBottom: "8px", marginBottom: "8px" }}>
        <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>{cfg.restaurantName}</div>
        {cfg.showTagline && <div style={{ fontSize: "0.9em", opacity: 0.7 }}>{cfg.tagline}</div>}
        <div style={{ fontSize: "0.85em", marginTop: "4px" }}>{cfg.address}</div>
        {cfg.showPhone && <div style={{ fontSize: "0.85em" }}>Ph: {cfg.phone}</div>}
        {cfg.showGST && <div style={{ fontSize: "0.85em" }}>GST: {cfg.gst}</div>}
        <div style={{ marginTop: "6px", fontSize: "0.85em", opacity: 0.7 }}>
          {new Date(sampleReceipt.createdAt).toLocaleString()}
        </div>
        <div style={{ fontWeight: "bold" }}>Order: {sampleReceipt.orderNumber}</div>
      </div>
      <div style={{ marginBottom: "8px", fontSize: "0.9em" }}>
        <div><b>Customer:</b> {sampleReceipt.customer}</div>
        {cfg.showPhone && <div><b>Phone:</b> {sampleReceipt.phone}</div>}
        {cfg.showTableInfo && sampleReceipt.tableId && <div><b>Table:</b> {sampleReceipt.tableId}</div>}
        {cfg.showOrderType && <div><b>Type:</b> {sampleReceipt.mode.toUpperCase().replace("_", " ")}</div>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em", marginBottom: "8px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #999" }}>
            <th style={{ textAlign: "left", padding: "3px 0" }}>Item</th>
            <th style={{ textAlign: "center", padding: "3px 0" }}>Qty</th>
            <th style={{ textAlign: "right", padding: "3px 0" }}>Rate</th>
            <th style={{ textAlign: "right", padding: "3px 0" }}>Amt</th>
           </tr>
        </thead>
        <tbody>
          {sampleReceipt.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px dotted #ccc" }}>
              <td style={{ padding: "3px 0" }}>{item.name}</td>
              <td style={{ textAlign: "center", padding: "3px 0" }}>{item.qty}</td>
              <td style={{ textAlign: "right", padding: "3px 0" }}>{cfg.currencySymbol}{item.price}</td>
              <td style={{ textAlign: "right", padding: "3px 0" }}>{cfg.currencySymbol}{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: "1px dashed #999", paddingTop: "8px", fontSize: "0.9em" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{cfg.currencySymbol}{subtotal}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>{cfg.taxLabel}</span><span>{cfg.currencySymbol}{tax}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1em", marginTop: "4px", borderTop: "1px dashed #999", paddingTop: "4px" }}>
          <span>TOTAL</span><span>{cfg.currencySymbol}{total}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", opacity: 0.7 }}><span>Payment</span><span>{sampleReceipt.paymentStatus}</span></div>
      </div>
      {cfg.showFooter && (
        <div style={{ textAlign: "center", borderTop: "1px dashed #999", paddingTop: "8px", marginTop: "8px", fontSize: "0.85em", opacity: 0.8 }}>
          <div>{cfg.footerLine1}</div>
          <div>{cfg.footerLine2}</div>
          <div style={{ opacity: 0.6, marginTop: "4px" }}>{cfg.footerLine3}</div>
        </div>
      )}
    </div>
  );
}

function ModernPreview({ cfg, mini = false }) {
  const subtotal = sampleReceipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * (cfg.taxRate / 100));
  const total = subtotal + tax;
  const scale = mini ? 0.52 : 1;
  return (
    <div
      style={{
        fontFamily: cfg.font,
        fontSize: cfg.fontSize,
        width: "300px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        background: "white",
        color: "#111",
        lineHeight: 1.5,
      }}
    >
      <div style={{ background: "#111", color: "white", padding: "14px 16px", textAlign: "center" }}>
        {cfg.showLogo && cfg.logoUrl ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
            <img src={cfg.logoUrl} alt="logo" style={{ maxHeight: "40px", maxWidth: "100px", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{ fontSize: "1.5em", fontWeight: "bold", letterSpacing: "0.05em" }}>{cfg.restaurantName}</div>
        )}
        {cfg.showTagline && <div style={{ fontSize: "0.8em", opacity: 0.7, marginTop: "2px" }}>{cfg.tagline}</div>}
      </div>
      <div style={{ padding: "10px 16px", background: "#f5f5f5", fontSize: "0.82em", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
        <div>{cfg.address}</div>
        {cfg.showPhone && <div>{cfg.phone}</div>}
        {cfg.showGST && <div>GST: {cfg.gst}</div>}
      </div>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", fontSize: "1em" }}>{sampleReceipt.orderNumber}</span>
          <span style={{ fontSize: "0.8em", opacity: 0.6 }}>{new Date(sampleReceipt.createdAt).toLocaleString()}</span>
        </div>
        <div style={{ marginTop: "6px", fontSize: "0.88em", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          <div><span style={{ opacity: 0.5 }}>Customer: </span>{sampleReceipt.customer}</div>
          {cfg.showPhone && <div><span style={{ opacity: 0.5 }}>Phone: </span>{sampleReceipt.phone}</div>}
          {cfg.showTableInfo && <div><span style={{ opacity: 0.5 }}>Table: </span>{sampleReceipt.tableId}</div>}
          {cfg.showOrderType && <div><span style={{ opacity: 0.5 }}>Type: </span>{sampleReceipt.mode.replace("_", " ")}</div>}
        </div>
      </div>
      <div style={{ padding: "10px 16px" }}>
        {sampleReceipt.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f0f0", fontSize: "0.88em" }}>
            <span>{item.name} <span style={{ opacity: 0.5 }}>×{item.qty}</span></span>
            <span style={{ fontWeight: "500" }}>{cfg.currencySymbol}{item.price * item.qty}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 16px", background: "#f9f9f9", borderTop: "2px solid #111", fontSize: "0.88em" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.6 }}>Subtotal</span><span>{cfg.currencySymbol}{subtotal}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ opacity: 0.6 }}>{cfg.taxLabel}</span><span>{cfg.currencySymbol}{tax}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 2px", fontWeight: "bold", fontSize: "1.1em", borderTop: "1px solid #ccc", marginTop: "4px" }}>
          <span>TOTAL</span><span>{cfg.currencySymbol}{total}</span>
        </div>
      </div>
      {cfg.showFooter && (
        <div style={{ textAlign: "center", padding: "10px 16px", fontSize: "0.82em", opacity: 0.7 }}>
          <div>{cfg.footerLine1}</div>
          <div style={{ opacity: 0.8 }}>{cfg.footerLine2}</div>
          <div style={{ marginTop: "4px", opacity: 0.5 }}>{cfg.footerLine3}</div>
        </div>
      )}
    </div>
  );
}

function CompactPreview({ cfg, mini = false }) {
  const subtotal = sampleReceipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * (cfg.taxRate / 100));
  const total = subtotal + tax;
  const scale = mini ? 0.52 : 1;
  return (
    <div
      style={{
        fontFamily: cfg.font,
        fontSize: cfg.fontSize,
        width: "280px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        background: "white",
        padding: "12px",
        color: "#111",
        lineHeight: 1.4,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        {cfg.showLogo && cfg.logoUrl ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <img src={cfg.logoUrl} alt="logo" style={{ maxHeight: "36px", maxWidth: "100px", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <b style={{ fontSize: "1.15em" }}>{cfg.restaurantName}</b>
        )}
        <div style={{ fontSize: "0.8em", opacity: 0.6 }}>{cfg.address} | {cfg.phone}</div>
      </div>
      <div style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "4px 0", margin: "4px 0", fontSize: "0.85em" }}>
        <span style={{ fontWeight: "bold" }}>{sampleReceipt.orderNumber}</span>
        <span style={{ float: "right", opacity: 0.6 }}>{new Date(sampleReceipt.createdAt).toLocaleDateString()}</span>
        <div style={{ clear: "both" }} />
        <span>{sampleReceipt.customer}</span>
        {cfg.showTableInfo && <span style={{ float: "right", opacity: 0.7 }}>Tbl: {sampleReceipt.tableId}</span>}
        <div style={{ clear: "both" }} />
      </div>
      {sampleReceipt.items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88em", padding: "2px 0" }}>
          <span>{item.qty}x {item.name}</span>
          <span>{cfg.currencySymbol}{item.price * item.qty}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px dashed #999", marginTop: "6px", paddingTop: "4px", fontSize: "0.88em" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sub</span><span>{cfg.currencySymbol}{subtotal}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax</span><span>{cfg.currencySymbol}{tax}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px dashed #999", paddingTop: "3px", marginTop: "3px" }}>
          <span>TOTAL</span><span>{cfg.currencySymbol}{total}</span>
        </div>
      </div>
      {cfg.showFooter && <div style={{ textAlign: "center", fontSize: "0.8em", opacity: 0.6, marginTop: "6px" }}>{cfg.footerLine1}</div>}
    </div>
  );
}

function DetailedPreview({ cfg, mini = false }) {
  const subtotal = sampleReceipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * (cfg.taxRate / 100));
  const total = subtotal + tax;
  const scale = mini ? 0.52 : 1;
  return (
    <div
      style={{
        fontFamily: cfg.font,
        fontSize: cfg.fontSize,
        width: "320px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        background: "white",
        color: "#111",
        lineHeight: 1.5,
        border: "1px solid #eee",
      }}
    >
      <div style={{ borderBottom: "3px double #999", padding: "14px 16px", textAlign: "center" }}>
        {cfg.showLogo && cfg.logoUrl ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <img src={cfg.logoUrl} alt="logo" style={{ maxHeight: "56px", maxWidth: "140px", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{ width: "72px", height: "72px", background: "#f5f5f5", border: "1px dashed #ccc", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7em", opacity: 0.5, marginBottom: "8px" }}>LOGO</div>
        )}
        <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>{cfg.restaurantName}</div>
        {cfg.showTagline && <div style={{ fontStyle: "italic", opacity: 0.7, fontSize: "0.88em" }}>{cfg.tagline}</div>}
        <div style={{ marginTop: "6px", fontSize: "0.82em", opacity: 0.8 }}>
          <div>{cfg.address}</div>
          {cfg.showPhone && <div>Tel: {cfg.phone}</div>}
          {cfg.showGST && <div>GSTIN: {cfg.gst}</div>}
        </div>
      </div>
      <div style={{ padding: "8px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: "0.82em", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ opacity: 0.5, fontSize: "0.85em", textTransform: "uppercase" }}>Invoice No</div>
          <div style={{ fontWeight: "bold" }}>{sampleReceipt.orderNumber}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ opacity: 0.5, fontSize: "0.85em", textTransform: "uppercase" }}>Date & Time</div>
          <div>{new Date(sampleReceipt.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <div style={{ padding: "8px 16px", fontSize: "0.85em", borderBottom: "1px solid #eee", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        <div><div style={{ opacity: 0.5, textTransform: "uppercase", fontSize: "0.82em" }}>Customer</div><div style={{ fontWeight: "500" }}>{sampleReceipt.customer}</div></div>
        {cfg.showPhone && <div><div style={{ opacity: 0.5, textTransform: "uppercase", fontSize: "0.82em" }}>Phone</div><div>{sampleReceipt.phone}</div></div>}
        {cfg.showTableInfo && <div><div style={{ opacity: 0.5, textTransform: "uppercase", fontSize: "0.82em" }}>Table</div><div>{sampleReceipt.tableId}</div></div>}
        {cfg.showOrderType && <div><div style={{ opacity: 0.5, textTransform: "uppercase", fontSize: "0.82em" }}>Order Type</div><div>{sampleReceipt.mode.replace("_", " ").toUpperCase()}</div></div>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85em" }}>
        <thead>
          <tr style={{ background: "#111", color: "white" }}>
            <th style={{ padding: "6px 16px", textAlign: "left", fontWeight: "500" }}>Description</th>
            <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "500" }}>Qty</th>
            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: "500" }}>Unit</th>
            <th style={{ padding: "6px 16px", textAlign: "right", fontWeight: "500" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sampleReceipt.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
              <td style={{ padding: "5px 16px" }}>{item.name}</td>
              <td style={{ padding: "5px 8px", textAlign: "center" }}>{item.qty}</td>
              <td style={{ padding: "5px 8px", textAlign: "right" }}>{cfg.currencySymbol}{item.price}</td>
              <td style={{ padding: "5px 16px", textAlign: "right", fontWeight: "500" }}>{cfg.currencySymbol}{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "10px 16px", borderTop: "2px solid #111", fontSize: "0.88em" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", opacity: 0.7 }}><span>Subtotal</span><span>{cfg.currencySymbol}{subtotal}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", opacity: 0.7 }}><span>{cfg.taxLabel}</span><span>{cfg.currencySymbol}{tax}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.15em", borderTop: "1px dashed #ccc", marginTop: "6px", paddingTop: "6px" }}>
          <span>Grand Total</span><span>{cfg.currencySymbol}{total}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.9em", opacity: 0.7 }}>
          <span>Payment Status</span><span style={{ fontWeight: "500" }}>{sampleReceipt.paymentStatus}</span>
        </div>
      </div>
      {cfg.showFooter && (
        <div style={{ background: "#fafafa", borderTop: "3px double #999", textAlign: "center", padding: "10px 16px", fontSize: "0.82em" }}>
          <div style={{ fontStyle: "italic" }}>{cfg.footerLine1}</div>
          <div style={{ opacity: 0.7 }}>{cfg.footerLine2}</div>
          <div style={{ opacity: 0.5, marginTop: "4px" }}>{cfg.footerLine3}</div>
        </div>
      )}
    </div>
  );
}
const PREVIEW_COMPONENTS = {
  classic: ClassicPreview,
  modern: ModernPreview,
  compact: CompactPreview,
  detailed: DetailedPreview,
};

// ─── Layout Thumbnail ────────────────────────────────────────────────────────────
function LayoutThumbnail({ layoutId, cfg, isSelected, onSelect }) {
  const Preview = PREVIEW_COMPONENTS[layoutId];
  const layout = LAYOUTS.find((l) => l.id === layoutId);
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected
          ? "border-[#a3e635] shadow-[0_6px_0_#6aaa00,0_8px_24px_rgba(163,230,53,0.3)]"
          : "border-gray-200 shadow-[0_4px_0_#e5e7eb] hover:border-gray-300"
      }`}
      style={{ height: "240px" }}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-[#a3e635] text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
          ✓ Active
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden bg-white flex items-start justify-center pt-2">
        <Preview cfg={cfg} mini={true} />
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-6 pb-3 px-3">
        <p className="text-sm font-bold text-gray-800">{layout.name}</p>
        <p className="text-xs text-gray-400">{layout.description}</p>
      </div>
    </div>
  );
}

// ─── Section Label ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-5 first:mt-0">
      {children}
    </p>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#a3e635] shadow-[0_2px_0_#6aaa00]" : "bg-gray-200 shadow-[0_2px_0_#d1d5db]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

// ─── Edit Panel Component ───────────────────────────────────────────────────
function EditPanel({ config, updateConfig, activeTab, setActiveTab, logoPreview, fileInputRef, handleLogoUpload, removeLogo, resetToDefaults, handleSave, saved }) {
  const tabs = [
    { id: "branding", label: "🏪 Branding" },
    { id: "content", label: "📝 Content" },
    { id: "typography", label: "🔤 Typography" },
    { id: "taxes", label: "💰 Taxes" },
  ];

  return (
    <div className={clay.card + " overflow-hidden"}>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 px-2 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-[#a3e635] text-gray-900 bg-[#f9fff0]"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 max-h-[540px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Branding Tab */}
          {activeTab === "branding" && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SectionLabel>Restaurant Identity</SectionLabel>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Restaurant Name</label>
                  <input
                    type="text"
                    value={config.restaurantName}
                    onChange={(e) => updateConfig("restaurantName", e.target.value)}
                    className={clay.input}
                    placeholder="Your Restaurant Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={config.tagline}
                    onChange={(e) => updateConfig("tagline", e.target.value)}
                    className={clay.input}
                    placeholder="Fine Dining Experience"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Address</label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => updateConfig("address", e.target.value)}
                    className={clay.input}
                    placeholder="123 Street, City"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => updateConfig("phone", e.target.value)}
                    className={clay.input}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">GST Number</label>
                  <input
                    type="text"
                    value={config.gst}
                    onChange={(e) => updateConfig("gst", e.target.value)}
                    className={clay.input}
                    placeholder="27AAABC1234D1Z"
                  />
                </div>
              </div>

              <SectionLabel>Logo</SectionLabel>
              <div className="space-y-3">
                {logoPreview ? (
                  <div className="relative rounded-2xl border-2 border-gray-200 p-3 bg-gray-50 flex items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-12 w-24 object-contain rounded-lg bg-white border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">Logo uploaded</p>
                      <p className="text-xs text-gray-400">Shown on receipt header</p>
                    </div>
                    <button
                      onClick={removeLogo}
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors text-sm flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-[#a3e635] hover:bg-[#f9fff0] transition-all group"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</div>
                    <p className="text-sm font-semibold text-gray-600">Upload Logo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG · Max 500KB</p>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                {logoPreview && (
                  <Toggle
                    checked={config.showLogo}
                    onChange={(v) => updateConfig("showLogo", v)}
                    label="Show logo on receipt"
                  />
                )}
              </div>

              <SectionLabel>Header Alignment</SectionLabel>
              <div className="flex gap-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateConfig("headerAlign", align)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                      config.headerAlign === align
                        ? "border-[#a3e635] bg-[#f0ffc0] text-gray-800 shadow-[0_3px_0_#6aaa00]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {align === "left" ? "⬅ Left" : align === "center" ? "↔ Center" : "Right ➡"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SectionLabel>Visible Fields</SectionLabel>
              <div className="bg-gray-50 rounded-2xl px-3 divide-y divide-gray-100">
                <Toggle checked={config.showTagline} onChange={(v) => updateConfig("showTagline", v)} label="Show tagline" />
                <Toggle checked={config.showGST} onChange={(v) => updateConfig("showGST", v)} label="Show GST number" />
                <Toggle checked={config.showPhone} onChange={(v) => updateConfig("showPhone", v)} label="Show phone number" />
                <Toggle checked={config.showTableInfo} onChange={(v) => updateConfig("showTableInfo", v)} label="Show table number" />
                <Toggle checked={config.showOrderType} onChange={(v) => updateConfig("showOrderType", v)} label="Show order type" />
                <Toggle checked={config.showFooter} onChange={(v) => updateConfig("showFooter", v)} label="Show footer section" />
              </div>

              <SectionLabel>Footer Text</SectionLabel>
              <div className="space-y-2">
                <input
                  type="text"
                  value={config.footerLine1}
                  onChange={(e) => updateConfig("footerLine1", e.target.value)}
                  className={clay.input}
                  placeholder="Footer line 1"
                />
                <input
                  type="text"
                  value={config.footerLine2}
                  onChange={(e) => updateConfig("footerLine2", e.target.value)}
                  className={clay.input}
                  placeholder="Footer line 2"
                />
                <input
                  type="text"
                  value={config.footerLine3}
                  onChange={(e) => updateConfig("footerLine3", e.target.value)}
                  className={clay.input}
                  placeholder="Footer line 3 (e.g. Powered by...)"
                />
              </div>
            </motion.div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <motion.div
              key="typography"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SectionLabel>Font Family</SectionLabel>
              <div className="space-y-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => updateConfig("font", f.value)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm transition-all ${
                      config.font === f.value
                        ? "border-[#a3e635] bg-[#f0ffc0] font-semibold shadow-[0_3px_0_#6aaa00]"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <SectionLabel>Font Size</SectionLabel>
              <div className="space-y-2">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateConfig("fontSize", s.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl border-2 text-sm transition-all ${
                      config.fontSize === s.value
                        ? "border-[#a3e635] bg-[#f0ffc0] font-semibold shadow-[0_3px_0_#6aaa00]"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span style={{ fontSize: s.value, fontFamily: config.font }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Taxes Tab */}
          {activeTab === "taxes" && (
            <motion.div
              key="taxes"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SectionLabel>Tax Settings</SectionLabel>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Tax Label (shown on receipt)</label>
                  <input
                    type="text"
                    value={config.taxLabel}
                    onChange={(e) => updateConfig("taxLabel", e.target.value)}
                    className={clay.input}
                    placeholder="GST (5%)"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Tax Rate (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="28"
                      step="0.5"
                      value={config.taxRate}
                      onChange={(e) => updateConfig("taxRate", parseFloat(e.target.value))}
                      className="flex-1 accent-[#a3e635]"
                    />
                    <span className="w-14 text-right text-sm font-bold text-gray-700 bg-gray-100 rounded-xl px-2 py-1">
                      {config.taxRate}%
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    {[0, 5, 12, 18, 28].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateConfig("taxRate", r)}
                        className={`text-xs px-2 py-1 rounded-lg transition-all ${
                          config.taxRate === r ? "bg-[#a3e635] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Currency Symbol</label>
                  <div className="flex gap-2 flex-wrap">
                    {["₹", "$", "€", "£", "¥"].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => updateConfig("currencySymbol", sym)}
                        className={`w-10 h-10 rounded-xl border-2 font-bold text-lg transition-all ${
                          config.currencySymbol === sym
                            ? "border-[#a3e635] bg-[#f0ffc0] shadow-[0_3px_0_#6aaa00]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <button
          onClick={resetToDefaults}
          className={clay.btn.ghost + " flex-1 py-2 text-sm"}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className={`${saved ? "bg-emerald-500 shadow-[0_6px_0_#059669]" : clay.btn.primary} flex-1 py-2 text-sm transition-all duration-300`}
        >
          {saved ? "✓ Saved!" : "💾 Save Layout"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReceiptLayoutEditor({ onClose }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [config, setConfig] = useState({ ...defaultConfig });
  const [activeTab, setActiveTab] = useState("branding");
  const [logoPreview, setLogoPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const PreviewComponent = selectedLayout ? PREVIEW_COMPONENTS[selectedLayout] : null;

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Logo file must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setLogoPreview(url);
      updateConfig("logoUrl", url);
      updateConfig("showLogo", true);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateConfig("logoUrl", "");
    updateConfig("showLogo", false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    const saveData = { layout: selectedLayout, config };
    localStorage.setItem("receiptLayoutConfig", JSON.stringify(saveData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetToDefaults = () => {
    if (confirm("Reset all settings to default? This cannot be undone.")) {
      setConfig({ ...defaultConfig });
      setLogoPreview(null);
      setSaved(false);
    }
  };

  const selectLayout = (layoutId) => {
    setSelectedLayout(layoutId);
  };

  const goBackToLayouts = () => {
    setSelectedLayout(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar
        sidebarOpen={sidebarOpen}
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
        hotels={hotels}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"} ml-0`}>
        <div className="pt-24 pr-6 pb-8 pl-6">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {selectedLayout && (
                <button
                  onClick={goBackToLayouts}
                  className={clay.btn.ghost + " w-9 h-9 flex items-center justify-center text-lg"}
                >
                  ←
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Receipt Layout Editor</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedLayout 
                    ? `Editing ${LAYOUTS.find(l => l.id === selectedLayout)?.name} layout` 
                    : "Choose a layout template to customize"}
                </p>
              </div>
            </div>
            {!selectedLayout && (
              <div className="text-sm text-gray-400 bg-white px-4 py-2 rounded-2xl shadow-[0_4px_0_#e5e7eb]">
                {LAYOUTS.length} Layouts Available
              </div>
            )}
          </div>

          {/* Layout Selection Screen */}
          {!selectedLayout && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {LAYOUTS.map((layout) => (
                  <LayoutThumbnail
                    key={layout.id}
                    layoutId={layout.id}
                    cfg={config}
                    isSelected={false}
                    onSelect={() => selectLayout(layout.id)}
                  />
                ))}
              </div>
              <div className="text-center mt-8 text-gray-400 text-sm">
                Click on any layout to start customizing
              </div>
            </div>
          )}

          {/* Layout Editor Screen */}
          {selectedLayout && PreviewComponent && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Edit Panel */}
              <div className="lg:w-[420px] flex-shrink-0">
                <EditPanel
                  config={config}
                  updateConfig={updateConfig}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  logoPreview={logoPreview}
                  fileInputRef={fileInputRef}
                  handleLogoUpload={handleLogoUpload}
                  removeLogo={removeLogo}
                  resetToDefaults={resetToDefaults}
                  handleSave={handleSave}
                  saved={saved}
                />
              </div>

              {/* Right: Live Preview */}
              <div className="flex-1 min-w-0">
                <div className={clay.card + " p-6 sticky top-28"}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Live Preview</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {LAYOUTS.find((l) => l.id === selectedLayout)?.name} layout · Sample data shown
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#f0ffc0] text-gray-700 text-xs font-bold rounded-full border border-[#a3e635]/50">
                      🔄 Real-time
                    </span>
                  </div>
                  <div className="flex justify-center bg-[#f5f5f0] rounded-2xl p-8 overflow-auto min-h-[500px]">
                    <div className="shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                      <PreviewComponent cfg={config} mini={false} />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleSave}
                      className={`${saved ? "bg-emerald-500 shadow-[0_6px_0_#059669]" : clay.btn.primary} flex-1 py-3 text-sm transition-all duration-300`}
                    >
                      {saved ? "✓ Layout Saved!" : "💾 Save This Layout"}
                    </button>
                    <button
                      onClick={goBackToLayouts}
                      className={clay.btn.secondary + " flex-1 py-3 text-sm"}
                    >
                      ← Choose Different Layout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}