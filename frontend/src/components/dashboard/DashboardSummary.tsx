'use client';

import React from 'react';
import { AccountSummary } from '@/lib/dashboardApi';
import { formatCurrency } from '@/lib/utils';

interface DashboardSummaryProps {
  summary: AccountSummary;
}

export default function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#004346] rounded-xl p-4">
        <h2 className="text-xl mb-2">Total Balance</h2>
        <p className="text-3xl font-medium text-[#09BC8A]">{formatCurrency(summary.totalBalance)}</p>
      </div>
      
      <div className="bg-[#004346] rounded-xl p-4">
        <h2 className="text-xl mb-2">This Month</h2>
        <div className="flex justify-between mt-3">
          <div>
            <p className="text-gray-400 text-sm">Income</p>
            <p className="text-xl text-[#09BC8A]">{formatCurrency(summary.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Expenses</p>
            <p className="text-xl text-red-400">{formatCurrency(summary.monthlyExpenses)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Savings</p>
            <p className="text-xl">{summary.savingsRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
} 