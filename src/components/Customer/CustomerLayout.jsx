"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}