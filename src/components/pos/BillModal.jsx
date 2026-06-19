"use client";
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

// Clay Design Tokens
const clay = {
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_4px_0_#6aaa00,0_6px_12px_rgba(163,230,53,0.3)] hover:shadow-[0_2px_0_#6aaa00] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_4px_0_#d1d5db] hover:shadow-[0_2px_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_4px_0_#065f46,0_6px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_#065f46] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all duration-150 text-sm",
  },
  card: "bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb,0_8px_20px_rgba(0,0,0,0.06)] border border-white/80",
  modal: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_0_#d1d5db,0_24px_48px_rgba(0,0,0,0.15)] border border-white",
};

export default function BillModal({ bill, onClose }) {
  const billRef = useRef();

  const handlePrint = () => {
    const content = billRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=450,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${bill.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              padding: 20px; 
              color: #111;
              max-width: 380px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0 0 5px 0; font-size: 20px; letter-spacing: 1px; }
            .header p { margin: 0; font-size: 10px; color: #555; }
            .divider { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
            .divider-solid { border: none; border-top: 1.5px solid #111; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin: 10px 0; }
            .footer { text-align: center; font-size: 9px; color: #777; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #ccc; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .item-name { flex: 2; }
            .item-qty { text-align: center; width: 50px; }
            .item-price { text-align: right; width: 60px; }
            .item-amount { text-align: right; width: 60px; }
            .subheader { font-weight: bold; margin: 8px 0 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🍽️ Sagar Ratna</h2>
            <p>123 Restaurant Street, Food City</p>
            <p>Tel: +91 98765 43210 | GST: 27AAABC1234D1Z</p>
          </div>
          ${content}
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Visit Again Soon 🙏</p>
            <p style="margin-top:5px;">* This is a computer generated bill *</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const date = new Date(bill.timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return (
    <AnimatePresence>
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
          className={clay.modal + " max-w-md w-full max-h-[90vh] overflow-y-auto"}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#a3e635]/20 rounded-2xl flex items-center justify-center">
                <span className="text-lg">🧾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bill / Invoice</h3>
                <p className="text-xs text-gray-400 mt-0.5">{bill.id?.slice(-8) || 'INV-001'}</p>
              </div>
            </div>
            <button 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl shadow-[0_2px_0_#d1d5db] active:translate-y-[1px] transition-all"
              onClick={onClose}
            >
              <X size={14} className="text-gray-600" />
            </button>
          </div>

          {/* Bill Content */}
          <div className="p-6" ref={billRef}>
            {/* Restaurant Info */}
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">🍽️ Sagar Ratna</h2>
              <p className="text-[10px] text-gray-400">123 Restaurant Street, Food City</p>
              <p className="text-[10px] text-gray-400">Ph: +91 98765 43210 | GST: 27AAABC1234D1Z</p>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500">{date}</p>
             
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 my-3" />
            
            {/* Bill Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Table Number</span>
                <span className="font-bold text-gray-800">{bill.tableName || bill.tableId}</span>
              </div>
              {bill.customer && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Name</span>
                  <span className="font-medium text-gray-800">{bill.customer}</span>
                </div>
              )}
              {bill.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone Number</span>
                  <span className="font-medium text-gray-800">{bill.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Bill Number</span>
                <span className="font-mono text-xs font-medium text-gray-600">{bill.id?.slice(-12) || bill.billNumber}</span>
              </div>
              {bill.kotNum && (
                <div className="flex justify-between">
                  <span className="text-gray-500">KOT Number</span>
                  <span className="font-medium text-gray-800">#{bill.kotNum}</span>
                </div>
              )}
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 my-3" />
            
            {/* Items Header */}
            <div className="flex justify-between font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
              <span className="flex-1">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Amount</span>
            </div>
            
            <div className="border-t border-gray-200 my-1" />
            
            {/* Items */}
            <div className="space-y-2 text-sm">
              {bill.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="flex-1 text-gray-700">{item.name}</span>
                  <span className="w-12 text-center text-gray-600">{item.qty}</span>
                  <span className="w-16 text-right text-gray-600">₹{item.price}</span>
                  <span className="w-16 text-right font-semibold text-gray-800">₹{item.qty * item.price}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 my-3" />
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">₹{bill.subtotal || bill.total}</span>
              </div>
              {bill.tax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST (5%)</span>
                  <span className="font-medium text-gray-800">₹{bill.tax}</span>
                </div>
              )}
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 my-3" />
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">TOTAL</span>
              <span className="text-2xl font-bold text-green-600">₹{bill.total}</span>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 my-3" />
            
            {/* Payment Info */}
            <div className="text-center mt-4">
              <p className="text-[10px] text-gray-400">Payment Method: {bill.paymentMethod || 'Cash'}</p>
              <p className="text-[10px] text-gray-400 mt-1">Transaction ID: {bill.transactionId || 'TXN' + Date.now()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-100 p-6 flex gap-3 rounded-b-3xl">
            <button 
              className={clay.btn.green + " flex-1 py-3 text-sm flex items-center justify-center gap-2"}
              onClick={handlePrint}
            >
              <Printer size={16} /> Print Bill
            </button>
            <button 
              className={clay.btn.secondary + " flex-1 py-3 text-sm"}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}