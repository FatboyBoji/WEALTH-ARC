'use client';

import React from 'react';
import { Insight } from '@/lib/dashboardApi';

interface InsightCardsProps {
  insights: Insight[];
  onViewInsight: (insight: Insight) => void;
}

export default function InsightCards({ insights, onViewInsight }: InsightCardsProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-[#004346] rounded-xl p-6 text-center">
        <p className="text-gray-400">No insights available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {insights.map(insight => (
        <div 
          key={insight.id} 
          className="bg-[#004346] rounded-xl p-4 cursor-pointer hover:bg-[#005255]"
          onClick={() => onViewInsight(insight)}
        >
          <h3 className="font-medium text-[#09BC8A]">{insight.title}</h3>
          <p className="text-sm text-gray-300 mt-1 line-clamp-1">{insight.description}</p>
        </div>
      ))}
    </div>
  );
} 