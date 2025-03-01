'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MonthSelectorProps {
  formattedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthSelector({ formattedDate, onPrevMonth, onNextMonth }: MonthSelectorProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <button 
        onClick={onPrevMonth}
        className="p-2 rounded-full hover:bg-[#004346]/50"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
      <h1 className="text-2xl font-medium">{formattedDate}</h1>
      <button 
        onClick={onNextMonth}
        className="p-2 rounded-full hover:bg-[#004346]/50"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
} 