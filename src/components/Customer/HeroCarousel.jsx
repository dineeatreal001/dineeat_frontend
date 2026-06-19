// HeroCarousel.tsx
"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", title: "Special Offer", subtitle: "20% off on orders above ₹500" },
  { id: 2, url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", title: "Free Delivery", subtitle: "On orders above ₹300" },
  { id: 3, url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", title: "Happy Hours", subtitle: "6 PM - 8 PM" }
];

export default function HeroCarousel({ images = defaultImages }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative px-4 py-3">
      <div className="relative rounded-2xl overflow-hidden h-36 shadow-[0_8px_0_#e5e7eb]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 text-white">
          <p className="font-bold text-sm">{images[currentIndex].title}</p>
          <p className="text-xs opacity-90">{images[currentIndex].subtitle}</p>
        </div>
        
        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[1px] transition-all">
          <ChevronLeft size={16} className="text-white" />
        </button>
        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[1px] transition-all">
          <ChevronRight size={16} className="text-white" />
        </button>
      </div>
      
      <div className="flex justify-center gap-1.5 mt-2">
        {images.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-[#a3e635] shadow-[0_1px_0_#6aaa00]' : 'w-1.5 bg-gray-300'}`} />
        ))}
      </div>
    </div>
  );
}