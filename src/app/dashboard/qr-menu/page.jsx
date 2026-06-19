"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import QRCode from "qrcode";
import axios from "axios";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

const qrStyles = [
  { id: "classic", name: "Classic", color: "#000000", bgColor: "#ffffff", icon: "⬛" },
  { id: "modern", name: "Modern", color: "#a3e635", bgColor: "#0a0f0d", icon: "💚" },
  { id: "elegant", name: "Elegant", color: "#d4af37", bgColor: "#1a1a1a", icon: "✨" },
  { id: "vibrant", name: "Vibrant", color: "#ff4444", bgColor: "#fff0f0", icon: "❤️" },
  { id: "ocean", name: "Ocean", color: "#0066cc", bgColor: "#e8f4f8", icon: "🌊" },
  { id: "sunset", name: "Sunset", color: "#ff6600", bgColor: "#fff5e6", icon: "🌅" },
];

// Clay design tokens
const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue: "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green: "bg-green-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#166534,0_8px_16px_rgba(34,197,94,0.35)] hover:shadow-[0_3px_0_#166534,0_4px_8px_rgba(34,197,94,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
  input: "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400",
};

// Helper function to generate QR with logo
const generateQRWithLogo = async (url, options, logoDataUrl) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, url, options, (error) => {
      if (error) {
        reject(error);
        return;
      }
      
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      const size = options.width;
      finalCanvas.width = size;
      finalCanvas.height = size;
      
      // Draw QR code
      finalCtx.drawImage(canvas, 0, 0, size, size);
      
      // Draw logo in center
      const logo = new Image();
      logo.onload = () => {
        const logoSize = size * 0.25;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // Draw white circle behind logo
        finalCtx.fillStyle = options.color.light;
        finalCtx.beginPath();
        finalCtx.arc(size / 2, size / 2, logoSize / 1.8, 0, 2 * Math.PI);
        finalCtx.fill();
        
        finalCtx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        resolve(finalCanvas.toDataURL());
      };
      logo.onerror = reject;
      logo.src = logoDataUrl;
    });
  });
};

// Modal Shell Component
const ModalShell = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 16 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={clay.modal + " max-w-4xl w-full max-h-[92vh] overflow-y-auto"}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

