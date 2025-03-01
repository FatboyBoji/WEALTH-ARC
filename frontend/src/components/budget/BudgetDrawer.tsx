'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/budgetApi';

interface BudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export default function BudgetDrawer({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  categories,
  formData,
  setFormData,
  formErrors,
  successMessage
}: BudgetDrawerProps) {
  // Repeat options
  const repeatOptions = [
    { value: 1, label: 'No repeat' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Quarterly' },
    { value: 4, label: 'Yearly' }
  ];

  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === itemType && cat.isVisible);

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
              <h2 className="text-2xl font-medium text-[#09BC8A] text-center">
                Add {itemType === 'income' ? 'Income' : 'Expense'}
              </h2>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5">
              <form onSubmit={onSubmit} id="budget-form" className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-[#F3FFFC] font-medium">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                    placeholder={`What is this ${itemType} for?`}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="amount" className="text-[#F3FFFC] font-medium">Amount (€)</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="category" className="text-[#F3FFFC] font-medium">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="flex h-14 w-full rounded-xl border-none bg-[#004346] px-4 py-2 text-white shadow-sm focus:ring-[#09BC8A] focus:ring-1"
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="repeat" className="text-[#F3FFFC] font-medium">Repeat</Label>
                  <select
                    id="repeat"
                    value={formData.repeat}
                    onChange={(e) => setFormData({...formData, repeat: Number(e.target.value)})}
                    className="flex h-14 w-full rounded-xl border-none bg-[#004346] px-4 py-2 text-white shadow-sm focus:ring-[#09BC8A] focus:ring-1"
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
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/50 mt-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
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
                  <div className="p-4 rounded-xl bg-green-900/20 border border-green-800/50 mt-4">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-[#09BC8A] mr-2 flex-shrink-0" />
                      <p className="text-[#09BC8A]">{successMessage}</p>
                    </div>
                  </div>
                )}
              </form>
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-700/30 pt-4 pb-8 px-5">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button 
                  type="button" 
                  onClick={onClose}
                  className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="budget-form"
                  className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl h-14 font-medium"
                >
                  Add {itemType === 'income' ? 'Income' : 'Expense'}
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
} 