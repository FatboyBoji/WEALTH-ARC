'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WealthArcSvg from '@/components/icons/WealthArcSvg';
import WaLogoSvg from '@/components/icons/WaLogoSvg';

export default function VerifyCodePage() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'error'|'info'|'success', message: string}|null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  useEffect(() => {
    if (!email) {
      router.replace('/auth/forgot-password');
      return;
    }
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatusMessage({
            type: 'error',
            message: 'Verification code has expired. Please request a new one.'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [email, router]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter a valid 6-digit code.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be an actual API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now we'll use a simulated successful verification
      router.push(`/auth/reset-password?email=${encodeURIComponent(email || '')}&token=${code}`);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Invalid verification code. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setStatusMessage({
      type: 'info',
      message: 'Sending a new verification code...'
    });
    
    try {
      // This would be an actual API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimeRemaining(600); // Reset timer
      setStatusMessage({
        type: 'success',
        message: 'A new verification code has been sent to your email.'
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to send a new code. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#192A38]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#004346] rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <WealthArcSvg className="h-auto w-auto" />
          </div>
          <p className="mt-2 text-[#F3FFFC] text-xl">Verify Your Email</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {statusMessage && (
            <div className={`${
              statusMessage.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 
              statusMessage.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-blue-500/20 border-blue-500 text-blue-100'
            } border p-4 rounded-lg flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {statusMessage.message}
            </div>
          )}
          
          <div>
            <p className="text-sm text-[#F3FFFC] mb-4">
              We've sent a 6-digit verification code to <span className="font-bold">{email}</span>.
              Please enter the code below to continue resetting your password.
            </p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[#F3FFFC] mb-2">Verification Code</label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              />
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-[#F3FFFC]">
                Time remaining: <span className={timeRemaining < 60 ? 'text-red-400 font-medium' : 'text-[#09BC8A]'}>{formatTime(timeRemaining)}</span>
              </span>
              <button 
                type="button" 
                onClick={handleResendCode}
                className="text-sm text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200"
              >
                Resend code
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || timeRemaining === 0 || code.length !== 6}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-[#192A38] bg-[#09BC8A] hover:bg-[#09BC8A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09BC8A] transition-colors duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : 'Verify Code'}
            </button>
          </div>
          
          <div className="text-center text-sm text-[#F3FFFC]">
            <Link href="/auth/forgot-password" className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200">
              Back to reset password
            </Link>
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