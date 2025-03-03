'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WealthArcSvg from '@/components/icons/WealthArcSvg';
import WaLogoSvg from '@/components/icons/WaLogoSvg';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'error'|'info'|'success', message: string}|null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  useEffect(() => {
    // Validate that we have the required parameters
    if (!email || !token) {
      router.replace('/auth/forgot-password');
    }
  }, [email, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 8) {
      setStatusMessage({
        type: 'error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        message: 'Passwords do not match.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be an actual API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to login with success message
      router.push('/auth/login?passwordReset=success');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to reset password. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#192A38]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#004346] rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <WealthArcSvg className="h-auto w-auto" />
          </div>
          <p className="mt-2 text-[#F3FFFC] text-xl">Create New Password</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {statusMessage && (
            <div className={`${
              statusMessage.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 
              statusMessage.type === 'info' ? 'bg-blue-500/20 border-blue-500 text-blue-100' : 'bg-green-500/20 border-green-500 text-green-100'
            } border p-4 rounded-lg flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {statusMessage.message}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <p className="text-sm text-[#F3FFFC] mb-4">
                Please create a new password for your account.
              </p>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#F3FFFC] mb-2">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F3FFFC] mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-[#192A38] bg-[#09BC8A] hover:bg-[#09BC8A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09BC8A] transition-colors duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </div>
              ) : 'Reset Password'}
            </button>
          </div>
        </form>
        
        <div className="pt-4 text-center">
          <div className="flex justify-center mt-4">
            <WaLogoSvg className="h-auto w-auto opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
} 