"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const features = [
  { icon: "⚡", title: "Lightning Fast POS", desc: "Process orders in under 3 seconds. Built for high-volume restaurants that can't afford delays." },
  { icon: "📊", title: "Real-time Analytics", desc: "Live dashboards for sales, inventory, staff performance and customer insights — all in one place." },
  { icon: "📦", title: "Inventory Tracking", desc: "Auto-deduct ingredients with every order. Get low-stock alerts before you run out." },
  { icon: "🧾", title: "Smart Billing", desc: "GST-compliant invoices, split bills, discounts, and coupon management built right in." },
  { icon: "🛵", title: "Delivery Integration", desc: "Native Swiggy, Zomato, and self-delivery management from a single screen." },
  { icon: "🔒", title: "Bank-grade Security", desc: "Your data is encrypted, backed up daily, and DPDP-compliant. Safe. Always." },
];

const testimonials = [
  { name: "Rohit Sharma", role: "Owner, Sharma's Kitchen", text: "DineEat cut our billing time by 60%. The inventory tracking alone saved us ₹40,000 last month in waste.", logo: "🍛" },
  { name: "Priya Menon", role: "GM, Coastal Bites Chain", text: "Managing 6 branches from one dashboard is a game changer. I can't imagine going back to the old way.", logo: "🐟" },
  { name: "Arjun Patel", role: "F&B Director, SpiceRoute Hotels", text: "The analytics are insane. We doubled our most profitable items' visibility and saw 35% revenue jump in Q1.", logo: "🏨" },
];

const plans = [
  {
    name: "Starter", price: "₹999", period: "/mo", popular: false,
    features: ["1 Branch", "Up to 200 orders/day", "Basic analytics", "Email support", "GST billing"],
    cta: "Start Free Trial",
  },
  {
    name: "Growth", price: "₹2,499", period: "/mo", popular: true,
    features: ["Up to 5 Branches", "Unlimited orders", "Advanced analytics", "Inventory management", "Priority support", "Delivery integration"],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise", price: "Custom", period: "", popular: false,
    features: ["Unlimited Branches", "Dedicated server", "Custom integrations", "White-label option", "24/7 account manager", "SLA guarantee"],
    cta: "Contact Sales",
  },
];

const faqs = [
  { q: "How do I get started with DineEat Merchant?", a: "Simply sign up, choose your plan, and we'll have your POS system live within 24 hours. Our onboarding team guides you every step of the way." },
  { q: "Does DineEat work offline?", a: "Yes! DineEat works seamlessly offline and syncs automatically when your connection is restored. Never lose an order again." },
  { q: "Can I manage multiple restaurant branches?", a: "Absolutely. DineEat supports unlimited branches under one account with centralized reporting and menu management." },
  { q: "What payment methods does it support?", a: "Cash, UPI, card (tap-to-pay), online wallets, and QR codes — all accepted with real-time settlement tracking." },
  { q: "Is there a free trial available?", a: "Yes, we offer a 30-day free trial with full access to all features. No credit card required." },
];

const integrations = [
  ["🛵","Swiggy"],["🟥","Zomato"],["🟠","Dunzo"],["📦","EazyDiner"],
  ["🔵","MagicPin"],["🟢","WhatsApp Orders"],["🖨️","Epson Print"],["💳","Razorpay"],
];

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } }
};

const cardHover = {
  whileHover: { y: -8, transition: { duration: 0.2 } }
};

/* ─────────────────────────────────────────────
   REUSABLE SMALL COMPONENTS
───────────────────────────────────────────── */

