'use client';

import React from 'react';
import { BudgetSummary } from '@/lib/budgetApi';

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export default function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#004346] rounded-xl p-4 md:col-span-1">
        <h2 className="text-xl mb-2">Income</h2>
        <p className="text-2xl font-medium text-[#09BC8A]">€{summary.totalIncome.toFixed(2)}</p>
      </div>
      <div className="bg-[#004346] rounded-xl p-4 md:col-span-1">
        <h2 className="text-xl mb-2">Expenses</h2>
        <p className="text-2xl font-medium text-red-400">€{summary.totalExpenses.toFixed(2)}</p>
      </div>
      <div className="bg-[#004346] rounded-xl p-4 md:col-span-1">
        <h2 className="text-xl mb-2">Remaining</h2>
        <p className={`text-2xl font-medium ${summary.remainingBudget >= 0 ? 'text-[#09BC8A]' : 'text-red-400'}`}>
          €{summary.remainingBudget.toFixed(2)}
        </p>
      </div>
    </div>
  );
} 