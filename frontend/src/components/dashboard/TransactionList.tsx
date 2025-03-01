'use client';

import React from 'react';
import { Transaction } from '@/lib/dashboardApi';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onViewTransaction }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#004346] rounded-xl p-6 text-center">
        <p className="text-gray-400">No recent transactions</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <div 
          key={transaction.id} 
          className="bg-[#004346] rounded-xl p-4 cursor-pointer hover:bg-[#005255]"
          onClick={() => onViewTransaction(transaction)}
        >
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{transaction.name}</h3>
              <p className="text-sm text-gray-400">{transaction.category} • {formatDate(transaction.date)}</p>
            </div>
            <p className={transaction.amount < 0 ? 'text-red-400' : 'text-[#09BC8A]'}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 