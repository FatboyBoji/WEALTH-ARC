'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import WealthArcSvg from '@/components/icons/WealthArcSvg';
import WaLogoSvg from '@/components/icons/WaLogoSvg';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, verifySession } = useAuth();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<{type: 'error'|'info'|'success', message: string}|null>(null);
  const [attemptedVerification, setAttemptedVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  useEffect(() => {
    const sessionExpired = searchParams.get('session') === 'expired';
    
    if (sessionExpired && !attemptedVerification) {
      setStatusMessage({
        type: 'info',
        message: 'Your session has expired. Please log in again to continue.'
      });
      
      setAttemptedVerification(true);
      console.log('Session expired, user needs to log in again');
    }
  }, [searchParams, attemptedVerification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#192A38]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#004346] rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <WealthArcSvg className="h-auto w-auto" />
          </div>
          <p className="mt-2 text-[#F3FFFC] text-xl">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
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
          
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#F3FFFC] mb-2">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F3FFFC] mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-[#192A38] bg-[#09BC8A] hover:bg-[#09BC8A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09BC8A] transition-colors duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm text-[#F3FFFC]">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200">
              Register here
            </Link>
          </div>

          <div className="mt-2 text-center text-sm text-[#F3FFFC]">
            <Link href="/auth/forgot-password" className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200">
              Forgotten password?
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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#192A38]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
} 