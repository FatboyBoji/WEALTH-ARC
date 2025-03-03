'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WealthArcSvg from '@/components/icons/WealthArcSvg';
import WaLogoSvg from '@/components/icons/WaLogoSvg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'error'|'info'|'success', message: string}|null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would implement the actual API call to initiate password reset
      // For now, we'll simulate a successful submission
      
      // Simulating API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatusMessage({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.'
      });

      // Reset form
      setEmail('');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to send reset instructions. Please try again.'
      });
    } finally {
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
          <p className="mt-2 text-[#F3FFFC] text-xl">Reset Your Password</p>
        </div>
        
        {statusMessage?.type === 'success' ? (
          <div className="space-y-6">
            <div className="bg-green-500/20 border border-green-500 text-green-100 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {statusMessage.message}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-3 px-6 border border-transparent text-base font-medium rounded-lg text-[#192A38] bg-[#09BC8A] hover:bg-[#09BC8A]/90 transition-colors duration-200"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {statusMessage && (
              <div className={`${
                statusMessage.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 
                statusMessage.type === 'info' ? 'bg-blue-500/20 border-blue-500 text-blue-100' : ''
              } border p-4 rounded-lg flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {statusMessage.message}
              </div>
            )}
            
            <div>
              <p className="text-sm text-[#F3FFFC] mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#F3FFFC] mb-2">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending...
                  </div>
                ) : 'Send Reset Instructions'}
              </button>
            </div>
            
            <div className="text-center text-sm text-[#F3FFFC]">
              <Link href="/auth/login" className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200">
                Return to login
              </Link>
            </div>
            
            <div className="border-t border-[#09BC8A]/20 pt-4 mt-4">
              <p className="text-sm text-[#F3FFFC] text-center">
                Need additional help?{' '}
                <a 
                  href="http://178.254.26.117:45678/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200"
                >
                  Contact support
                </a>
              </p>
            </div>
          </form>
        )}
        
        <div className="pt-4 text-center">
          <div className="flex justify-center mt-4">
            <WaLogoSvg className="h-auto w-auto opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
} 