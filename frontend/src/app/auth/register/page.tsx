'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { validatePassword } from '@/utils/passwordPolicy';
import WealthArcSvg from '@/components/icons/WealthArcSvg';
import WaLogoSvg from '@/components/icons/WaLogoSvg';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { register, isLoading, error } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordErrors.length > 0) {
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }
    
    await register(username, email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#192A38] pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#004346] rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-0">
            <WealthArcSvg className="h-14 w-auto" />
          </div>
          {/* <p className="mt-2 text-[#F3FFFC] text-xl">Create your account</p> */}
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
          
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#F3FFFC] mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F3FFFC] mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F3FFFC] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
              />
              {passwordErrors.length > 0 && (
                <ul className="mt-2 text-sm text-red-300 space-y-1 pl-5 list-disc">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F3FFFC] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-[#192A38] border border-[#09BC8A]/30 placeholder-gray-400 text-[#F3FFFC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09BC8A] focus:border-transparent"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {password !== confirmPassword && confirmPassword && (
                <p className="mt-2 text-sm text-red-300">Passwords do not match</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0 || password !== confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-[#192A38] bg-[#09BC8A] hover:bg-[#09BC8A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09BC8A] transition-colors duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : 'Register'}
            </button>
          </div>
          
          <div className="text-center text-sm text-[#F3FFFC]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-[#09BC8A] hover:text-[#09BC8A]/80 hover:underline transition-colors duration-200">
              Sign in
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
};

export default RegisterPage; 