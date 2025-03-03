'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface MonthlyOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  isLoading?: boolean;
  title?: string;
  period?: 'month' | 'year' | 'all';
}

export function MonthlyOverview({ 
  totalIncome, 
  totalExpenses, 
  remainingBudget, 
  isLoading = false,
  title = 'Monthly Overview',
  period = 'month'
}: MonthlyOverviewProps) {
  
  // Get description text based on period
  const getDescription = () => {
    switch(period) {
      case 'year': 
        return 'Your yearly financial summary';
      case 'all':
        return 'Your all-time financial summary';
      default:
        return 'Your current month at a glance';
    }
  };

  return (
    <Card className="col-span-3 lg:col-span-3 bg-[#1e2c39] border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-gray-400">{getDescription()}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#004346] p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-32 mb-1"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#004346] p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <ArrowUpIcon className="h-4 w-4 mr-1 text-[#09BC8A]" /> 
                Income
              </div>
              <p className="text-xl font-medium text-[#09BC8A]">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-gray-400">
                {period === 'month' ? 'Total income this month' : 
                 period === 'year' ? 'Total income this year' : 
                 'Total all-time income'}
              </p>
            </div>
            
            <div className="bg-[#004346] p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <ArrowDownIcon className="h-4 w-4 mr-1 text-red-400" /> 
                Expenses
              </div>
              <p className="text-xl font-medium text-red-400">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-gray-400">
                {period === 'month' ? 'Total expenses this month' : 
                 period === 'year' ? 'Total expenses this year' : 
                 'Total all-time expenses'}
              </p>
            </div>
            
            <div className="bg-[#004346] p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                Remaining Budget
              </div>
              <p className={`text-xl font-medium ${remainingBudget >= 0 ? 'text-[#09BC8A]' : 'text-red-400'}`}>
                {formatCurrency(remainingBudget)}
              </p>
              <p className="text-xs text-gray-400">
                {period === 'month' ? 'Available for this month' : 
                 period === 'year' ? 'Available for this year' : 
                 'All-time total savings'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 