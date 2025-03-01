'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WalletLoadingStatesProps {
  isLoading: boolean;
  error: string | null;
}

export default function WalletLoadingStates({ isLoading, error }: WalletLoadingStatesProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/50 my-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return null;
} 