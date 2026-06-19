"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, Calendar, TrendingUp, Users, ShoppingBag, Wallet } from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx';

const clay = {
  btn: {
    primary: "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary: "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    blue: "bg-blue-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#1d4ed8,0_8px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green: "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  input: "w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#a3e635] focus:bg-white focus:shadow-[0_0_0_4px_rgba(163,230,53,0.15)] transition-all placeholder:text-gray-400 text-sm",
};

export default function OrdersReport({ storeId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0,
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [period, setPeriod] = useState("month");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Calculate order total from items
  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  // Calculate subtotal from items
  const calculateSubtotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  // Calculate GST (5%)
  const calculateGST = (subtotal) => {
    return Math.round(subtotal * 0.05);
  };

  useEffect(() => {
    if (storeId) {
      fetchOrders();
    }
  }, [storeId, dateRange]);

  const fetchOrders = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('storeId', storeId);
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      params.append('limit', 500);
      
      const response = await axios.get(`${API_URL}/api/admin-orders/?${params.toString()}`);
      if (response.data.success) {
        const ordersData = response.data.orders.map(order => ({
          ...order,
          calculatedTotal: calculateOrderTotal(order.items),
          subtotal: calculateSubtotal(order.items),
          tax: calculateGST(calculateSubtotal(order.items))
        }));
        setOrders(ordersData);
        
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.calculatedTotal, 0);
        const totalItems = ordersData.reduce((sum, order) => sum + (order.items?.length || 0), 0);
        
        setStats({
          totalOrders: ordersData.length,
          totalRevenue,
          averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
          totalItems,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const endDate = new Date();
    let startDate = new Date();
    
    if (newPeriod === "week") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (newPeriod === "month") {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (newPeriod === "quarter") {
      startDate.setMonth(endDate.getMonth() - 3);
    } else if (newPeriod === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  // Generate receipt-style HTML for printing
  const generateReceiptHTML = () => {
    const periodText = `${dateRange.startDate} to ${dateRange.endDate}`;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Group items by order for itemized list
    const allItems = [];
    orders.forEach(order => {
      order.items?.forEach(item => {
        allItems.push({
          name: item.name,
          qty: item.qty,
          price: item.price,
          amount: item.price * item.qty,
          orderNumber: order.orderNumber,
          date: new Date(order.createdAt).toLocaleDateString()
        });
      });
    });

    // Group by category (if category exists)
    const groupedByCategory = {};
    allItems.forEach(item => {
      const category = item.category || "All Items";
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(item);
    });

    const categoryRows = Object.entries(groupedByCategory)
      .map(([cat, items]) => {
        const catTotal = items.reduce((s, i) => s + i.amount, 0);
        const catQty = items.reduce((s, i) => s + i.qty, 0);
        return `
          <tr>
            <td colspan="3" style="padding: 10px 0 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc;">
              ${cat}
            </td>
          </tr>
          ${items.map(item => `
            <tr>
              <td style="padding: 3px 0;">${item.name}</td>
              <td style="text-align: center; padding: 3px 0;">${item.qty}</td>
              <td style="text-align: right; padding: 3px 0;">₹${item.amount.toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
          <tr style="font-weight: bold; border-top: 1px dashed #ddd;">
            <td style="padding: 2px 0; font-size: 11px; color: #666;">${cat} subtotal</td>
            <td style="text-align: center; padding: 2px 0; font-size: 11px;">${catQty}</td>
            <td style="text-align: right; padding: 2px 0; font-size: 11px;">₹${catTotal.toLocaleString("en-IN")}</td>
          </tr>
        `;
      }).join("");

    const subTotal = stats.totalRevenue;
    const tax = Math.round(subTotal * 0.05);
    const grandTotal = subTotal + tax;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Report - ${dateRange.startDate} to ${dateRange.endDate}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              padding: 24px 28px; 
              font-size: 12px; 
              color: #111;
              max-width: 800px;
              margin: 0 auto;
            }
            .center { text-align: center; }
            .header { margin-bottom: 20px; }
            h1 { font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .restaurant-details { font-size: 10px; color: #555; margin: 2px 0; }
            .report-title { font-size: 13px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin: 8px 0 4px; }
            .divider-solid { border: none; border-top: 1.5px solid #111; margin: 10px 0; }
            .divider-dash { border: none; border-top: 1px dashed #aaa; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            .col-header th { 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              color: #555; 
              padding: 5px 0; 
              border-bottom: 1px solid #ccc; 
            }
            .col-header th:first-child { text-align: left; }
            .col-header th:nth-child(2) { text-align: center; }
            .col-header th:last-child { text-align: right; }
            .summary-row td { padding: 4px 0; font-size: 12px; }
            .summary-row td:last-child { text-align: right; }
            .grand td { font-size: 14px; font-weight: bold; padding-top: 8px; }
            .grand td:last-child { text-align: right; }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 10px; 
              color: #666; 
              border-top: 1px dashed #aaa; 
              padding-top: 12px; 
            }
            .order-list { margin-top: 16px; }
            .order-item { 
              border: 1px solid #eee; 
              border-radius: 4px; 
              padding: 10px; 
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            .order-header { 
              font-weight: bold; 
              background: #f5f5f5; 
              padding: 5px 8px; 
              margin: -10px -10px 8px -10px;
              border-radius: 4px 4px 0 0;
            }
            @media print { 
              body { padding: 12px 16px; } 
              .order-item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header center">
            <h1>🍽️ Sagar Ratna</h1>
            <p class="restaurant-details">123 Restaurant Street, Food City | Ph: +91 98765 43210</p>
            <p class="restaurant-details">GST: 27AAABC1234D1Z | FSSAI: 12345678901234</p>
            <hr class="divider-solid">
            <p class="report-title">ORDERS SUMMARY REPORT</p>
            <p class="restaurant-details">Period: ${periodText}</p>
            <p class="restaurant-details">Generated: ${dateStr} at ${timeStr}</p>
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
              <span class="filter-badges" style="display: inline-block; border: 1px solid #ccc; padding: 2px 8px; border-radius: 3px; font-size: 10px;">📊 Total Orders: ${stats.totalOrders}</span>
              <span class="filter-badges" style="display: inline-block; border: 1px solid #ccc; padding: 2px 8px; border-radius: 3px; font-size: 10px;">💰 Revenue: ₹${stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <hr class="divider-dash">

          <!-- Summary Stats -->
          <div style="margin: 15px 0;">
            <table style="width: 100%;">
              <tr class="summary-row">
                <td style="width: 50%;">Total Orders Completed:</td>
                <td style="text-align: right; font-weight: bold;">${stats.totalOrders}</td>
              </tr>
              <tr class="summary-row">
                <td>Total Revenue Collected:</td>
                <td style="text-align: right; font-weight: bold;">₹${stats.totalRevenue.toLocaleString("en-IN")}</td>
              </tr>
              <tr class="summary-row">
                <td>Average Order Value:</td>
                <td style="text-align: right; font-weight: bold;">₹${stats.averageOrderValue.toLocaleString("en-IN")}</td>
              </tr>
              <tr class="summary-row">
                <td>Total Items Sold:</td>
                <td style="text-align: right; font-weight: bold;">${stats.totalItems}</td>
              </tr>
            </table>
          </div>

          <hr class="divider-dash">

          <!-- Item-wise Sales Breakdown -->
          <div>
            <p style="font-weight: bold; margin: 8px 0;">📋 Item-wise Sales Breakdown</p>
            <table>
              <thead class="col-header">
                <tr>
                  <th style="text-align:left;">Item Name</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRows}
              </tbody>
            </table>
          </div>

          <hr class="divider-solid">

          <!-- Financial Summary -->
          <div style="margin-top: 15px;">
            <table style="width: 100%;">
              <tr class="summary-row">
                <td style="width: 70%;">Subtotal (excluding tax):</td>
                <td style="text-align: right;">₹${subTotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr class="summary-row">
                <td>GST (5%):</td>
                <td style="text-align: right;">₹${tax.toLocaleString("en-IN")}</td>
              </tr>
              <tr class="divider-dash"><td colspan="2"><hr class="divider-dash" style="margin: 4px 0;"></td></tr>
              <tr class="grand">
                <td style="font-size: 14px; font-weight: bold;">GRAND TOTAL:</td>
                <td style="text-align: right; font-size: 16px; font-weight: bold; color: #2e7d32;">₹${grandTotal.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>

          <!-- Order-wise Details -->
          <div class="order-list">
            <p style="font-weight: bold; margin: 15px 0 8px 0;">📝 Order-wise Details</p>
            ${orders.map(order => {
              const orderTotal = calculateOrderTotal(order.items);
              return `
                <div class="order-item">
                  <div class="order-header">
                    <span>🧾 ${order.orderNumber || order._id.slice(-8)}</span>
                    <span style="float: right;">📅 ${new Date(order.createdAt).toLocaleDateString()} | ${new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div style="margin-bottom: 6px;">
                    <span>👤 ${order.customer}</span>
                    <span style="float: right;">📞 ${order.phone || 'N/A'}</span>
                  </div>
                  <table style="width: 100%; margin: 5px 0; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px dotted #ccc;">
                        <th style="text-align:left;">Item</th>
                        <th style="text-align:center;">Qty</th>
                        <th style="text-align:right;">Price</th>
                        <th style="text-align:right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items?.map(item => `
                        <tr>
                          <td style="text-align:left;">${item.name}</td>
                          <td style="text-align:center;">${item.qty}</td>
                          <td style="text-align:right;">₹${item.price}</td>
                          <td style="text-align:right;">₹${item.price * item.qty}</td>
                        </tr>
                      `).join('')}
                      <tr style="border-top: 1px dashed #ccc;">
                        <td colspan="3" style="text-align:right; font-weight:bold;">Order Total:</td>
                        <td style="text-align:right; font-weight:bold;">₹${orderTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="font-size: 10px; color: #888; margin-top: 5px;">
                    Status: ${order.status} | Table: ${order.tableId || 'N/A'} | Mode: ${order.mode || 'dine_in'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="footer">
            <p>— End of Report —</p>
            <p style="margin-top: 5px;">This is a computer generated report. No signature required.</p>
            <p style="margin-top: 5px;">Thank you for choosing Sagar Ratna! 🙏</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = generateReceiptHTML();
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const handleExportExcel = () => {
    const excelData = [
      ['Orders Report'],
      [`Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['SUMMARY'],
      ['Total Orders', stats.totalOrders],
      ['Total Revenue', `₹${stats.totalRevenue.toLocaleString()}`],
      ['Average Order Value', `₹${stats.averageOrderValue.toLocaleString()}`],
      ['Total Items Sold', stats.totalItems],
      [''],
      ['ORDER DETAILS'],
      ['Order ID', 'Customer', 'Phone', 'Order Type', 'Items Count', 'Subtotal', 'Tax (5%)', 'Total', 'Status', 'Date', 'Time'],
      ...orders.map(order => {
        const subtotal = calculateOrderTotal(order.items);
        const tax = calculateGST(subtotal);
        return [
          order.orderNumber || order._id.slice(-8),
          order.customer,
          order.phone,
          order.mode || 'dine_in',
          order.items?.length || 0,
          subtotal,
          tax,
          subtotal + tax,
          order.status,
          new Date(order.createdAt).toLocaleDateString(),
          new Date(order.createdAt).toLocaleTimeString(),
        ];
      }),
      [''],
      ['ITEM-WISE SALES'],
      ['Item Name', 'Category', 'Quantity Sold', 'Total Revenue', 'Avg Price Per Unit'],
      ...(() => {
        const itemSales = {};
        orders.forEach(order => {
          order.items?.forEach(item => {
            if (!itemSales[item.name]) {
              itemSales[item.name] = { qty: 0, revenue: 0, price: item.price, category: item.category || 'General' };
            }
            itemSales[item.name].qty += item.qty;
            itemSales[item.name].revenue += item.price * item.qty;
          });
        });
        return Object.entries(itemSales).map(([name, data]) => [
          name,
          data.category,
          data.qty,
          data.revenue,
          data.price
        ]);
      })()
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders Report');
    XLSX.writeFile(wb, `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className={clay.card + " p-8 text-center"}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a3e635] mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm font-medium">Loading orders data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders Report</h2>
          <p className="text-sm text-gray-400 mt-0.5">Detailed order analytics and history</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className={clay.btn.blue + " px-4 py-2 text-sm flex items-center gap-2"}>
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExportExcel} className={clay.btn.green + " px-4 py-2 text-sm flex items-center gap-2"}>
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Orders</p>
            <ShoppingBag size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
            <Wallet size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Avg Order Value</p>
            <TrendingUp size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">₹{stats.averageOrderValue.toLocaleString()}</p>
        </div>
        <div className={clay.card + " p-4"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Items Sold</p>
            <Users size={18} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.totalItems}</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className={clay.card + " p-4"}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {["week", "month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  period === p
                    ? "bg-[#a3e635] text-gray-900 shadow-[0_2px_0_#6aaa00]"
                    : "bg-gray-100 text-gray-600 shadow-[0_2px_0_#d1d5db] hover:translate-y-[1px]"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className={clay.input + " w-36 text-sm"}
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className={clay.input + " w-36 text-sm"}
            />
            <button
              onClick={fetchOrders}
              className={clay.btn.primary + " px-4 py-2 text-sm"}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={clay.card + " overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">GST</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order, idx) => {
                const subtotal = calculateOrderTotal(order.items);
                const tax = calculateGST(subtotal);
                const total = subtotal + tax;
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    className="hover:bg-[#f9fff0] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-bold text-gray-800">{order.orderNumber || order._id.slice(-8)}</td>
                    <td className="px-5 py-3"><p className="text-sm font-semibold text-gray-800">{order.customer}</p><p className="text-xs text-gray-400">{order.phone}</p></td>
                    <td className="px-5 py-3"><span className="capitalize text-sm text-gray-600">{order.mode || 'dine_in'}</span></td>
                    <td className="px-5 py-3 text-sm text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">₹{subtotal}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">₹{tax}</td>
                    <td className="px-5 py-3 text-sm font-bold text-green-600">₹{total}</td>
                    <td className="px-5 py-3"><span className={`capitalize text-xs font-bold px-2 py-1 rounded-xl ${order.status === 'completed' ? 'bg-green-100 text-green-700 shadow-[0_2px_0_#6ee7b7]' : order.status === 'cancelled' ? 'bg-red-100 text-red-600 shadow-[0_2px_0_#fca5a5]' : 'bg-amber-100 text-amber-700 shadow-[0_2px_0_#fcd34d]'}`}>{order.status}</span></td>
                    <td className="px-5 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400 text-sm font-medium">No orders found for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
}