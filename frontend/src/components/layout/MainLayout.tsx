'use client';

import React from 'react';
import SideNav from './SideNav';
import MobileNavbar from './MobileNavbar';
import { useAuth } from '@/contexts/AuthContext';

// Import SVG components
import WaLogoSvg from '@/components/icons/WaLogoSvg';
import WealthArcSvg from '@/components/icons/WealthArcSvg';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#192A38]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[#192A38] text-white md:flex-row">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block md:w-64 h-screen fixed bg-[#004346]">
        <SideNav />
      </div>
      
      {/* Mobile header - shown only on mobile */}
      {/* <div className="md:hidden bg-[#004346] p-4 fixed top-0 left-0 w-full z-40 flex items-center justify-center">
        <div className="flex items-center">
          <WaLogoSvg className="w-8 h-8 mr-3" />
          <WealthArcSvg className="w-32 h-32" />
        </div>
      </div> */}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation - hidden on desktop */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>
    </div>
  );
};

export default MainLayout; 