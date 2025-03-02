'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Calendar } from '@heroui/calendar';
import { parseDate, CalendarDate, DateValue } from '@internationalized/date';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/dashboardApi'; // Adjust based on your API
import { formatCurrency, formatDate } from '@/lib/utils'; // Adjust based on your utils
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTransaction } from '@/lib/dashboardApi';
import { CalendarIcon } from 'lucide-react';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onTransactionUpdated?: (updatedTransaction: Transaction) => void;
}

export default function TransactionDrawer({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated
}: TransactionDrawerProps) {
  if (!transaction) return null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleStartEdit = () => {
    setEditedTransaction(transaction);
    setIsEditing(true);
    setSaveError(null);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarOpen) {
        const target = e.target as HTMLElement;
        // Check if click is inside calendar
        if (!target.closest('.calendar-overlay-content')) {
          setCalendarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [calendarOpen]);

  const handleSaveChanges = async () => {
    if (!editedTransaction) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      console.log('Saving transaction with data:', editedTransaction);
      
      const updated = await updateTransaction(editedTransaction.id, {
        name: editedTransaction.name,
        amount: editedTransaction.amount,
        notes: editedTransaction.notes,
        date: editedTransaction.date
      });
      
      console.log('Transaction updated successfully:', updated);
      
      // Notify parent component of the update
      if (onTransactionUpdated) {
        onTransactionUpdated(updated);
      }
      
      setIsEditing(false);
      onClose();
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      setSaveError('Failed to update transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Parse ISO string to CalendarDate for @heroui/calendar
  const getSelectedCalendarDate = (): DateValue | undefined => {
    if (!editedTransaction?.date) return undefined;
    
    try {
      const date = new Date(editedTransaction.date);
      return parseDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    } catch (error) {
      console.error("Failed to parse date:", error);
      return undefined;
    }
  };

  // Handle date selection
  const handleDateSelect = (date: DateValue) => {
    if (!editedTransaction) return;
    
    // Convert CalendarDate to JavaScript Date
    const jsDate = new Date(date.year, date.month - 1, date.day, 12, 0, 0);
    const formattedDate = jsDate.toISOString();
    
    console.log('Selected date:', jsDate);
    console.log('Formatted date for storage:', formattedDate);
    
    setEditedTransaction({
      ...editedTransaction,
      date: formattedDate
    });
    
    // Close the calendar
    setCalendarOpen(false);
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onOpenChange={onClose} 
      placement="bottom"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "drawer-slide-up",
        closeButton: "hidden"
      }}
    >
      <DrawerContent className="bg-[#192A38] text-white rounded-t-2xl max-h-[90vh]">
        {() => (
          <>
            <DrawerHeader className="border-b border-gray-700/30 pb-4 pt-6 relative">
              <h2 className="text-2xl font-medium text-center">
                Transaction Details
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-6 text-gray-400 hover:text-white hover:bg-[#004346]/50 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Close</span>
              </Button>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5 relative">
              {calendarOpen && (
                <div className="calendar-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="calendar-overlay-content bg-[#192A38] rounded-xl p-4 shadow-xl border border-gray-700/30 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Select Date</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCalendarOpen(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                    <Calendar 
                      aria-label="Select date"
                      value={getSelectedCalendarDate()}
                      onChange={handleDateSelect}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="text-xl font-medium">{transaction.name}</h3>
                    <div className={`text-xl font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-700/30 py-2">
                      <span className="text-gray-400">Date</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700/30 py-2">
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
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
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
                      <Label htmlFor="date">Date</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCalendarOpen(true)}
                        className="w-full justify-start text-left font-normal bg-[#004346] border-none hover:bg-[#005255] text-white rounded-xl mt-1 h-11 flex items-center cursor-pointer"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTransaction?.date 
                          ? formatDate(editedTransaction.date)
                          : "Select date"}
                        <div className="ml-auto opacity-70 text-sm">(Click to change)</div>
                      </Button>
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
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                  >
                    Close
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleStartEdit}
                    className="flex-1 bg-[#004346] border-none text-white hover:bg-[#005255] rounded-xl h-14 font-medium"
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setSaveError(null); }}
                    className="flex-1 bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSaveChanges}
                    className="flex-1 bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl h-14 font-medium"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </div>
                    ) : 'Save Changes'}
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