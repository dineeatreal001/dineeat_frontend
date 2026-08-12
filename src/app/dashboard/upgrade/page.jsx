"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Sample hotels data for navbar
const hotels = [
  { id: 1, name: "Spice Villa Restaurant", location: "Mumbai" },
  { id: 2, name: "Coastal Bites", location: "Goa" },
  { id: 3, name: "Punjab Dhaba", location: "Delhi" },
  { id: 4, name: "Sushi House", location: "Bangalore" },
];

// ─── Clay design tokens ──────────────────────────────────────────────────────
const clay = {
  card: "bg-white rounded-3xl shadow-[0_8px_0_#e5e7eb,0_12px_32px_rgba(0,0,0,0.08)] border border-white/80",
  statCard: (color) =>
    `bg-white rounded-3xl p-6 shadow-[0_6px_0_${color},0_10px_24px_rgba(0,0,0,0.07)] border border-white/80 hover:translate-y-[-2px] hover:shadow-[0_8px_0_${color},0_14px_32px_rgba(0,0,0,0.1)] transition-all duration-200`,
  btn: {
    primary:
      "bg-[#a3e635] text-gray-900 font-semibold rounded-2xl shadow-[0_6px_0_#6aaa00,0_8px_16px_rgba(163,230,53,0.35)] hover:shadow-[0_3px_0_#6aaa00,0_4px_8px_rgba(163,230,53,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    secondary:
      "bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-[0_6px_0_#d1d5db,0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.08)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    green:
      "bg-emerald-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#065f46,0_8px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_3px_0_#065f46,0_4px_8px_rgba(16,185,129,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
    purple:
      "bg-purple-500 text-white font-semibold rounded-2xl shadow-[0_6px_0_#6b21a8,0_8px_16px_rgba(168,85,247,0.35)] hover:shadow-[0_3px_0_#6b21a8,0_4px_8px_rgba(168,85,247,0.35)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all duration-150",
  },
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    description: "Perfect for small restaurants getting started",
    features: [
      "Up to 50 reservations/month",
      "Basic table management",
      "Single user access",
      "Email support"
    ],
    icon: "🌱",
    popular: false
  },
  {
    id: "professional",
    name: "Professional",
    price: "$29/mo",
    description: "Ideal for growing restaurants with multiple tables",
    features: [
      "Unlimited reservations",
      "Advanced table management",
      "5 user accounts",
      "Priority support",
      "Analytics & reporting",
      "POS integration"
    ],
    icon: "🚀",
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$79/mo",
    description: "For large restaurants and restaurant chains",
    features: [
      "Unlimited everything",
      "Multi-location support",
      "Unlimited user accounts",
      "24/7 dedicated support",
      "Custom reporting",
      "Full POS & inventory suite",
      "API access"
    ],
    icon: "🏢",
    popular: false
  }
];

export default function UpgradePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const handleGetPlan = (planId) => {
    setSelectedPlan(planId);
    setRequesting(true);
    // Simulate request
    setTimeout(() => {
      setRequesting(false);
      alert(`Thank you for your interest in the ${plans.find(p => p.id === planId).name} plan! Our team will contact you shortly.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} hotels={hotels} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-20"}`}>
        <div className="pt-24 pr-6 pb-8">

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Choose Your Plan</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Upgrade to unlock premium features and take your restaurant management to the next level
            </p>
          </div>

          {/* Current Plan Info */}
          <div className={`${clay.card} mb-8 p-6 max-w-2xl mx-auto`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center text-2xl shadow-[0_4px_0_#d1d5db,0_6px_12px_rgba(0,0,0,0.06)]">
                  📋
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold">Current Plan</p>
                  <p className="text-lg font-bold text-gray-900">Starter (Free)</p>
                </div>
              </div>
              <span className={`${clay.btn.secondary} px-4 py-2 text-xs`}>Active</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`${clay.card} overflow-hidden hover:translate-y-[-4px] hover:shadow-[0_12px_0_#e5e7eb,0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 relative ${
                  plan.popular ? 'border-2 border-[#a3e635]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#a3e635] text-gray-900 text-xs font-bold px-4 py-1 rounded-bl-2xl rounded-tr-3xl shadow-[0_2px_0_#6aaa00]">
                    POPULAR
                  </div>
                )}

                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{plan.icon}</div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Free" && <span className="text-sm text-gray-400">/month</span>}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-[#a3e635] text-lg">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => handleGetPlan(plan.id)}
                    disabled={requesting && selectedPlan === plan.id}
                    className={`${
                      plan.popular ? clay.btn.primary : clay.btn.secondary
                    } w-full py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {requesting && selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.price === "Free" ? "Get Started" : "Get Plan"
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQs / Contact Section */}
          <div className={`${clay.card} mt-8 p-8 max-w-3xl mx-auto text-center`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Need help choosing?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Contact our team for a customized plan that fits your restaurant's needs.
            </p>
            <button className={clay.btn.secondary + " px-6 py-2.5 text-sm"}>
              Contact Sales →
            </button>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-4">
              <span>🔒 Secure payment</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}