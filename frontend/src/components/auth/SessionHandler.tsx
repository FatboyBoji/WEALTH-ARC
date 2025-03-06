'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import tokenService from '@/lib/tokenService';

export default function SessionHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isRefreshingRef = useRef(false);
  
  useEffect(() => {
    // Skip for auth pages
    if (pathname.startsWith('/auth')) {
      return;
    }
    
    const checkTokenStatus = async () => {
      // Prevent concurrent checks
      if (isRefreshingRef.current) return;
      
      try {
        isRefreshingRef.current = true;
        
        // Check if token is expiring soon (within 2 minutes)
        if (tokenService.isAccessTokenExpiring(120)) {
          console.log('Access token expiring soon, attempting refresh');
          const success = await tokenService.checkAndRefreshToken();
          
          if (!success) {
            console.log('Failed to refresh token, redirecting to login');
            router.push('/auth/login?session=expired');
          }
        }
      } catch (error) {
        console.error('Error checking token status:', error);
      } finally {
        isRefreshingRef.current = false;
      }
    };
    
    // Check immediately and set interval
    checkTokenStatus();
    const interval = setInterval(checkTokenStatus, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [pathname, router]);
  
  return null;
} 