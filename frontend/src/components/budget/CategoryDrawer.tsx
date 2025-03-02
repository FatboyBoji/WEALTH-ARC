'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  categoryType: 'income' | 'expense' | 'mixed';
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
  isSubmitting?: boolean;
}

export default function CategoryDrawer({
  isOpen,
  onClose,
  onSubmit,
  categoryType,
  formData,
  setFormData,
  formErrors,
  successMessage,
  isSubmitting
}: CategoryDrawerProps) {
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
                Add New Category
              </h2>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5">
              <form onSubmit={onSubmit} id="category-form" className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="categoryName" className="text-[#F3FFFC] font-medium">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1"
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
                      <RadioGroupItem value="income" id="income" className="text-[#09BC8A]" />
                      <Label htmlFor="income" className="cursor-pointer font-normal text-[#F3FFFC]">
                        Income Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#004346]/50 p-3 rounded-lg">
                      <RadioGroupItem value="expense" id="expense" className="text-[#09BC8A]" />
                      <Label htmlFor="expense" className="cursor-pointer font-normal text-[#F3FFFC]">
                        Expense Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#004346]/50 p-3 rounded-lg">
                      <RadioGroupItem value="mixed" id="mixed" className="text-[#09BC8A]" />
                      <Label htmlFor="mixed" className="cursor-pointer font-normal text-[#F3FFFC]">
                        Mixed (Both Income & Expenses)
                      </Label>
                    </div>
                  </RadioGroup>
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
                  form="category-form"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl h-14 font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#192A38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Category...</span>
                    </div>
                  ) : 'Create Category'}
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
} 