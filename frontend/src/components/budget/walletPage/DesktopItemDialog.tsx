'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/lib/budgetApi';
import { Check, AlertCircle } from 'lucide-react';

interface DesktopItemDialogProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  itemType: 'income' | 'expense';
  categories: Category[];
  formData: {
    name: string;
    amount: string;
    categoryId: string;
    repeat: number;
    itemType: 'income' | 'expense';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    amount: string;
    categoryId: string;
    repeat: number;
    itemType: 'income' | 'expense';
  }>>;
  formErrors: string[];
  successMessage: string;
  repeatOptions: {value: number; label: string}[];
}

export default function DesktopItemDialog({
  open,
  onOpenChange,
  onSubmit,
  itemType,
  categories,
  formData,
  setFormData,
  formErrors,
  successMessage,
  repeatOptions
}: DesktopItemDialogProps) {
  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === itemType && cat.isVisible);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Add {itemType === 'income' ? 'Income' : 'Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-[#004346] border-none text-white rounded-xl"
                placeholder={`What is this ${itemType} for?`}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-[#004346] border-none text-white rounded-xl"
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="flex h-10 w-full rounded-xl border-none bg-[#004346] px-3 py-1 text-white"
              >
                <option value="">Select a category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="repeat">Repeat</Label>
              <select
                id="repeat"
                value={formData.repeat}
                onChange={(e) => setFormData({...formData, repeat: Number(e.target.value)})}
                className="flex h-10 w-full rounded-xl border-none bg-[#004346] px-3 py-1 text-white"
              >
                {repeatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Error messages */}
            {formErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/50">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    {formErrors.map((err, index) => (
                      <p key={index} className="text-red-400 text-sm">{err}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Success message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-green-900/20 border border-green-800/50">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-[#09BC8A] mr-2" />
                  <p className="text-[#09BC8A] text-sm">{successMessage}</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl"
            >
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 