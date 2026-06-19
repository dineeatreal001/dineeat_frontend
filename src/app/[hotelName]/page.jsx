"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Home", "Menu", "Services", "Contact"];

const HERO_ITEMS = [
  { name: "Pecky Rost",    price: "$58", emoji: "🍗", stars: 4 },
  { name: "Drumstick",     price: "$68", emoji: "🍖", stars: 5 },
  { name: "Chicken Rost",  price: "$68", emoji: "🍗", stars: 4 },
];

const DELIVERY_OPTIONS = [
  { icon: "🛵", title: "Fast delivery",  desc: "Promise to deliver within 30 mins" },
  { icon: "📦", title: "Pick up",        desc: "Pickup to deliver within 30 mins"  },
  { icon: "🍴", title: "Dine in",        desc: "Enjoy your food fresh crispy"      },
];

const PROMO_BANNERS = [
  { tag: "Buy 2 Get 1 Free", cta: "VIEW PACKAGES →", bg: "from-amber-900 to-red-950",  emoji: "🍗", size: "large" },
  { tag: "Pizza Special",    cta: "VIEW DETAILS →",  bg: "from-orange-800 to-rose-900", emoji: "🍕", size: "small" },
  { tag: "Spicy Noodles",    cta: "VIEW DETAILS →",  bg: "from-red-900 to-orange-950",  emoji: "🍜", size: "small" },
];

