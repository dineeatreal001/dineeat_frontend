"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Google Fonts import via style tag ───────────────────────────────────────
// Add to your _document.js or layout.jsx:
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STORY_TABS = ["All reviews", "Weight Loss", "Muscle Gain", "Performance", "Maintain & Energise", "Healthy Lifestyle", "Special Diets"];

const STORIES = [
  {
    name: "SOPHIE",
    age: "38 years, HR Specialist",
    lost: "9.5 kg",
    weeks: 8,
    quote: "I dropped 9.5 kg and finally saw my waist again — all within 8 weeks! The healthy meals were not only delicious, but also perfectly portioned and easy to stick to. I didn't have to think about food, just enjoy the journey.",
  },
  {
    name: "LUCI",
    age: "27 years, Photographer",
    lost: "6 kg",
    weeks: 4,
    quote: "I lost 6 kg and my skin followed my way after just 4 weeks! The meals gave me energy, kept me full, and I had more time to be productively. I can't believe how much simpler one can live about food.",
  },
  {
    name: "ANNA",
    age: "44 years, Manager",
    lost: "12 kg",
    weeks: 7,
    quote: "I lost 12 kg and both macro nutrition was spot-on after just 7 weeks! The meals were incredibly tasty and nutritionally and portion-size balanced — helping me seamlessly establish a routine, nourish and shed my load.",
  },
];

const PRESS = ["VOGUE", "Women's Health", "GQ", "GLAMOUR", "BUSINESS INSIDER", "HOUSE", "BAZAAR", "marie claire", "STYLIST"];

const HOW_STEPS = [
  {
    num: "1.",
    script: "take the quiz",
    desc: "5 quick questions about your goals, lifestyle and biometrics — takes less than 5 minutes.",
    cta: "Create My Personal Plan",
    bg: "#1a5c2a",
  },
  {
    num: "2.",
    script: "get your plan",
    desc: "Our AI/O+ system and expert nutritionist create your meals with macro-level precision.",
    bg: "#1a5c2a",
  },
  {
    num: "3.",
    script: "eat & enjoy",
    desc: "Get your macro-balanced plan within 24h or on your chosen days. Pause or change anytime.",
    bg: "#1a5c2a",
  },
];

const PLANS = [
  {
    name: "SELECT",
    tag: "100+ meals, flexible menu",
    price: "£13/DAY*",
    features: [
      { yes: true,  text: "Personalised plan" },
      { yes: false, text: "Ingredient-level care" },
      { yes: true,  text: "Choose your meals" },
      { yes: false, text: "Customised recipes" },
      { yes: true,  text: "Daily delivery" },
      { yes: true,  text: "Satisfaction guarantee" },
    ],
    cta: "Try Select",
    highlight: false,
  },
  {
    name: "BESPOKE",
    tag: "Based on your goals & lifestyle",
    price: "£25/DAY*",
    features: [
      { yes: true, text: "Personalised plan" },
      { yes: true, text: "Ingredient-level care" },
      { yes: true, text: "Choose your meals" },
      { yes: true, text: "Customised recipes" },
      { yes: true, text: "Daily delivery" },
      { yes: true, text: "Satisfaction guarantee" },
    ],
    cta: "Try Bespoke",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "MACRO",
    tag: "Macro-accurate meals",
    price: "£24/DAY*",
    features: [
      { yes: true,  text: "Personalised plan" },
      { yes: true,  text: "Ingredient-level care" },
      { yes: true,  text: "Choose your meals" },
      { yes: false, text: "Customised recipes" },
      { yes: true,  text: "Daily delivery" },
      { yes: true,  text: "Satisfaction guarantee" },
    ],
    cta: "Try Macro",
    highlight: false,
  },
];

