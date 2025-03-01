'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/dashboardApi'; // Adjust based on your API
import { formatCurrency, formatDate } from '@/lib/utils'; // Adjust based on your utils

interface DesktopTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export default function DesktopTransactionDialog({
  open,
  onOpenChange,
  transaction
}: DesktopTransactionDialogProps) {
  if (!transaction) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-[#004346] rounded-xl p-4">
            <div className="flex justify-between">
              <h3 className="font-medium">{transaction.name}</h3>
              <span className={transaction.amount < 0 ? 'text-red-400' : 'text-[#09BC8A]'}>
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{formatDate(transaction.date)}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-700/30 pb-2">
              <span className="text-gray-400">Category</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700/30 pb-2">
              <span className="text-gray-400">Account</span>
              <span>{transaction.account}</span>
            </div>
            {transaction.notes && (
              <div className="pt-2">
                <span className="text-gray-400 block mb-1">Notes</span>
                <p className="text-sm">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 