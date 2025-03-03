'use client';

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadIcon, Loader2 } from 'lucide-react';
import { exportTransactionsToCSV, TransactionForExport } from '@/lib/exportUtils';
import { fetchBudgetItems, BudgetItem } from '@/lib/budgetApi';
import { Label } from '@/components/ui/label';

interface ExportTransactionsDialogProps {
  trigger?: React.ReactNode;
  year: number;
}

export function ExportTransactionsDialog({ trigger, year }: ExportTransactionsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [isExporting, setIsExporting] = useState(false);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Fetch budget items for the selected month and year
      const items = await fetchBudgetItems(parseInt(selectedMonth), year);
      
      // Convert budget items to transaction format
      const transactions: TransactionForExport[] = items.map((item: BudgetItem) => ({
        date: new Date(year, parseInt(selectedMonth) - 1, 15).toISOString(),
        type: item.itemType,
        name: item.name,
        amount: item.amount,
        category: item.category?.name
      }));
      
      // Sort by date
      transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Export to CSV
      exportTransactionsToCSV(
        transactions, 
        monthNames[parseInt(selectedMonth) - 1], 
        year
      );
      
      // Close drawer after export
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Create button that opens the drawer
  const triggerButton = trigger || (
    <Button className="bg-[#09BC8A] hover:bg-[#07a176] text-white">
      <DownloadIcon className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );

  return (
    <>
      {/* Button to open the drawer */}
      {React.cloneElement(triggerButton as React.ReactElement, {
        onClick: () => setIsOpen(true)
      })}
      
      {/* Export Drawer */}
      <Drawer 
        isOpen={isOpen} 
        onOpenChange={handleClose} 
        placement="bottom"
        classNames={{
          closeButton: "hidden",
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "drawer-slide-up"
        }}
      >
        <DrawerContent className="bg-[#192A38] text-white rounded-t-2xl max-h-[90vh]">
          {() => (
            <>
              <DrawerHeader className="border-b border-gray-700/30 pb-4 pt-6">
                <h2 className="text-2xl font-medium text-[#09BC8A] text-center">
                  Export Transactions
                </h2>
                <Button
                  onClick={handleClose}
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

              <DrawerBody className="py-6 px-5">
                <div className="space-y-4">
                  <Label htmlFor="monthSelect" className="text-[#F3FFFC] font-medium">
                    Select Month to Export
                  </Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger id="monthSelect" className="bg-[#004346] border-none text-white h-14 rounded-xl shadow-sm focus:ring-[#09BC8A] focus:ring-1">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <p className="text-gray-400 text-sm mt-2">
                    This will export all transactions for {monthNames[parseInt(selectedMonth) - 1]} {year} as a CSV file.
                  </p>
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t border-gray-700/30 pt-4 pb-8 px-5">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button 
                    type="button" 
                    onClick={handleClose}
                    className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl h-14 font-medium"
                  >
                    {isExporting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Exporting...</span>
                      </div>
                    ) : (
                      <>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Export CSV
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
} 