'use client';

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/dashboardApi'; // Adjust based on your API
import { formatCurrency, formatDate } from '@/lib/utils'; // Adjust based on your utils
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTransaction } from '@/lib/dashboardApi';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionDrawer({
  isOpen,
  onClose,
  transaction
}: TransactionDrawerProps) {
  if (!transaction) return null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditedTransaction(transaction);
    setIsEditing(true);
    setSaveError(null);
  };

  const handleSaveChanges = async () => {
    if (!editedTransaction) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updated = await updateTransaction(editedTransaction.id, {
        name: editedTransaction.name,
        amount: editedTransaction.amount,
        notes: editedTransaction.notes
      });
      
      setIsEditing(false);
      onClose();
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      setSaveError('Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onOpenChange={onClose} 
      placement="bottom"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "drawer-slide-up"
      }}
    >
      <DrawerContent className="bg-[#192A38] text-white rounded-t-2xl max-h-[90vh]">
        {() => (
          <>
            <DrawerHeader className="border-b border-gray-700/30 pb-4 pt-6">
              <h2 className="text-2xl font-medium text-center">
                Transaction Details
              </h2>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5">
              {!isEditing ? (
                // View Mode
                <div className="space-y-4">
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
                  
                  <Button 
                    type="button" 
                    onClick={handleStartEdit}
                    className="w-full bg-[#004346] border-none text-white hover:bg-[#005255] rounded-xl mt-4"
                  >
                    Edit Transaction
                  </Button>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Transaction Name</Label>
                      <Input
                        id="name"
                        value={editedTransaction?.name || ''}
                        onChange={(e) => setEditedTransaction({
                          ...editedTransaction!,
                          name: e.target.value
                        })}
                        className="bg-[#004346] border-none text-white rounded-xl mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={Math.abs(editedTransaction?.amount || 0)}
                        onChange={(e) => setEditedTransaction({
                          ...editedTransaction!,
                          amount: (editedTransaction?.amount || 0) < 0 
                            ? -Math.abs(parseFloat(e.target.value))
                            : Math.abs(parseFloat(e.target.value))
                        })}
                        className="bg-[#004346] border-none text-white rounded-xl mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={editedTransaction?.notes || ''}
                        onChange={(e) => setEditedTransaction({
                          ...editedTransaction!,
                          notes: e.target.value
                        })}
                        className="bg-[#004346] border-none text-white rounded-xl mt-1"
                      />
                    </div>
                  </div>
                  
                  {saveError && (
                    <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/50">
                      <p className="text-red-400 text-sm">{saveError}</p>
                    </div>
                  )}
                </div>
              )}
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-700/30 pt-4 pb-8 px-5">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={onClose}
                  className="w-full bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                >
                  Close
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 rounded-xl font-medium"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSaveChanges}
                    className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl font-medium"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
} 