/** Animated pulse dot + label pill */
function SectionTag({ children, dark = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border mb-3.5 ${
        dark
          ? "bg-[rgba(163,230,53,0.12)] text-[#a3e635] border-[rgba(163,230,53,0.25)]"
          : "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]"
      }`}
    >
      <motion.span 
        className="w-1.5 h-1.5 rounded-full bg-[#22c55e] tag-dot"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {children}
    </motion.div>
  );
}

/** ✓ check list item */
function CheckItem({ dark = false, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 text-[13px] font-medium"
    >
      <motion.span 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className={`font-bold text-sm ${dark ? "text-[#a3e635]" : "text-[#16a34a]"}`}
      >
        ✓
      </motion.span>
      <span className={dark ? "text-white/70" : "text-[#374151]"}>{children}</span>
    </motion.div>
  );
}

/** Dashed placeholder image box */
function ImgBox({ icon, label, hint, dark = false, height = 460 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`w-full rounded-2xl flex flex-col items-center justify-center gap-2 text-[13px] font-semibold text-center p-6 border-[1.5px] border-dashed ${
        dark
          ? "bg-[rgba(163,230,53,0.05)] border-[rgba(163,230,53,0.2)] text-[#a3e635]"
          : "bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-[#86efac] text-[#16a34a]"
      }`}
      style={{ height }}
    >
      <motion.span 
        className="text-[40px] mb-1"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.span>
      <span>{label}</span>
      {hint && <span className="text-[11px] opacity-70 font-normal">{hint}</span>}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function DineEatLanding() {
  const [scrolled, setScrolled]     = useState(false);
  const [faqOpen, setFaqOpen]       = useState(null);
  const [countVals, setCountVals]   = useState({ restaurants: 0, orders: 0, countries: 0, uptime: 0 });

  const router = useRouter();

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  /* scroll listener for navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* counter animation */
  useEffect(() => {
    const targets = { restaurants: 12000, orders: 5000000, countries: 150, uptime: 99 };
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setCountVals({
        restaurants: Math.floor(targets.restaurants * ease),
        orders:       Math.floor(targets.orders * ease),
        countries:    Math.floor(targets.countries * ease),
        uptime:       Math.floor(targets.uptime * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, []);

  /* ── RENDER ── */
  return (
    <>
      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-[100] transition-all duration-300 px-10 ${scrolled ? "bg-[#141b05]/40" : "bg-[#141b05]/10"}`}
      >
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between">
  {/* Logo */}
  <motion.a 
    href="#" 
    className="flex items-center gap-2 text-xl font-bold text-white tracking-tight no-underline"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div 
      className="w-8 h-8 rounded-lg flex items-center justify-center text-base overflow-hidden"
      whileHover={{ rotate: 90 }}
      transition={{ duration: 0.3 }}
    >
      <img src="/logo.png" alt="DineEat Logo" className="w-full h-full object-cover" />
    </motion.div>
    DineEat
  </motion.a>

  {/* Links – hidden on mobile */}
  <ul className="hidden md:flex gap-2 list-none items-center">
    {[["Products","products"],["Pricing","pricing"],["Company","company"],["Resources","resources"]].map(([label, href]) => (
      <motion.li 
        key={label}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <a href={`#${href}`} className="text-white/75 font-medium text-sm px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.08] transition-all no-underline">
          {label}
        </a>
      </motion.li>
    ))}
  </ul>

  {/* CTAs */}
  <div className="flex gap-2.5 items-center">
    <motion.button 
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
      whileTap={{ scale: 0.95 }}
      className="bg-transparent border border-white/30 text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all"
      onClick={()=> {router.push("/login")}}
    >
      Log in
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="border border-white/30 text-white px-[22px] py-[9px] rounded-full text-sm font-bold cursor-pointer transition-all hover:bg-white/[0.08]"
    >
      Get Started →
    </motion.button>
  </div>
</div>
      </motion.nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="hero-animated-bg pt-16 overflow-hidden min-h-screen h-250 max-h-250 flex flex-col items-center relative hero-glow"
      >
        {/* Text */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center px-6 pt-[72px] pb-14 relative z-10 max-w-[760px]"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-[rgba(231,255,193,0.83)]/50 border border-[rgba(163,230,53,0.3)] text-[#1e2118] px-3.5 py-[5px] rounded-full text-[13px] font-semibold mb-7"
          >
            <motion.span 
              className="bg-[#a3e635] text-[#0d2010] px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
              whileHover={{ scale: 1.05 }}
            >
              New
            </motion.span>
            Multi-branch management →
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-hero font-semibold text-white mb-5"
          >
            Restaurant billing
            <br />
            made effortless.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base text-white/55 leading-relaxed max-w-[500px] mx-auto mb-9"
          >
            We help restaurants and food businesses to seamlessly manage
            orders, inventory &amp; billing — without the chaos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#a3e635] pointer-cursor text-[#0d2010] border-none px-7 py-3.5 rounded-full text-[15px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
              onClick={()=> {router.push("/register")}}
            >
              Create account →
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent text-white border border-white/25 px-7 py-3.5 rounded-full text-[15px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
            >
              Contact sales →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Hero image */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute -bottom-30 z-20 px-6 w-full max-w-[1220px] mx-auto -mb-24"
        >
          <motion.img
            src="/hero.png"
            alt="DineEat Dashboard Preview"
            draggable={false}
            className="w-full h-auto block rounded-[32px]"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          />
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════
          TRUSTED LOGOS
      ════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="bg-white"
      >
        <div className="px-10 py-8 rounded-t-2xl bg-white relative z-20">
          <p className="text-center text-xs text-[#9ca3af] font-semibold tracking-widest uppercase mb-6">
            Trusted by restaurants across India
          </p>

          <div className="flex justify-center items-center flex-wrap max-w-[900px] mx-auto">
            {[
              "🍕 hotelname",
              "🍗 hotelname",
              "☕ hotelname",
              "🥗 hotelname",
              "🍜 hotelname",
              "🍔 hotelname",
            ].map((b, i, arr) => (
              <motion.div
                key={b}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, color: "#374151" }}
                className={`px-7 py-2 text-sm font-bold cursor-pointer text-[#9ca3af] whitespace-nowrap transition-colors ${
                  i < arr.length - 1 ? "border-r border-[#f0f0f0]" : ""
                }`}
              >
                {b}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════
          WHAT WE OFFER
      ════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-10 py-24" id="products">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <SectionTag>What We Offer</SectionTag>
          <h2 className="text-section-h2 font-bold text-[#0d1a0f] mb-3.5">
            We offer fast and smart<br />restaurant management
          </h2>
          <p className="text-base text-[#6b7280] leading-relaxed max-w-[500px] mx-auto">
            Whether you run a single QSR or a multi-city chain — DineEat scales with you.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* ORDER PANEL POS */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="rounded-[32px] overflow-hidden bg-[#5b800b] border border-[#14532d] relative p-8 md:p-10 min-h-[620px] flex flex-col"
          >
            {/* Content */}
            <div className="relative z-20 text-center">
              <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-[rgba(163,230,53,0.14)] border border-[rgba(163,230,53,0.22)] text-[#c6ff4d] text-xs font-semibold mb-5">
                ORDER PANEL POS
              </div>

              <h3 className="text-[42px] leading-[1.05] tracking-[-2px] text-[#d9ff72] mb-4">
                Fast & Smart
                <br />
                Billing System
              </h3>

              <p className="text-white/65 text-[15px] leading-relaxed max-w-[420px] mx-auto mb-7">
                Take orders, manage tables, print KOTs and process payments instantly.
              </p>

              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#d9ff72" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#c6ff4d] text-[#062b17] px-6 py-3 rounded-full text-sm font-bold transition-all"
              >
                Explore POS →
              </motion.button>
            </div>

            {/* IMAGE SPACE */}
            <div className="flex-1 relative">
              {/* Glow */}
              <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[90%] h-[260px] bg-[#84cc16]/20 blur-[100px] rounded-full"></div>

              {/* BIG IMAGE */}
              <motion.img
                src="/pos-dashboard.png"
                alt="POS Dashboard"
                draggable={false}
                className="absolute -bottom-40 -right-60 opacity-70 z-10 w-[780px] max-w-none object-contain select-none pointer-events-none"
                animate={{ x: [0, -10, 0], y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* HOTEL MANAGEMENT */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="rounded-[32px] bg-[#5b800b] border border-[#14532d] overflow-hidden relative p-8 md:p-10 min-h-[620px] flex flex-col"
          >
            {/* Content */}
            <div className="relative z-20 text-center">
              <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-[rgba(163,230,53,0.14)] border border-[rgba(163,230,53,0.22)] text-[#c6ff4d] text-xs font-semibold mb-5">
                FULL HOTEL MANAGEMENT
              </div>

              <h3 className="text-[42px] leading-[1.05] tracking-[-2px] text-[#d9ff72] mb-4">
                Manage Your
                <br />
                Entire Hotel
              </h3>

              <p className="text-white/65 text-[15px] leading-relaxed max-w-[420px] mx-auto mb-7">
                Control rooms, staff, restaurant billing and reports from one dashboard.
              </p>

              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#d9ff72" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#c6ff4d] text-[#062b17] px-6 py-3 rounded-full text-sm font-bold transition-all"
              >
                View Platform →
              </motion.button>
            </div>

            {/* IMAGE SPACE */}
            <div className="flex-1 relative">
              {/* Glow */}
              <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[90%] h-[260px] bg-[#84cc16]/20 blur-[100px] rounded-full"></div>

              {/* BIG IMAGE */}
              <motion.img
                src="/hotel-management.png"
                alt="Hotel Management"
                draggable={false}
                className="absolute -bottom-30 -right-30 opacity-80 z-10 w-[680px] max-w-none object-contain select-none pointer-events-none"
                animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES — WHY DINEEAT
      ════════════════════════════════════════ */}
      <div className="bg-white py-24" id="features">
        <div className="max-w-[1200px] mx-auto px-10">
          {/* Heading */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left mb-16"
          >
            <SectionTag>Why DineEat</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f]">
              Built for modern restaurants
              <br />
              that move fast
            </h2>
          </motion.div>

          {/* Features */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                {/* Icon */}
                <motion.div 
                  className="w-[72px] h-[72px] rounded-full bg-[#c6ff4d] shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)] flex items-center justify-center text-[30px] mb-6 transition-all"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {f.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-[28px] leading-tight tracking-[-1px] text-[#0d1a0f] mb-3">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] leading-relaxed text-[#6b7280] max-w-[260px]">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          STATS BAND
      ════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-[#3d5509] via-[#6a9411] to-[#314606] py-16 px-10"
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {[
            { label:"Restaurants",    val: countVals.restaurants.toLocaleString() + "+", icon:"🍽️" },
            { label:"Orders Processed",val: countVals.orders.toLocaleString() + "+",       icon:"📋" },
            { label:"Cities Covered",  val: countVals.countries + "+",                      icon:"🏙️" },
            { label:"Uptime SLA",      val: countVals.uptime + ".9%",                       icon:"⚡" },
          ].map((s, idx) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-3"
            >
              <motion.span 
                className="block text-[28px] mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                {s.icon}
              </motion.span>
              <motion.div 
                className="text-stat-val font-bold text-[#a3e635] leading-none mb-1.5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {s.val}
              </motion.div>
              <div className="text-[13px] text-white/50 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════
          UNIFIED PLATFORM — TWO-COL
      ════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionTag>Unified Platform</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f] mb-4">
              One account for all your<br />restaurant operations
            </h2>
            <p className="text-[15px] text-[#6b7280] leading-[1.75] mb-7">
              POS, inventory, billing, CRM, delivery, payroll — stop juggling 7 different tools. DineEat is the single platform your restaurant runs on.
            </p>
            <div className="flex flex-col gap-[18px] mb-8">
              {[
                { icon:"🧾", title:"Smart KOT & Billing", desc:"Table orders, takeaway, and delivery — all routed automatically to the right printer." },
                { icon:"📦", title:"Live Inventory",       desc:"Recipe-level tracking that deducts stock with every order placed." },
                { icon:"📊", title:"Unified Dashboard",   desc:"All branches, all data — one screen. Filter by date, branch, or category." },
              ].map((item, idx) => (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-3.5 items-start"
                >
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center text-lg flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <div className="text-[15px] font-bold text-[#0d1a0f] mb-1 tracking-tight">{item.title}</div>
                    <div className="text-[13px] text-[#6b7280] leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#a3e635] text-[#0d2010] border-none px-7 py-3.5 rounded-full text-[15px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
            >
              Explore Features →
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Image alt="" width={1000} height={1000} draggable={false} className="p-2 bg-gray-100 rounded-2xl" src="/unified-platform.png"/>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DARK — PAYMENTS
      ════════════════════════════════════════ */}
      <div className="bg-[#4a670c] py-24 px-10 relative overflow-hidden dot-grid">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <Image draggable={false} src="/payment-interface.png" className="shadow-sm rounded-2xl" width={1000} height={1000} alt=""/>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <SectionTag dark>Payments</SectionTag>
              <h2 className="text-section-h2 font-bold text-white mb-3.5">
                The Ultimate<br />Billing Experience<br />Across All Channels
              </h2>
              <p className="text-[15px] text-white/55 leading-[1.75] mb-7 mt-3.5">
                Accept UPI, card, cash, wallets — all in one tap. Real-time settlement tracking and zero transaction fees on your first ₹1 lakh.
              </p>
              <div className="flex flex-col gap-2.5 mb-8">
                {["Accept 15+ payment methods","Instant UPI settlement","Split bills & partial payments","Automatic GST calculation"].map((f, idx) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <CheckItem dark>{f}</CheckItem>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#a3e635] text-[#0d2010] border-none px-7 py-3.5 rounded-full text-[15px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
              >
                View Payment Features →
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MOBILE APP — TWO-COL
      ════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionTag>Mobile First</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f] mb-3.5 mt-3.5">
              One platform for all your<br />restaurant operations
            </h2>
            <p className="text-[15px] text-[#6b7280] leading-[1.75] mb-7">
              Manage orders, track inventory, view reports, and handle billing — all from a single Android or iOS device.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {[["🤖","GET IT FOR","ANDROID"],["🍎","DOWNLOAD FOR","iOS"]].map(([icon,tag,label]) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black text-white rounded-xl px-[18px] py-3 flex gap-2.5 items-center cursor-pointer transition-colors"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-[9px] text-[#9ca3af] tracking-wide">{tag}</div>
                    <div className="font-bold text-sm">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="float-anim"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <Image alt="" width={1000} height={1000} src="/mobile-apps.png" draggable={false} />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <div className="bg-[#daf89b]/40 py-24">
        <div className="max-w-[1200px] mx-auto px-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <SectionTag>Customer Stories</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f]">
              Customer success is<br />our success
            </h2>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {testimonials.map(t => (
              <motion.div 
                key={t.name} 
                variants={fadeInUp}
                whileHover={{ y: -8, borderColor: "#a3e635", boxShadow: "0 8px 32px rgba(163,230,53,0.1)" }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-7 border-[1.5px] border-[#e5e7eb] transition-all"
              >
                <motion.div 
                  className="text-[32px] mb-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {t.logo}
                </motion.div>
                <div className="flex gap-0.5 mb-3.5">
                  {[...Array(5)].map((_,i) => (
                    <motion.span 
                      key={i} 
                      className="text-[#f59e0b] text-sm"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-sm text-[#374151] leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex gap-2.5 items-center">
                  <motion.div 
                    className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#a3e635] to-[#65a30d] flex items-center justify-center text-[#0d2010] font-bold text-sm flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    {t.name[0]}
                  </motion.div>
                  <div>
                    <div className="text-[13px] font-bold text-[#0d1a0f]">{t.name}</div>
                    <div className="text-[11px] text-[#9ca3af] mt-px">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          GETTING STARTED — TWO-COL
      ════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <ImgBox icon="🚀" label="Onboarding Flow Screenshot" hint="Sign-up / setup wizard" height={420} />
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionTag>Quick Setup</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f] mb-0">
              It's simple to start<br />using DineEat Merchant
            </h2>
            <div className="flex flex-col mt-7">
              {[
                { step:"01", title:"Create your account",   desc:"Sign up in 60 seconds — no credit card needed. Choose your plan and go." },
                { step:"02", title:"Set up your menu & tables", desc:"Add menu items, ingredients, table layout and staff using our guided wizard." },
                { step:"03", title:"Go live and start billing", desc:"Your POS is ready. Start taking orders, printing KOTs and accepting payments immediately." },
              ].map((s, i) => (
                <motion.div 
                  key={s.step} 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex gap-[18px] items-start ${i < 2 ? "pb-6 mb-6 border-b border-[#f3f4f6]" : ""}`}
                >
                  <motion.div 
                    className="w-11 h-11 rounded-xl bg-[#a3e635] text-[#0d2010] flex items-center justify-center font-bold text-[13px] flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {s.step}
                  </motion.div>
                  <div>
                    <div className="text-base font-bold text-[#0d1a0f] mb-1 tracking-tight">{s.title}</div>
                    <div className="text-sm text-[#6b7280] leading-relaxed">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-[#a3e635] text-[#0d2010] border-none px-7 py-3.5 rounded-full text-[15px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
            >
              Get Started Now →
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PROMO CTA BAND
      ════════════════════════════════════════ */}
      <div className="px-6 md:px-10 py-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="max-w-[1200px] mx-auto rounded-[38px] overflow-hidden relative bg-gradient-to-br from-[#374e03] to-[#5b800b] border border-[#14532d]"
        >
          {/* Background glow */}
          <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#84cc16]/10 blur-[120px] rounded-full"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[520px] relative z-10">
            {/* LEFT CONTENT */}
            <div className="px-8 md:px-14 py-14 md:py-16">
              {/* Tag */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-[#c6ff4d] text-sm font-semibold mb-6"
              >
                <motion.span 
                  className="w-2 h-2 rounded-full bg-[#c6ff4d]"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Payment Promotion
              </motion.div>

              {/* Heading */}
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[54px] leading-[0.98] tracking-[-3px] text-white mb-6 max-w-[560px]"
              >
                Get
                <span className="text-[#c6ff4d]"> Zero-fee </span>
                on your first
                <br />
                restaurant payments
              </motion.h2>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[16px] leading-relaxed text-white/60 max-w-[520px] mb-8"
              >
                Accept UPI, cards and QR payments with instant settlement and
                zero platform fees on your first ₹1 lakh transaction volume.
              </motion.p>

              {/* Small note */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-2 text-white/45 text-sm mb-10"
              >
                <span className="text-[#c6ff4d]">ⓘ</span>
                Terms & onboarding conditions apply
              </motion.div>

              {/* Button */}
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#d9ff72", y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#c6ff4d] text-[#062b17] px-8 py-4 rounded-full text-[15px] font-bold transition-all"
              >
                Start Accepting Payments →
              </motion.button>
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative h-full flex items-center justify-center overflow-hidden">
              {/* Glow */}
              <div className="absolute w-[400px] h-[400px] bg-[#84cc16]/20 blur-[120px] rounded-full"></div>

              {/* BIG 0% */}
              <div className="relative select-none">
                <motion.div 
                  className="text-[320px] leading-none font-black tracking-[-20px] text-[#c6ff4d] drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                >
                  0
                </motion.div>
                <motion.div 
                  className="absolute top-[60px] right-[-40px] text-[120px] font-black text-[#c6ff4d] rotate-[12deg]"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  %
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <div className="bg-[#f9fafb] py-24" id="pricing">
        <div className="max-w-[1200px] mx-auto px-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <SectionTag>Pricing</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f]">
              Simple, transparent pricing<br />for every restaurant
            </h2>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {plans.map(plan => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-2xl px-7 py-8 border-2 relative transition-all ${
                  plan.popular ? "border-[#a3e635] shadow-[0_16px_48px_rgba(163,230,53,0.15)]" : "border-[#e5e7eb]"
                }`}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#a3e635] text-[#0d2010] px-4 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                  >
                    ⭐ Most Popular
                  </motion.div>
                )}
                <div className="text-[13px] font-bold text-[#6b7280] mb-1.5 uppercase tracking-wide">{plan.name}</div>
                <div className="text-[40px] font-bold text-[#0d1a0f] leading-none mb-1 tracking-tighter">{plan.price}</div>
                <div className="text-sm text-[#9ca3af] mb-5">{plan.period || "custom pricing"}</div>
                <div className="h-px bg-[#f3f4f6] mb-5" />
                <div className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map((f, idx) => (
                    <motion.div 
                      key={f} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-2 items-center text-[13px] text-[#374151] font-medium"
                    >
                      <span className="text-[#16a34a] font-bold text-sm">✓</span>{f}
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-full border-2 text-sm font-bold cursor-pointer transition-all  ${
                    plan.popular
                      ? "bg-[#a3e635] text-[#0d2010] border-transparent hover:bg-[#bef264]"
                      : "bg-transparent text-[#374151] border-[#e5e7eb] hover:border-[#a3e635] hover:text-[#16a34a]"
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTag>FAQ</SectionTag>
            <h2 className="text-section-h2 font-bold text-[#0d1a0f]">Common<br />questions</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed mb-6 mt-3">Can't find what you're looking for? Our support team replies within 2 hours.</p>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#a3e635] text-[#0d2010] border-none px-[22px] py-[11px] rounded-full text-sm font-bold cursor-pointer transition-all"
            >
              Chat with Us →
            </motion.button>
          </motion.div>

          {/* Right — accordion */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {faqs.map((faq, i) => (
              <motion.div 
                key={i} 
                className="border-b border-[#f3f4f6]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.button
                  className="w-full text-left py-5 flex justify-between items-center font-semibold text-[15px] text-[#111827] hover:text-[#16a34a] transition-colors bg-transparent border-none cursor-pointer"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  whileHover={{ x: 4 }}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    className="text-[#16a34a] text-lg flex-shrink-0 ml-4"
                    animate={{ rotate: faqOpen === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >+</motion.span>
                </motion.button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-[#6b7280] leading-relaxed pb-[18px] overflow-hidden"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#334311] py-[100px] px-10 text-center relative overflow-hidden final-glow"
      >
        <div className="relative z-10 max-w-[680px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[rgba(163,230,53,0.12)] text-[#a3e635] border border-[rgba(163,230,53,0.25)] px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-5 justify-center"
          >
            <motion.span 
              className="w-1.5 h-1.5 rounded-full bg-[#22c55e] tag-dot"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Start Today
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-final-h2 font-bold text-white mb-4"
          >
            Set up &amp; Save money on<br />your transfers with<br /><span className="text-[#a3e635]">DineEat Merchant</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-white/50 mb-10 leading-relaxed"
          >
            Join 12,000+ restaurants already saving time, money and sanity with DineEat. 30-day free trial, no credit card required.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#bef264", y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#a3e635] text-[#0d2010] border-none px-9 py-3.5 rounded-full text-[15px] font-bold cursor-pointer transition-all"
            >
              Start Free Trial →
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent text-white border border-white/25 px-[30px] py-3.5 rounded-full text-[15px] font-semibold cursor-pointer transition-all"
            >
              Schedule a Demo
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-[#060f08] px-10 pt-14 pb-7">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12"
          >
            {/* Brand */}
           <div>
  <a href="#" className="flex items-center gap-2 text-xl font-bold text-white no-underline">
    <motion.div 
      className="w-8 h-8 rounded-lg flex items-center justify-center text-base overflow-hidden"
    >
      <img src="/logo.png" alt="DineEat Logo" className="w-full h-full object-cover" />
    </motion.div>
    DineEat
  </a>
  <p className="text-[13px] text-[#4b5563] leading-relaxed max-w-[260px] mt-3">The all-in-one restaurant management platform for modern food businesses across India.</p>
  <div className="flex gap-2 mt-4">
    {["𝕏","in","f","▶"].map(s => (
      <motion.div 
        key={s} 
        whileHover={{ scale: 1.1 }}
        className="w-[34px] h-[34px] rounded-lg border border-white/20 text-[#a3e635] flex items-center justify-center text-[13px] font-bold cursor-pointer transition-colors hover:bg-white/[0.08]"
      >
        {s}
      </motion.div>
    ))}
  </div>
</div>
            {/* Link columns */}
            {[
              { title:"Product",  links:["Features","Pricing","Integrations","Changelog","Roadmap"] },
              { title:"Company",  links:["About Us","Blog","Careers","Press","Contact"] },
              { title:"Support",  links:["Help Center","API Docs","Status","Privacy","Terms"] },
            ].map(col => (
              <div key={col.title}>
                <div className="font-bold text-white mb-3.5 text-sm">{col.title}</div>
                <div className="flex flex-col gap-[9px]">
                  {col.links.map(l => (
                    <motion.a 
                      key={l} 
                      href="#" 
                      whileHover={{ x: 4, color: "#a3e635" }}
                      className="text-[#4b5563] text-[13px] transition-colors no-underline"
                    >
                      {l}
                    </motion.a>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bottom bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-t border-[#0f2d1a] pt-5 flex flex-wrap justify-between items-center gap-3"
          >
            <span className="text-xs text-[#374151]">© 2025 DineEat Technologies Pvt. Ltd. All rights reserved.</span>
            <div className="flex gap-4">
              {["Privacy Policy","Terms of Service","Cookie Policy"].map(l => (
                <motion.a 
                  key={l} 
                  href="#" 
                  whileHover={{ color: "#a3e635" }}
                  className="text-[#374151] text-xs transition-colors no-underline"
                >
                  {l}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}