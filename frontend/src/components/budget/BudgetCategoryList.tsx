'use client';

import React from 'react';
import { Category, BudgetItem } from '@/lib/budgetApi';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface BudgetCategoryListProps {
  title: string;
  titleColor: string;
  amountColor: string;
  categories: Array<Category & { items: BudgetItem[] }>;
  collapsedSections: Record<string, boolean>;
  onToggleSection: (categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function BudgetCategoryList({
  title,
  titleColor,
  amountColor,
  categories,
  collapsedSections,
  onToggleSection,
  onDeleteItem
}: BudgetCategoryListProps) {
  if (categories.length === 0) return null;
  
  return (
    <div>
      <h2 className={`text-2xl font-medium mb-4 ${titleColor}`}>{title}</h2>
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="bg-[#004346] rounded-xl overflow-hidden">
            {/* Category Header */}
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => onToggleSection(category.id)}
            >
              <h3 className="text-lg font-medium">{category.name}</h3>
              <div className="flex items-center">
                <span className={`mr-3 ${amountColor}`}>
                  €{category.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </span>
                {collapsedSections[category.id] ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {/* Category Items */}
            {!collapsedSections[category.id] && (
              <div className="border-t border-gray-700/30">
                {category.items.map(item => (
                  <div 
                    key={item.id} 
                    className="p-4 flex justify-between items-center border-b border-gray-700/20 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.repeat === 1 ? 'One-time' : 
                         item.repeat === 2 ? 'Monthly' : 
                         item.repeat === 3 ? 'Quarterly' : 'Yearly'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-4 ${amountColor}`}>€{item.amount.toFixed(2)}</span>
                      <button 
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 