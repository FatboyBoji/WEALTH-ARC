'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Import SVG components
import HomeSvg from '@/components/icons/HomeSvg';
import WalletSvg from '@/components/icons/WalletSvg';
import StatisticSvg from '@/components/icons/StatisticSvg';
import SettingsSvg from '@/components/icons/SettingsSvg';
import FilesSvg from '@/components/icons/FilesSvg';

const MobileNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(-1);
  const prevActiveIndexRef = useRef(-1);
  const initialRender = useRef(true);
  const navbarRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeSvg },
    { name: 'Wallet', path: '/wallet', icon: WalletSvg },
    { name: 'Statistics', path: '/statistics', icon: StatisticSvg },
    { name: 'Profile', path: '/profile', icon: SettingsSvg },
  ];
  
  // Add admin route for admin users
  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: FilesSvg });
  }
  
  // Set active index based on current pathname and remember the previous index
  useEffect(() => {
    const index = navItems.findIndex(item => item.path === pathname);
    if (index !== -1) {
      prevActiveIndexRef.current = activeIndex;
      setActiveIndex(index);
    }
  }, [pathname, navItems, activeIndex]);
  
  const handleNavClick = (index: number) => {
    if (index !== activeIndex) {
      prevActiveIndexRef.current = activeIndex;
      setActiveIndex(index);
    }
  };

  const getIndicatorStyle = () => {
    if (activeIndex < 0 || !navbarRef.current) 
      return { opacity: 0 };
    
    // Calculate the width of each nav item section
    const navbarWidth = navbarRef.current.getBoundingClientRect().width;
    const sectionWidth = navbarWidth / navItems.length;
    
    // Calculate the x position based on the center of the active section
    const xPosition = (activeIndex * sectionWidth) + (sectionWidth / 2);
    
    return {
      left: `${xPosition}px`,
      transform: 'translateX(-50%)',
      opacity: 1
    };
  };

  return (
    <nav className="mobile-nav-container">
      <div 
        ref={navbarRef}
        className="mobile-nav-navigation h-20 bg-[#004346] rounded-t-xl relative overflow-visible"
      >
        <ul className="flex w-full h-full m-0 p-0 relative">
          {navItems.map((item, index) => (
            <li 
              key={item.path}
              className={`mobile-nav-list ${index === activeIndex ? 'active' : ''}`}
              style={{ width: `${100 / navItems.length}%`, '--clr': '#09BC8A' } as React.CSSProperties}
              onClick={() => handleNavClick(index)}
            >
              <Link 
                href={item.path}
                className="relative flex justify-center items-center h-full w-full"
                onClick={(e) => {
                  if (pathname === item.path) {
                    e.preventDefault();
                  }
                }}
                scroll={false} /* Prevent page scrolling to top */
                prefetch={true} /* Prefetch the page content */
              >
                <span className="mobile-nav-icon relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 delay-0">
                  <item.icon className="w-9 h-9 absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                </span>
              </Link>
            </li>
          ))}
          <div 
            className="mobile-nav-indicator" 
            style={getIndicatorStyle()}
          ></div>
        </ul>
      </div>
    </nav>
  );
};

export default MobileNavbar; 