"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ScrollToTopProps {
  threshold?: number;  // Scroll threshold in pixels
  mobileThreshold?: number; // Different threshold for mobile
  className?: string; // Optional additional classes
}

export default function ScrollToTop({ 
  threshold = 400, 
  mobileThreshold = 200, // Lower threshold for mobile
  className = '' 
}: ScrollToTopProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Use different threshold based on device
  const activeThreshold = isMobile ? mobileThreshold : threshold;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > activeThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className={`fixed ${isMobile ? 'bottom-14' : 'bottom-8'} right-4 p-6 rounded-full 
                     bg-[#042A2B] hover:bg-[#62A87C] 
                     shadow-lg transition-all duration-300 hover:shadow-xl z-50
                     group flex items-center justify-center ${className}`}
          aria-label="Scroll to top"
        >
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white transform transition-transform duration-300 group-hover:-translate-y-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
} 