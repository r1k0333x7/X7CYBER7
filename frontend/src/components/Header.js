'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-cyberneon-border backdrop-blur-md bg-cyberneon-dark/50 sticky top-0 z-50">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyberneon-blue to-cyberneon-purple rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg sm:text-xl">X7</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-white">X7 Cyber</h1>
                <p className="text-cyberneon-blue text-xs sm:text-sm">Defensive Security</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">X7</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8 items-center">
              <a href="#" className="text-gray-400 hover:text-cyberneon-blue transition text-sm">Dashboard</a>
              <a href="#" className="text-gray-400 hover:text-cyberneon-blue transition text-sm">Scanner</a>
              <a href="#" className="text-gray-400 hover:text-cyberneon-blue transition text-sm">Assets</a>
              <button className="btn-primary text-sm">Start Scan</button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-cyberneon-blue hover:text-cyberneon-blue/80 transition p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </motion.div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-cyberneon-border space-y-3"
            >
              <a href="#" className="block text-gray-400 hover:text-cyberneon-blue transition text-sm py-2">Dashboard</a>
              <a href="#" className="block text-gray-400 hover:text-cyberneon-blue transition text-sm py-2">Scanner</a>
              <a href="#" className="block text-gray-400 hover:text-cyberneon-blue transition text-sm py-2">Assets</a>
              <button className="btn-primary w-full text-sm">Start Scan</button>
            </motion.nav>
          )}
        </div>
      </div>
    </header>
  );
}
