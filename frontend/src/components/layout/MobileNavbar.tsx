'use client';

import React from 'react';
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
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
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
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Simple navbar with larger icons */}
      <div className="h-24 bg-[#004346]">
        <div className="flex justify-around items-center h-full">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center ${
                isActive(item.path) ? 'opacity-100' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full ${
                isActive(item.path) ? 'bg-[#09BC8A]' : ''
              }`}>
                <item.icon className="w-19 h-10 text-white" />
              </div>
              {/* <span className="text-xs text-white mt-1 mb-2">{item.name}</span> */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar; 