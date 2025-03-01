'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MobileNavbar from './MobileNavbar';
import SideNav from './SideNav';

// Import SVG components
import WaLogoSvg from '@/components/icons/WaLogoSvg';
import WealthArcSvg from '@/components/icons/WealthArcSvg';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#192A38]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-[#192A38] text-white">
      <div className="md:flex h-full">
        {/* Side navigation (hidden on mobile) */}
        <div className="hidden md:block md:w-80 h-screen bg-[#004346] fixed">
          <SideNav />
        </div>
        
        {/* Mobile header (shown only on mobile) */}
        <div className="md:hidden p-1 pt-2 fixed top-0 left-0 w-full z-40 flex items-center justify-center bg-[#004346]">
          <div className="flex items-center space-x-2">
            {/* Logo on the left - properly sized */}
            <div className="flex-shrink-0 w-auto h-auto">
              <WaLogoSvg className="w-full h-full" />
            </div>
            {/* Text logo with proper sizing */}
            <div className="h-full">
              <WealthArcSvg className="w-auto h-full" />
            </div>
          </div>
        </div>
        
        {/* Main content - with padding for mobile navbar and header */}
        <main className="flex-1 p-6 md:ml-80 mt-8 pt-20 md:pt-6 pb-28 overflow-auto min-h-screen">
          {children}
        </main>
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout; 