const DIFFERENCES = [
  { icon: "📊", title: "RESULTS",      desc: "96.7% of clients reach their goals faster" },
  { icon: "🎯", title: "ACCURACY",     desc: "Every meal matched to your exact macro targets" },
  { icon: "⚡", title: "MORE ENERGY",  desc: "Improved focus, better cravings and performance" },
  { icon: "⏱️", title: "TIME-SAVER",   desc: "No shopping, cooking or calorie counting" },
  { icon: "🧬", title: "PERSONALISATION", desc: "Your plan is built using your data, goals and lifestyle with AI+O" },
  { icon: "🔄", title: "FLEXIBILITY",  desc: "Choose delivery days, pause, cancel anytime" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "", direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const from = direction === "up" ? { opacity: 0, y: 32 }
             : direction === "left" ? { opacity: 0, x: -32 }
             : direction === "right" ? { opacity: 0, x: 32 }
             : { opacity: 0, scale: 0.95 };
  return (
    <motion.div
      ref={ref}
      initial={from}
      animate={inView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Script / handwriting style span
function Script({ children, className = "" }) {
  return (
    <span className={`font-caveat ${className}`} style={{ fontFamily: "'Caveat', cursive" }}>
      {children}
    </span>
  );
}

// Big display heading
function Display({ children, className = "" }) {
  return (
    <span className={`font-bebas tracking-wide ${className}`} style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif" }}>
      {children}
    </span>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function FreshFoodLanding() {
  const [activeTab, setActiveTab] = useState("Weight Loss");
  const [storyIdx, setStoryIdx]   = useState(0);

  const C = {
    cream:    "#f5f0e0",
    green:    "#1a5c2a",
    lime:     "#8bc34a",
    limeBtn:  "#b5e63d",
    orange:   "#e87722",
    dark:     "#1a1a1a",
    cardGreen:"#1a5c2a",
  };

  return (
    <div className="min-h-screen overflow-x-hidden"
      style={{ background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.dark }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: C.green }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-black text-white text-lg leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
              FRESH<br />FOOD
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {["How it Works", "Plans", "Results", "About"].map((l) => (
              <a key={l} href="#" className="text-white/80 text-sm font-medium hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ background: C.limeBtn, color: C.green }}
            className="font-bold text-sm px-5 py-2 rounded-full"
          >
            Create My Plan
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
        {/* Full BG — dark green with food illustration via emoji/CSS */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${C.green} 0%, #0d3318 100%)` }} />

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }} />

        {/* Food emoji collage background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <div className="text-[320px]">🥗</div>
        </div>
        <div className="absolute top-8 right-8 opacity-20 text-[120px] pointer-events-none select-none rotate-12">🥦</div>
        <div className="absolute bottom-12 left-8 opacity-15 text-[100px] pointer-events-none select-none -rotate-12">🐟</div>
        <div className="absolute top-1/3 right-1/4 opacity-10 text-[80px] pointer-events-none select-none rotate-6">🥚</div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-5">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 self-start"
              >
                <div style={{ background: C.limeBtn, color: C.green }}
                  className="rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                  ✓ Certified Fresh
                </div>
              </motion.div>

              {/* Script headline */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
                <Script className="text-3xl sm:text-4xl text-lime-300" style={{ color: C.limeBtn }}>
                  Healthy Meals
                </Script>
                <div className="text-6xl sm:text-8xl lg:text-9xl font-black text-white leading-none tracking-tight mt-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  PERSON-<br />ALISED
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-white/70 text-base max-w-sm leading-relaxed"
              >
                We deliver premium, ready-to-eat meals tailored to your goals, lifestyle and body.
              </motion.p>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {["🧑","👩","👨","👩"].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 flex items-center justify-center text-lg"
                      style={{ background: C.green }}>
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">12,340</p>
                  <p className="text-white/60 text-xs">People already reaching their health goals</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 mt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  style={{ background: C.limeBtn, color: C.green }}
                  className="font-black text-base px-8 py-4 rounded-full w-full sm:w-auto"
                >
                  Create My Personal Plan
                </motion.button>
              </motion.div>
            </div>

            {/* Right: food visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:flex items-center justify-center relative"
            >
              <div className="relative w-[380px] h-[400px] rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="text-center"
                  >
                    <div style={{ fontSize: 180 }}>🥗</div>
                    <div style={{ fontSize: 100, marginTop: -40, marginLeft: 80 }}>🍱</div>
                  </motion.div>
                </div>
                {/* Floating label */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute bottom-6 left-6 rounded-2xl px-4 py-3"
                  style={{ background: C.limeBtn }}
                >
                  <p className="font-black text-sm" style={{ color: C.green }}>Delivery within 24h</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Promo banner */}
        <div className="relative z-10 w-full py-2.5 text-center text-sm font-bold" style={{ background: C.orange, color: "white" }}>
          Get 46% OFF your first week with code SPRING46. Offer ends this week!
        </div>
      </section>

      {/* ── TRUE STORIES ────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: C.cream }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-10">
            <Display className="text-6xl sm:text-7xl block" style={{ color: C.green }}>TRUE STORIES</Display>
            <Script className="text-3xl block mt-1" style={{ color: C.orange, fontFamily: "'Caveat', cursive" }}>
              Measurable Results
            </Script>
          </Reveal>

          {/* Tab filter */}
          <Reveal delay={0.1} className="mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {STORY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    background: activeTab === tab ? C.green : "white",
                    color: activeTab === tab ? "white" : C.dark,
                    border: `2px solid ${activeTab === tab ? C.green : "#e0d8c0"}`,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Story cards */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-6">
              {STORIES.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.1}>
                  <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 h-full"
                    style={{ border: "2px solid #e0d8c0" }}>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ background: "#f0fae0" }}>
                        {["🧑", "👩", "👩"][i]}
                      </div>
                      <div>
                        <p className="font-black text-lg" style={{ color: C.green, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-500">{s.age}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-black text-lg" style={{ color: C.green }}>-{s.lost}</div>
                        <div className="text-xs text-gray-400">{s.weeks} weeks</div>
                      </div>
                    </div>

                    <div className="w-full h-px" style={{ background: "#e0d8c0" }} />

                    <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">"{s.quote}"</p>

                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-full font-bold text-sm"
                      style={{ background: C.limeBtn, color: C.green }}
                    >
                      Get Similar Results
                    </motion.button>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Nav arrows */}
            <div className="flex justify-center gap-3 mt-8">
              {["←", "→"].map((arrow, i) => (
                <button key={i}
                  className="w-10 h-10 rounded-full border-2 font-bold flex items-center justify-center transition-colors hover:bg-green-50"
                  style={{ borderColor: C.green, color: C.green }}>
                  {arrow}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRESS BAR ───────────────────────────────────────────────────────── */}
      <section className="py-8 border-y-2" style={{ borderColor: "#d5ccb0", background: "#ede8d4" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PRESS.map((p) => (
              <span key={p} className="font-black text-sm sm:text-base opacity-40 uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: C.cream }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-14">
            <Display className="text-6xl sm:text-7xl block" style={{ color: C.green }}>HOW IT WORKS?</Display>
            <Script className="text-3xl block mt-1" style={{ color: C.orange, fontFamily: "'Caveat', cursive" }}>
              Three Simple Steps
            </Script>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.script} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="rounded-3xl p-7 flex flex-col gap-4 relative overflow-hidden"
                  style={{ background: C.green, minHeight: 240 }}
                >
                  {/* Grain overlay */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: "128px 128px",
                  }} />

                  <Script className="text-4xl text-white/90" style={{ fontFamily: "'Caveat', cursive", lineHeight: 1 }}>
                    {step.num} {step.script}
                  </Script>
                  <p className="text-white/70 text-sm leading-relaxed">{step.desc}</p>

                  {step.cta && (
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      style={{ background: C.limeBtn, color: C.green }}
                      className="font-black text-sm px-5 py-3 rounded-full self-start mt-auto"
                    >
                      {step.cta}
                    </motion.button>
                  )}

                  {/* Decorative emoji */}
                  <div className="absolute bottom-4 right-4 text-[64px] opacity-20 pointer-events-none select-none">
                    {["🥗", "📋", "😋"][i]}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHOOSE YOUR PLAN ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: C.green }}>
        {/* Grain overlay on whole section */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          position: "absolute",
        }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal className="text-center mb-14">
            <Script className="text-3xl block" style={{ color: C.limeBtn, fontFamily: "'Caveat', cursive" }}>
              Choose the Plan
            </Script>
            <Display className="text-6xl sm:text-7xl block text-white">THAT FITS YOU</Display>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl p-7 flex flex-col gap-5 relative overflow-hidden h-full"
                  style={{
                    background: plan.highlight ? C.limeBtn : "rgba(255,255,255,0.07)",
                    border: plan.highlight ? "none" : "2px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {plan.badge && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-xs font-bold"
                      style={{ color: C.green }}>
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <Display className="text-4xl" style={{ color: plan.highlight ? C.green : "white" }}>
                      {plan.name}
                    </Display>
                    <p className="text-sm mt-1" style={{ color: plan.highlight ? C.green + "99" : "rgba(255,255,255,0.5)" }}>
                      {plan.tag}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2.5 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
                          style={{
                            background: f.yes
                              ? (plan.highlight ? C.green : C.limeBtn)
                              : "rgba(255,255,255,0.15)",
                            color: f.yes
                              ? (plan.highlight ? "white" : C.green)
                              : "rgba(255,255,255,0.4)",
                          }}>
                          {f.yes ? "✓" : "✕"}
                        </span>
                        <span style={{ color: plan.highlight ? C.green : f.yes ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="w-full py-3.5 rounded-full font-black text-sm"
                      style={{
                        background: plan.highlight ? C.green : C.limeBtn,
                        color: plan.highlight ? "white" : C.green,
                      }}
                    >
                      {plan.cta}
                    </motion.button>
                    <p className="text-center text-xs mt-2 font-semibold"
                      style={{ color: plan.highlight ? C.green + "99" : "rgba(255,255,255,0.4)" }}>
                      FROM {plan.price}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ──────────────────────────────────────────── */}
      <section className="py-20" style={{ background: C.cream }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="mb-14">
            <Display className="text-6xl sm:text-7xl block" style={{ color: C.dark }}>WHAT MAKES US</Display>
            <Script className="text-4xl block" style={{ color: C.orange, fontFamily: "'Caveat', cursive" }}>
              Different?
            </Script>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* Left features */}
            <div className="flex flex-col gap-4">
              {DIFFERENCES.slice(0, 3).map((d, i) => (
                <Reveal key={d.title} delay={i * 0.08} direction="left">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 bg-white rounded-2xl p-4"
                    style={{ border: "2px solid #e0d8c0" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#f0fae0" }}>
                      {d.icon}
                    </div>
                    <div>
                      <p className="font-black text-sm" style={{ color: C.green }}>{d.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.desc}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>

            {/* Center food image */}
            <Reveal direction="scale" className="hidden lg:block">
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="w-56 h-56 rounded-full flex items-center justify-center"
                style={{ background: "#f0fae0", border: `4px solid ${C.limeBtn}` }}
              >
                <div className="text-center">
                  <div style={{ fontSize: 100 }}>🥗</div>
                </div>
              </motion.div>
            </Reveal>

            {/* Right features */}
            <div className="flex flex-col gap-4">
              {DIFFERENCES.slice(3).map((d, i) => (
                <Reveal key={d.title} delay={i * 0.08} direction="right">
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-start gap-4 bg-white rounded-2xl p-4"
                    style={{ border: "2px solid #e0d8c0" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#f0fae0" }}>
                      {d.icon}
                    </div>
                    <div>
                      <p className="font-black text-sm" style={{ color: C.green }}>{d.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.desc}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: C.green }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <Script className="text-4xl block text-white/80" style={{ fontFamily: "'Caveat', cursive" }}>
              Start today
            </Script>
            <Display className="text-6xl sm:text-8xl block text-white my-2">
              READY TO EAT BETTER?
            </Display>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Join 12,000+ people already hitting their health goals with Fresh Food.
            </p>
            <motion.button
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.97 }}
              style={{ background: C.limeBtn, color: C.green }}
              className="font-black text-lg px-10 py-5 rounded-full"
            >
              Create My Personal Plan →
            </motion.button>
            <p className="text-white/30 text-xs mt-4">No commitment. Cancel anytime. First week 46% off.</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-10" style={{ background: "#0d3318" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-white text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            FRESH FOOD
          </span>
          <p className="text-white/30 text-sm">© 2025 Fresh Food. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-white/40 text-sm hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}