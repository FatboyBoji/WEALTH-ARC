'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DesktopCategoryDialogProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: {
    name: string;
    type: 'income' | 'expense' | 'mixed';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    type: 'income' | 'expense' | 'mixed';
  }>>;
  formErrors: string[];
  successMessage: string;
}

export default function DesktopCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  formData,
  setFormData,
  formErrors,
  successMessage
}: DesktopCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Add {formData.type === 'income' ? 'Income' : formData.type === 'expense' ? 'Expense' : 'Mixed'} Category
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-[#004346] border-none text-white rounded-xl"
                placeholder="Enter category name"
              />
            </div>
            
            <div className="space-y-4">
              <Label className="text-[#F3FFFC] font-medium">Category Type</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value: string) => setFormData({...formData, type: value as 'income' | 'expense' | 'mixed'})}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-2 bg-[#004346]/50 p-3 rounded-lg">
                  <RadioGroupItem value="income" id="desktop-income" className="text-[#09BC8A]" />
                  <Label htmlFor="desktop-income" className="cursor-pointer font-normal text-[#F3FFFC]">
                    Income Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-[#004346]/50 p-3 rounded-lg">
                  <RadioGroupItem value="expense" id="desktop-expense" className="text-[#09BC8A]" />
                  <Label htmlFor="desktop-expense" className="cursor-pointer font-normal text-[#F3FFFC]">
                    Expense Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-[#004346]/50 p-3 rounded-lg">
                  <RadioGroupItem value="mixed" id="desktop-mixed" className="text-[#09BC8A]" />
                  <Label htmlFor="desktop-mixed" className="cursor-pointer font-normal text-[#F3FFFC]">
                    Mixed (Both Income & Expenses)
                  </Label>
                </div>
              </RadioGroup>
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
              Add Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 