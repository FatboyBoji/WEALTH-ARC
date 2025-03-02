'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface WalletActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddCategory: () => void;
}

export default function WalletActions({
  onAddIncome,
  onAddExpense,
  onAddCategory
}: WalletActionsProps) {
  return (
    <div className="mb-8" id="wallet-actions">
      <div className="flex w-full gap-3 mb-4">
        <button
          onClick={onAddIncome}
          className="flex items-center justify-center gap-2 bg-[#09BC8A] text-[#192A38] py-3 px-5 rounded-xl font-medium
                     hover:bg-[#09BC8A]/90 transition-all duration-200 shadow-md hover:shadow-lg
                     active:translate-y-0.5 active:shadow-sm flex-1"
        >
          <Plus className="w-5 h-5" />
          <span>Add Income</span>
        </button>
        
        <button
          onClick={onAddExpense}
          className="flex items-center justify-center gap-2 bg-[#212121] text-white py-3 px-5 rounded-xl font-medium
                     hover:bg-[#2e2e2e] transition-all duration-200 shadow-md hover:shadow-lg 
                     active:translate-y-0.5 active:shadow-sm flex-1"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>
      
      <button
        onClick={onAddCategory}
        className="flex items-center gap-2 bg-[#004346] text-white py-3 px-5 rounded-xl font-medium
                   hover:bg-[#005255] transition-all duration-200 w-full justify-center
                   border border-[#09BC8A]/30 shadow-sm hover:shadow-md
                   active:translate-y-0.5 active:shadow-none"
      >
        <Plus className="w-5 h-5" />
        <span>Add Category</span>
      </button>
    </div>
  );
} 