// Restaurant QR Modal
const RestaurantQRModal = ({ isOpen, onClose, storeData, restaurantUrl }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(qrStyles[0]);
  const [size, setSize] = useState(256);
  const [generating, setGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen, selectedStyle, size, logoPreview]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const qrOptions = {
        width: size,
        color: {
          dark: selectedStyle.color,
          light: selectedStyle.bgColor,
        },
        margin: 2,
        errorCorrectionLevel: 'H',
      };

      let result;
      if (logoPreview) {
        result = await generateQRWithLogo(restaurantUrl, qrOptions, logoPreview);
      } else {
        result = await QRCode.toDataURL(restaurantUrl, qrOptions);
      }
      setQrDataUrl(result);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `restaurant-qr-${storeData?.companyName || 'restaurant'}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const shareToWhatsApp = () => {
    const message = `🍽️ Welcome to ${storeData?.companyName || 'DineEat'}!\n\nScan the QR code below to view our digital menu and place your order.\n\nWe look forward to serving you! 😊`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Restaurant QR Code</h2>
          <p className="text-sm text-gray-400 mt-0.5">Share your restaurant's digital menu</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" width={size} height={size} />
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width: size, height: size }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a3e635]"></div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-700">Restaurant URL:</p>
                <p className="text-xs text-gray-500 break-all">{restaurantUrl}</p>
              </div>
              {qrDataUrl && (
                <div className="flex gap-2 mt-4">
                  <button onClick={downloadQR} className={clay.btn.secondary + " px-4 py-2 text-sm"}>
                    Download QR
                  </button>
                  <button onClick={shareToWhatsApp} className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}>
                    <span>📱</span> Share
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Style</label>
              <div className="grid grid-cols-3 gap-2">
                {qrStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 transition ${selectedStyle.id === style.id ? 'border-[#a3e635] bg-[#a3e635]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-xs font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Small</span>
                <span>{size}px</span>
                <span>Large</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={clay.input + " text-center"}>
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                </label>
                {logoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Recommended: Square image, max 200x200px</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Restaurant QR Info:</p>
              <p className="text-xs text-blue-800">Customers can scan this QR code to view your full menu and place orders directly from their phone.</p>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

// Table QR Generator Modal
const TableQRGenerator = ({ isOpen, onClose, table, storeData, onGenerate }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(qrStyles[0]);
  const [size, setSize] = useState(256);
  const [generating, setGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Build table URL using table ID from the API
  const tableUrl = `https://${storeData?.domain || 'dineeat.com'}/visit/${storeData?.companyName?.toLowerCase().replace(/\s/g, '-')}/${table._id}`;

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen, selectedStyle, size, logoPreview]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const qrOptions = {
        width: size,
        color: {
          dark: selectedStyle.color,
          light: selectedStyle.bgColor,
        },
        margin: 2,
        errorCorrectionLevel: 'H',
      };

      let result;
      if (logoPreview) {
        result = await generateQRWithLogo(tableUrl, qrOptions, logoPreview);
      } else {
        result = await QRCode.toDataURL(tableUrl, qrOptions);
      }
      setQrDataUrl(result);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-${table.name}-${table.number || table._id.slice(-4)}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const handleGenerate = () => {
    const qrData = {
      url: tableUrl,
      style: selectedStyle,
      size: size,
      dataUrl: qrDataUrl,
      generatedAt: new Date().toISOString(),
    };
    onGenerate(table._id, qrData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Generate Table QR Code</h2>
          <p className="text-sm text-gray-400 mt-0.5">{storeData?.companyName} - {table.name}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" width={size} height={size} />
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width: size, height: size }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a3e635]"></div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-700">Table URL:</p>
                <p className="text-xs text-gray-500 break-all">{tableUrl}</p>
              </div>
              {qrDataUrl && (
                <button onClick={downloadQR} className={clay.btn.secondary + " mt-4 px-4 py-2 text-sm"}>
                  Download QR Code
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Style</label>
              <div className="grid grid-cols-3 gap-2">
                {qrStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 transition ${selectedStyle.id === style.id ? 'border-[#a3e635] bg-[#a3e635]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-xs font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={clay.input + " text-center"}>
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                </label>
                {logoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleGenerate} disabled={!qrDataUrl} className={clay.btn.primary + " flex-1 py-3 disabled:opacity-50"}>
                Generate & Save QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

// Edit QR Modal
const EditQRModal = ({ isOpen, onClose, table, storeData, onUpdate }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(qrStyles[0]);
  const [size, setSize] = useState(256);
  const [generating, setGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const tableUrl = `https://${storeData?.domain || 'dineeat.com'}/${storeData?.companyName?.toLowerCase().replace(/\s/g, '-')}/table/${table._id}`;

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen, selectedStyle, size, logoPreview]);

  useEffect(() => {
    if (isOpen && table.qrCode) {
      setSelectedStyle(table.qrCode.style || qrStyles[0]);
      setSize(table.qrCode.size || 256);
    }
  }, [isOpen, table]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const qrOptions = {
        width: size,
        color: {
          dark: selectedStyle.color,
          light: selectedStyle.bgColor,
        },
        margin: 2,
        errorCorrectionLevel: 'H',
      };

      let result;
      if (logoPreview) {
        result = await generateQRWithLogo(tableUrl, qrOptions, logoPreview);
      } else if (table.qrCode?.dataUrl && !logoFile) {
        result = table.qrCode.dataUrl;
      } else {
        result = await QRCode.toDataURL(tableUrl, qrOptions);
      }
      setQrDataUrl(result);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    const updatedQR = {
      url: tableUrl,
      style: selectedStyle,
      size: size,
      dataUrl: qrDataUrl,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(table._id, updatedQR);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit QR Code</h2>
          <p className="text-sm text-gray-400 mt-0.5">{table.name} - QR Code Settings</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" width={size} height={size} />
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width: size, height: size }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a3e635]"></div>
                  </div>
                )}
              </div>
              {qrDataUrl && (
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.download = `qr-${table.name}-${table.number || table._id.slice(-4)}.png`;
                  link.href = qrDataUrl;
                  link.click();
                }} className={clay.btn.secondary + " mt-4 px-4 py-2 text-sm"}>
                  Download QR Code
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Style</label>
              <div className="grid grid-cols-3 gap-2">
                {qrStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style);
                      setTimeout(generateQR, 100);
                    }}
                    className={`p-3 rounded-lg border-2 transition ${selectedStyle.id === style.id ? 'border-[#a3e635] bg-[#a3e635]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-xs font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => {
                  setSize(parseInt(e.target.value));
                  setTimeout(generateQR, 100);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={clay.input + " text-center"}>
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                </label>
                {logoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleUpdate} disabled={!qrDataUrl} className={clay.btn.primary + " flex-1 py-3 disabled:opacity-50"}>
                Update QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

// Main Page Component
export default function QRMenuPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRestaurantQR, setShowRestaurantQR] = useState(false);
  const [showTableQR, setShowTableQR] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [storeData, setStoreData] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get store data from localStorage
  useEffect(() => {
    const storeDataStr = localStorage.getItem('storeData');
    if (storeDataStr) {
      try {
        const parsed = JSON.parse(storeDataStr);
        setStoreData(parsed);
        setStoreId(parsed.id || parsed._id);
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
  }, []);

  // Fetch tables from API
  const fetchTables = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/tables/${storeId}`);
      if (response.data.success) {
        // Load saved QR codes from localStorage
        const savedQRCodes = JSON.parse(localStorage.getItem('tableQRCodes') || '{}');
        const tablesWithQR = response.data.tables.map(table => ({
          ...table,
          qrCode: savedQRCodes[table._id] || null
        }));
        setTables(tablesWithQR);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [storeId]);

  // Save QR code to localStorage
  const saveQRCode = (tableId, qrData) => {
    const savedQRCodes = JSON.parse(localStorage.getItem('tableQRCodes') || '{}');
    savedQRCodes[tableId] = qrData;
    localStorage.setItem('tableQRCodes', JSON.stringify(savedQRCodes));
    
    setTables(tables.map(table =>
      table._id === tableId ? { ...table, qrCode: qrData } : table
    ));
  };

  const updateQRCode = (tableId, qrData) => {
    const savedQRCodes = JSON.parse(localStorage.getItem('tableQRCodes') || '{}');
    savedQRCodes[tableId] = { ...savedQRCodes[tableId], ...qrData };
    localStorage.setItem('tableQRCodes', JSON.stringify(savedQRCodes));
    
    setTables(tables.map(table =>
      table._id === tableId ? { ...table, qrCode: savedQRCodes[tableId] } : table
    ));
  };

  const restaurantUrl = `https://${storeData?.domain || 'dineeat.com'}/${storeData?.companyName?.toLowerCase().replace(/\s/g, '-')}`;

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (table.number?.toString() || '').includes(searchTerm);
    const matchesStatus = selectedStatus === "all" || table.isActive === (selectedStatus === "active");
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tables.length,
    active: tables.filter(t => t.isActive).length,
    inactive: tables.filter(t => !t.isActive).length,
    qrGenerated: tables.filter(t => t.qrCode).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} hotels={hotels} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"} ml-10`}>
        <div className="pt-24 pr-6 pb-8">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">QR Menu Management</h1>
              <p className="text-gray-400 text-sm mt-1">Generate and manage QR codes for tables</p>
            </div>
            <button onClick={() => setShowRestaurantQR(true)} className={clay.btn.primary + " px-6 py-3 text-sm flex items-center gap-2"}>
              <span>🏪</span> Restaurant QR
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-4 shadow-[0_6px_0_#e5e7eb,0_10px_24px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Tables</p><p className="text-3xl font-semibold text-gray-900 mt-1">{stats.total}</p></div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shadow-[0_3px_0_#93c5fd]">🪑</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-[0_6px_0_#e5e7eb,0_10px_24px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Tables</p><p className="text-3xl font-semibold text-green-600 mt-1">{stats.active}</p></div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl shadow-[0_3px_0_#86efac]">✅</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-[0_6px_0_#e5e7eb,0_10px_24px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">QR Generated</p><p className="text-3xl font-semibold text-purple-600 mt-1">{stats.qrGenerated}</p></div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl shadow-[0_3px_0_#d8b4fe]">📱</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-[0_6px_0_#e5e7eb,0_10px_24px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Restaurant URL</p><p className="text-sm font-semibold text-gray-900 mt-1 truncate">{restaurantUrl}</p></div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-[0_3px_0_#fdba74]">🌐</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80 mb-6">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tables by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              </div>
            </div>
            <div className="p-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table) => (
              <motion.div
                key={table._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#0d1a0f] to-[#0a0f0d] p-5 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{table.name}</h3>
                      <p className="text-sm text-white/60 mt-0.5">ID: {table._id.slice(-6)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-2xl text-xs font-bold shadow-[0_2px_0_rgba(0,0,0,0.2)] ${table.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {table.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Capacity:</span>
                      <span className="text-gray-900 font-semibold">{table.capacity} persons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Location:</span>
                      <span className="text-gray-900">{table.location || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">QR Status:</span>
                      <span className={`font-semibold ${table.qrCode ? 'text-green-600' : 'text-gray-400'}`}>
                        {table.qrCode ? 'Generated' : 'Not Generated'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!table.qrCode ? (
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowTableQR(true);
                        }}
                        className={clay.btn.primary + " flex-1 py-2.5 text-sm"}
                      >
                        Generate QR
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTable(table);
                            setShowEditModal(true);
                          }}
                          className={clay.btn.blue + " flex-1 py-2.5 text-sm"}
                        >
                          Edit QR
                        </button>
                        <button
                          onClick={() => {
                            const message = `🍽️ Welcome to ${storeData?.companyName}!\n\nScan the QR code at ${table.name} to view our digital menu and place your order.\n\nOrder here: ${table.qrCode?.url}\n\nWe look forward to serving you! 😊`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                          }}
                          className={clay.btn.green + " flex-1 py-2.5 text-sm flex items-center justify-center gap-1"}
                        >
                          <span>📱</span> Share
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb]">
              <div className="text-6xl mb-3">🪑</div>
              <p className="text-gray-400 text-sm font-medium">No tables found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRestaurantQR && (
          <RestaurantQRModal
            isOpen={showRestaurantQR}
            onClose={() => setShowRestaurantQR(false)}
            storeData={storeData}
            restaurantUrl={restaurantUrl}
          />
        )}
        
        {showTableQR && selectedTable && (
          <TableQRGenerator
            isOpen={showTableQR}
            onClose={() => {
              setShowTableQR(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
            storeData={storeData}
            onGenerate={saveQRCode}
          />
        )}

        {showEditModal && selectedTable && (
          <EditQRModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
            storeData={storeData}
            onUpdate={updateQRCode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}