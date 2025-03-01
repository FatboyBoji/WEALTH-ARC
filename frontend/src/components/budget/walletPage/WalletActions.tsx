'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

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
    <div className="flex flex-wrap gap-3 mb-6">
      <Button 
        onClick={onAddIncome}
        className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl px-4"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Income
      </Button>
      
      <Button 
        onClick={onAddExpense}
        className="bg-[#212121] text-white hover:bg-gray-800 rounded-xl px-4"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Expense
      </Button>
      
      <Button 
        onClick={onAddCategory}
        className="bg-[#004346] text-white hover:bg-[#005b5e] rounded-xl px-4"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Category
      </Button>
    </div>
  );
} 