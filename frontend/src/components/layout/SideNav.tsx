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
import WaLogoSvg from '@/components/icons/WaLogoSvg';
import WealthArcSvg from '@/components/icons/WealthArcSvg';

const SideNav: React.FC = () => {
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
    <div className="h-full flex flex-col">
      {/* App Logo */}
      <div className="p-6 flex items-center">
        {/* <WaLogoSvg className="w-auto h-auto mr-1" /> */}
        <WealthArcSvg className="w-full h-full" />
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center text-4xl space-x-3 px-4 py-3 rounded-lg hover:bg-[#015d5f] transition-colors ${
                  isActive(item.path) ? 'bg-[#09BC8A] text-white' : 'text-gray-300'
                }`}
              >
                <item.icon className="w-12 h-12" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Info */}
      <div className="p-4 border-t border-[#015d5f]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#09BC8A] flex items-center justify-center">
            {user?.username?.substring(0, 1)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-white font-medium">{user?.username}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav; 