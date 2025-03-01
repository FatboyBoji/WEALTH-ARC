'use client';

import React from 'react';
import { Category, BudgetItem } from '@/lib/budgetApi';
import MonthSelector from '@/components/budget/MonthSelector';
import BudgetSummaryCard from '@/components/budget/BudgetSummaryCard';
import BudgetCategoryList from '@/components/budget/BudgetCategoryList';
import WalletActions from '@/components/budget/walletPage/WalletActions';
import { BudgetSummary } from '@/lib/budgetApi';

interface WalletContentProps {
  formattedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  summary: BudgetSummary;
  incomeCategories: Array<Category & { items: BudgetItem[] }>;
  expenseCategories: Array<Category & { items: BudgetItem[] }>;
  collapsedSections: Record<string, boolean>;
  onToggleSection: (categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddCategory: () => void;
}

export default function WalletContent({
  formattedDate,
  onPrevMonth,
  onNextMonth,
  summary,
  incomeCategories,
  expenseCategories,
  collapsedSections,
  onToggleSection,
  onDeleteItem,
  onAddIncome,
  onAddExpense,
  onAddCategory
}: WalletContentProps) {
  return (
    <div>
      <MonthSelector 
        formattedDate={formattedDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      
      <BudgetSummaryCard summary={summary} />
      
      <WalletActions 
        onAddIncome={onAddIncome}
        onAddExpense={onAddExpense}
        onAddCategory={onAddCategory}
      />
      
      <div className="space-y-8">
        <BudgetCategoryList
          title="Income"
          titleColor="text-[#09BC8A]"
          amountColor="text-[#09BC8A]"
          categories={incomeCategories}
          collapsedSections={collapsedSections}
          onToggleSection={onToggleSection}
          onDeleteItem={onDeleteItem}
        />
        
        <BudgetCategoryList
          title="Expenses"
          titleColor="text-red-400"
          amountColor="text-red-400"
          categories={expenseCategories}
          collapsedSections={collapsedSections}
          onToggleSection={onToggleSection}
          onDeleteItem={onDeleteItem}
        />
      </div>
    </div>
  );
} 