'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/lib/dashboardApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import TransactionDrawer from './TransactionDrawer';
import { CalendarIcon } from '@/components/icons/CalendarIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionsUpdated?: (updatedTransactions: Transaction[]) => void;
  onViewTransaction?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onTransactionsUpdated, onViewTransaction }: TransactionListProps) {
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update local transactions when prop changes
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
    
    if (onViewTransaction) onViewTransaction(transaction);
  };

  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    // Update the transaction in the local state
    const updatedTransactions = localTransactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    
    // Sort transactions by date (newest first)
    // This uses the date that was selected in the calendar
    const sortedTransactions = [...updatedTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setLocalTransactions(sortedTransactions);
    
    // Notify parent component if needed
    if (onTransactionsUpdated) {
      onTransactionsUpdated(sortedTransactions);
    }
  };

  if (localTransactions.length === 0) {
    return (
      <div className="bg-[#004346] rounded-xl p-6 text-center">
        <p className="text-gray-400">No recent transactions</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-3">
        {localTransactions.map(transaction => (
          <div 
            key={transaction.id} 
            className="bg-[#004346] rounded-xl p-4 cursor-pointer hover:bg-[#005255]"
            onClick={() => handleViewTransaction(transaction)}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{transaction.name}</h3>
                <div className="text-sm text-gray-400 flex items-center">
                  <span>{transaction.category}</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
              <p className={transaction.amount < 0 ? 'text-red-400' : 'text-[#09BC8A]'}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedTransaction && (
        <TransactionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          transaction={selectedTransaction}
          onTransactionUpdated={handleTransactionUpdated}
        />
      )}
    </>
  );
} 