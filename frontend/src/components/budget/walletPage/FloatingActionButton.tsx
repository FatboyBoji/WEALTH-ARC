'use client';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  threshold?: number;
  alwaysShow?: boolean;
  watchElementId?: string;
}

export default function FloatingActionButton({ 
  onAddIncome, 
  onAddExpense, 
  threshold = 200,
  alwaysShow = false,
  watchElementId = 'wallet-actions'
}: FloatingActionButtonProps) {
  const [showButton, setShowButton] = useState(alwaysShow);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (alwaysShow) {
      setShowButton(true);
      return;
    }

    const handleScroll = () => {
      const watchedEl = document.getElementById(watchElementId);
      
      if (watchedEl) {
        const rect = watchedEl.getBoundingClientRect();
        setShowButton(rect.bottom < 0);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, alwaysShow, watchElementId]);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleAddIncome = () => {
    onAddIncome();
    setExpanded(false);
  };
  
  const handleAddExpense = () => {
    onAddExpense();
    setExpanded(false);
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div 
          className="fixed bottom-28 inset-x-0 z-50 flex justify-center items-center pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pointer-events-auto relative">
            <AnimatePresence>
              {expanded && (
                <>
                  <motion.button
                    onClick={handleAddIncome}
                    className="absolute right-16 bottom-0 flex items-center gap-2 bg-[#09BC8A] text-[#192A38] py-2 px-4 rounded-xl font-medium shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Income</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleAddExpense}
                    className="absolute left-16 bottom-0 flex items-center gap-2 bg-[#212121] text-white py-2 px-4 rounded-xl font-medium shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Expense</span>
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={toggleExpand}
              className={`flex items-center justify-center p-4 rounded-full shadow-lg ${
                expanded ? 'bg-red-500 rotate-45' : 'bg-[#09BC8A]'
              } text-white transition-all duration-300`}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 