const BEST_PRODUCTS = [
  { name: "Beefy Bliss",        price: "6.90$",  rating: 5, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍔", featured: true },
  { name: "Bliss Burger",       price: "62.01$", rating: 4, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍔" },
  { name: "Roll Rocket",        price: "5.90$",  rating: 4, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🌯" },
  { name: "Veggie Voyage",      price: "2.90$",  rating: 3, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🥗" },
  { name: "Chicken Mcnuggets",  price: "25.90$", rating: 4, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍗" },
  { name: "Supreme Symphony",   price: "12.01$", rating: 5, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍕" },
  { name: "Pepperoni Paradise", price: "32.90$", rating: 4, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍝" },
  { name: "Pepperoni",          price: "22.68$", rating: 4, desc: "Delectus facere exercitationem dolor perspiciatis nulla...", emoji: "🍗" },
];

const STATS = [
  { value: "12k+", label: "Success Food"     },
  { value: "16k+", label: "Awards Winning"   },
  { value: "20k+", label: "Years of Experience" },
];

const POPULAR_ITEMS = [
  { name: "Crispy Wings",      price: "14.90$", rating: 5, emoji: "🍗" },
  { name: "BBQ Platter",       price: "28.50$", rating: 5, emoji: "🍖" },
  { name: "Spicy Noodles",     price: "9.99$",  rating: 4, emoji: "🍜" },
  { name: "Margherita Pizza",  price: "18.00$", rating: 5, emoji: "🍕" },
];

// ─── CLAY STYLE HELPERS ───────────────────────────────────────────────────────

const clay = {
  card: "bg-white rounded-[28px] border border-white/60 shadow-[0_8px_0_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.10)] relative overflow-hidden",
  cardRed: "bg-[#c8282a] rounded-[28px] border border-red-400/30 shadow-[0_8px_0_rgba(180,20,20,0.35),0_16px_40px_rgba(200,40,42,0.25)] relative overflow-hidden",
  btn: "rounded-[18px] shadow-[0_5px_0_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.12)] active:shadow-[0_2px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] transition-all duration-150",
  btnRed: "bg-[#c8282a] text-white rounded-[18px] shadow-[0_5px_0_rgba(140,10,10,0.45),0_8px_20px_rgba(200,40,42,0.25)] hover:shadow-[0_7px_0_rgba(140,10,10,0.45)] active:shadow-[0_2px_0_rgba(140,10,10,0.45)] active:translate-y-[3px] transition-all duration-150",
  pill: "bg-[#fff8f8] border border-red-100 rounded-[22px] shadow-[0_4px_0_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.07)]",
  nav: "bg-white/80 backdrop-blur-xl rounded-[24px] border border-white/70 shadow-[0_6px_0_rgba(0,0,0,0.06),0_10px_30px_rgba(0,0,0,0.08)]",
};

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

const floatAnim = {
  animate: {
    y: [-8, 8, -8],
    rotate: [-2, 2, -2],
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
  },
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

function Stars({ count, max = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "text-amber-400" : "text-gray-200"} style={{ fontSize: 11 }}>★</span>
      ))}
    </span>
  );
}

function SectionHeader({ pre, highlight, rest, align = "left" }) {
  return (
    <div className={`flex flex-col gap-1 ${align === "center" ? "items-center text-center" : ""}`}>
      {pre && <p className="text-[#c8282a] font-semibold text-sm tracking-widest uppercase">{pre}</p>}
      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
        <span className="text-[#c8282a]">{highlight}</span>{" "}
        <span>{rest}</span>
      </h2>
    </div>
  );
}

// ─── REVEAL WRAPPER ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger(delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ item, delay = 0 }) {
  const [wished, setWished] = useState(false);
  const [added,  setAdded]  = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 18px 0 rgba(0,0,0,0.09), 0 28px 56px rgba(0,0,0,0.13)" }}
        className={`${item.featured ? clay.cardRed : clay.card} p-4 flex flex-col gap-3 cursor-pointer`}
        style={{ minHeight: 280 }}
      >
        {/* Highlight shimmer */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />

        {/* Wishlist */}
        <button
          onClick={() => setWished((w) => !w)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md z-10"
        >
          <span style={{ fontSize: 14 }}>{wished ? "❤️" : "🤍"}</span>
        </button>

        {/* Emoji food image */}
        <div className={`w-full flex items-center justify-center rounded-[20px] py-3
          ${item.featured ? "bg-white/10" : "bg-[#fff0f0]"}`}
          style={{ minHeight: 110 }}>
          <motion.span
            animate={{ rotate: [0, -4, 4, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            style={{ fontSize: 64, lineHeight: 1 }}
          >
            {item.emoji}
          </motion.span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 flex-1">
          <p className={`font-bold text-[15px] ${item.featured ? "text-white" : "text-gray-800"}`}>{item.name}</p>
          <Stars count={item.rating} />
          <p className={`text-[11.5px] leading-relaxed line-clamp-2 ${item.featured ? "text-red-200" : "text-gray-400"}`}>
            {item.desc}
          </p>
        </div>

        {/* Price + cart */}
        <div className="flex items-center justify-between mt-auto">
          <span className={`font-black text-lg ${item.featured ? "text-white" : "text-gray-900"}`}>{item.price}</span>
          <motion.button
            whileTap={{ scale: 0.88, y: 2 }}
            onClick={handleAdd}
            className={`w-9 h-9 rounded-[12px] flex items-center justify-center text-white text-sm font-bold transition-colors duration-200
              ${item.featured
                ? "bg-white text-[#c8282a] shadow-[0_3px_0_rgba(200,40,42,0.3)]"
                : "bg-[#c8282a] shadow-[0_3px_0_rgba(140,10,10,0.4)]"
              }`}
          >
            <AnimatePresence mode="wait">
              {added
                ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>✓</motion.span>
                : <motion.span key="cart"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>🛒</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── POPULAR CARD ─────────────────────────────────────────────────────────────

function PopularCard({ item, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -5 }}
        className={`${clay.card} p-5 flex gap-4 items-center`}
      >
        <div className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
        <div className="w-20 h-20 rounded-[18px] bg-[#fff0f0] flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.06) inset" }}>
          <span style={{ fontSize: 44 }}>{item.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-[15px]">{item.name}</p>
          <Stars count={item.rating} />
          <p className="text-[#c8282a] font-black text-lg mt-1">{item.price}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88, y: 2 }}
          className={`${clay.btnRed} w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          +
        </motion.button>
      </motion.div>
    </Reveal>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function KhadyoLanding() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount,  setCartCount]  = useState(0);

  return (
    <div className="min-h-screen bg-[#fdf6f0] font-sans overflow-x-hidden"
      style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-[60%] -right-48 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #c8282a 0%, transparent 70%)", filter: "blur(90px)" }} />
        <div className="absolute top-[30%] left-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)", filter: "blur(70px)" }} />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-4 z-50 px-4 sm:px-6"
      >
        <nav className={`${clay.nav} max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex items-center gap-4`}>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 mr-auto sm:mr-0">
            <div className="w-9 h-9 rounded-[14px] bg-[#c8282a] flex items-center justify-center
              shadow-[0_4px_0_rgba(140,10,10,0.4),0_6px_16px_rgba(200,40,42,0.3)]">
              <span style={{ fontSize: 18 }}>🍔</span>
            </div>
            <span className="font-black text-xl text-gray-900">Khadyo</span>
          </motion.div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 mx-auto">
            {NAV_LINKS.map((l) => (
              <motion.a
                key={l} href="#"
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-[14px] text-sm font-semibold text-gray-600
                  hover:text-[#c8282a] hover:bg-red-50 transition-all duration-150"
              >
                {l}
              </motion.a>
            ))}
          </div>

          {/* Search + cart */}
          <div className="hidden sm:flex items-center gap-2 ml-auto sm:ml-0">
            <motion.button
              whileTap={{ scale: 0.93 }}
              className="w-10 h-10 rounded-[14px] bg-gray-50 border border-gray-100
                flex items-center justify-center text-gray-500
                shadow-[0_3px_0_rgba(0,0,0,0.06)]"
            >
              🔍
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setCartCount((c) => c + 1)}
              className="relative w-10 h-10 rounded-[14px] bg-[#c8282a] flex items-center justify-center
                shadow-[0_4px_0_rgba(140,10,10,0.4)]"
            >
              <span style={{ fontSize: 16 }}>🛒</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-gray-900
                      text-[10px] font-black rounded-full flex items-center justify-center
                      shadow-[0_2px_0_rgba(0,0,0,0.2)]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 rounded-[14px] bg-gray-50 border border-gray-100
              flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.06)]"
            onClick={() => setMobileMenu((m) => !m)}
          >
            <span style={{ fontSize: 18 }}>{mobileMenu ? "✕" : "☰"}</span>
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className={`${clay.nav} max-w-6xl mx-auto mt-2 px-5 py-4 flex flex-col gap-1`}
            >
              {NAV_LINKS.map((l) => (
                <a key={l} href="#"
                  className="px-4 py-3 rounded-[14px] text-sm font-semibold text-gray-700
                    hover:bg-red-50 hover:text-[#c8282a] transition-colors">
                  {l}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">

          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <motion.p
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#c8282a] font-bold text-sm tracking-widest uppercase"
            >
              Welcome
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.08]"
            >
              Enjoy Your<br />
              <span className="text-[#c8282a] relative">
                Delicious
                <motion.span
                  className="absolute -bottom-1 left-0 h-[4px] rounded-full bg-[#c8282a]/30"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                />
              </span>{" "}
              Food
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-[15px] leading-relaxed max-w-sm"
            >
              We will deliver your food within 30 minutes in your town. If we would fail, we will give the food free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 8px 0 rgba(140,10,10,0.45), 0 12px 28px rgba(200,40,42,0.3)" }}
                whileTap={{ y: 3, boxShadow: "0 2px 0 rgba(140,10,10,0.45)" }}
                className={`${clay.btnRed} px-7 py-3.5 text-sm font-bold`}
              >
                Order Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="w-12 h-12 rounded-full bg-white border border-red-100 flex items-center justify-center
                  shadow-[0_4px_0_rgba(0,0,0,0.07),0_6px_18px_rgba(0,0,0,0.09)]"
              >
                <span className="ml-0.5" style={{ fontSize: 18 }}>▶️</span>
              </motion.button>
            </motion.div>

            {/* Mini item cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex gap-3 flex-wrap"
            >
              {HERO_ITEMS.map((item, i) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -3 }}
                  className={`${clay.pill} px-3 py-2 flex items-center gap-2 cursor-pointer`}
                >
                  <span style={{ fontSize: 26 }}>{item.emoji}</span>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">{item.name}</p>
                    <p className="text-[11px] text-[#c8282a] font-black">{item.price}</p>
                    <Stars count={item.stars} />
                  </div>
                  <button className="w-6 h-6 rounded-[8px] bg-[#c8282a] flex items-center justify-center
                    text-white text-[11px] shadow-[0_2px_0_rgba(140,10,10,0.4)]">+</button>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Center: hero burger */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[300px] h-[320px]">
              {/* Clay plate */}
              <div className="absolute inset-6 rounded-[40px] bg-[#8b1a1a]
                shadow-[0_16px_0_rgba(100,10,10,0.45),0_24px_60px_rgba(180,30,30,0.35)]" />
              <motion.div
                variants={floatAnim}
                animate="animate"
                className="absolute inset-0 flex items-center justify-center"
              >
                <span style={{ fontSize: 160, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.3))" }}>🍔</span>
              </motion.div>
              {/* Floating sparkles */}
              {[
                { top: "8%", left: "5%",  delay: 0 },
                { top: "12%", right: "8%", delay: 0.5 },
                { bottom: "15%", left: "10%", delay: 1 },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: pos.delay }}
                  className="absolute text-amber-400"
                  style={{ ...pos, fontSize: 18 }}
                >✦</motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: delivery options */}
          <div className="flex flex-col gap-4 lg:items-start items-start">
            {DELIVERY_OPTIONS.map((opt, i) => (
              <Reveal key={opt.title} delay={0.3 + i * 0.12}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`${clay.card} px-4 py-3.5 flex items-center gap-3 w-full`}
                >
                  <div className="w-11 h-11 rounded-[14px] bg-[#fff0f0] flex items-center justify-center flex-shrink-0
                    shadow-[0_3px_0_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-[14px]">{opt.title}</p>
                    <p className="text-gray-400 text-[11.5px] leading-snug">{opt.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNERS ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Large promo */}
          <Reveal>
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 18px 0 rgba(0,0,0,0.15), 0 28px 60px rgba(0,0,0,0.2)" }}
              className={`relative rounded-[32px] overflow-hidden cursor-pointer
                bg-gradient-to-br from-amber-900 to-red-950
                shadow-[0_10px_0_rgba(0,0,0,0.18),0_16px_48px_rgba(0,0,0,0.25)]`}
              style={{ minHeight: 220 }}
            >
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                <p className="text-white font-black text-2xl sm:text-3xl drop-shadow-lg">Buy 2<br />Get 1 free</p>
                <button className="mt-4 self-start text-white/80 font-bold text-xs tracking-widest
                  border-b border-white/40 pb-0.5 hover:text-white transition-colors">
                  VIEW PACKAGES →
                </button>
              </div>
              <div className="absolute right-4 top-4 text-[110px] opacity-80"
                style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }}>
                <motion.span
                  animate={{ rotate: [-4, 4, -4], y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  style={{ display: "block" }}
                >🍗</motion.span>
              </div>
            </motion.div>
          </Reveal>

          {/* 2 small promos stacked */}
          <div className="flex flex-col gap-4">
            {[
              { label: "Pizza Special",  emoji: "🍕", bg: "from-orange-900 to-rose-950" },
              { label: "Spicy Noodles",  emoji: "🍜", bg: "from-red-900  to-orange-950" },
            ].map((p, i) => (
              <Reveal key={p.label} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`relative rounded-[28px] overflow-hidden cursor-pointer
                    bg-gradient-to-br ${p.bg}
                    shadow-[0_8px_0_rgba(0,0,0,0.16),0_12px_36px_rgba(0,0,0,0.2)]`}
                  style={{ minHeight: 100 }}
                >
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)" }} />
                  <div className="absolute inset-0 flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-white font-black text-lg">{p.label}</p>
                      <button className="mt-1 text-white/70 font-bold text-[11px] tracking-wider
                        border-b border-white/30 pb-0.5 hover:text-white transition-colors">
                        VIEW DETAILS →
                      </button>
                    </div>
                    <span style={{ fontSize: 64 }}>{p.emoji}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST PRODUCTS ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <Reveal><SectionHeader highlight="Best" rest="Products" /></Reveal>
          <Reveal delay={0.1}>
            <motion.button
              whileHover={{ color: "#c8282a" }}
              className="text-sm font-bold text-gray-400 flex items-center gap-1 hover:text-[#c8282a] transition-colors"
            >
              VIEW ALL <span>→</span>
            </motion.button>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BEST_PRODUCTS.map((item, i) => (
            <ProductCard key={item.name} item={item} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* ── STORY / EXPERIENCE ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className={`${clay.card} p-8 sm:p-12`}>
          <div className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%)" }} />
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left: illustration */}
            <Reveal>
              <div className="relative flex items-center justify-center">
                {/* Big clay circle */}
                <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#c8282a]
                  shadow-[0_12px_0_rgba(140,10,10,0.45),0_20px_60px_rgba(200,40,42,0.35)]
                  flex items-center justify-center">
                  <motion.span
                    animate={{ rotate: [-6, 6, -6] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    style={{ fontSize: 120 }}
                  >👩</motion.span>
                </div>

                {/* Stat badge */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-2 -left-4 sm:-left-8 bg-[#c8282a] rounded-[20px] px-4 py-3 text-white
                    shadow-[0_6px_0_rgba(140,10,10,0.5),0_10px_28px_rgba(200,40,42,0.4)]"
                >
                  <p className="font-black text-xl">6000%</p>
                  <p className="text-[11px] text-red-200 font-semibold">Destinations</p>
                </motion.div>

                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ repeat: Infinity, duration: 3.5 }}
                  className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-[18px] px-4 py-3
                    shadow-[0_6px_0_rgba(0,0,0,0.1),0_10px_28px_rgba(0,0,0,0.12)] border border-gray-100"
                >
                  <p className="font-black text-gray-900 text-lg">5000+</p>
                  <p className="text-[11px] text-gray-400 font-semibold">Customers</p>
                </motion.div>
              </div>
            </Reveal>

            {/* Right: copy */}
            <div className="flex flex-col gap-5">
              <Reveal>
                <p className="text-[#c8282a] font-bold text-sm tracking-widest uppercase">Our Experience</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                  Our <span className="text-[#c8282a]">Stories</span> Have Adventures.
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  There are many variations passogas of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour or randomised.
                </p>
              </Reveal>

              {/* Stats row */}
              <Reveal delay={0.3}>
                <div className="flex gap-4 flex-wrap mt-2">
                  {STATS.map((s, i) => (
                    <motion.div
                      key={s.label}
                      whileHover={{ y: -3 }}
                      className={`${clay.pill} px-4 py-3 flex-1 min-w-[90px]`}
                    >
                      <p className="font-black text-gray-900 text-xl">{s.value}</p>
                      <p className="text-gray-400 text-[11px] font-semibold leading-snug">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOST POPULAR ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <Reveal><SectionHeader highlight="Most Popular" rest="Items" /></Reveal>
          <Reveal delay={0.1}>
            <motion.button
              whileHover={{ color: "#c8282a" }}
              className="text-sm font-bold text-gray-400 hover:text-[#c8282a] transition-colors"
            >
              VIEW ALL →
            </motion.button>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {POPULAR_ITEMS.map((item, i) => (
            <PopularCard key={item.name} item={item} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <Reveal>
          <motion.div
            whileHover={{ boxShadow: "0 18px 0 rgba(140,10,10,0.5), 0 28px 70px rgba(200,40,42,0.4)" }}
            className={`${clay.cardRed} px-8 sm:px-14 py-12 flex flex-col sm:flex-row items-center justify-between gap-8`}
          >
            <div className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
            <div className="flex flex-col gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Hungry right now?<br />
                <span className="text-amber-300">Order in 30 mins</span>
              </h3>
              <p className="text-red-200 text-[15px]">Get your first order delivered for free!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96, y: 2 }}
              className="flex-shrink-0 bg-white text-[#c8282a] font-black text-base px-9 py-4 rounded-[20px]
                shadow-[0_6px_0_rgba(140,10,10,0.4),0_10px_28px_rgba(200,40,42,0.3)]
                hover:shadow-[0_9px_0_rgba(140,10,10,0.4)] transition-all duration-150"
            >
              Order Now 🛵
            </motion.button>
          </motion.div>
        </Reveal>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-[#c8282a] flex items-center justify-center
              shadow-[0_3px_0_rgba(140,10,10,0.4)]">
              <span style={{ fontSize: 14 }}>🍔</span>
            </div>
            <span className="font-black text-gray-900 text-lg">Khadyo</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 Khadyo. All rights reserved.</p>
          <div className="flex gap-3">
            {["🐦", "📘", "📸"].map((icon, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                  shadow-[0_3px_0_rgba(0,0,0,0.07)] hover:bg-red-50 transition-colors"
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}