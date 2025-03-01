'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { Button } from '@/components/ui/button';
import { Insight } from '@/lib/dashboardApi'; // Adjust based on your API

interface InsightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insight: Insight | null;
}

export default function InsightDrawer({
  isOpen,
  onClose,
  insight
}: InsightDrawerProps) {
  if (!insight) return null;
  
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
              <h2 className="text-2xl font-medium text-center text-[#09BC8A]">
                {insight.title}
              </h2>
            </DrawerHeader>

            <DrawerBody className="py-6 px-5">
              <div className="space-y-6">
                <div className="bg-[#004346] rounded-xl p-4">
                  <p>{insight.description}</p>
                </div>
                
                {insight.data && (
                  <div className="space-y-3">
                    {insight.data.map((item, index) => (
                      <div key={index} className="flex justify-between border-b border-gray-700/30 pb-2">
                        <span className="text-gray-400">{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {insight.recommendation && (
                  <div className="bg-[#09BC8A]/10 rounded-xl p-4 border border-[#09BC8A]/30">
                    <h4 className="font-medium text-[#09BC8A] mb-2">Recommendation</h4>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-700/30 pt-4 pb-8 px-5">
              <Button 
                type="button" 
                onClick={onClose}
                className="w-full bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl h-14 font-medium"
              >
                Close
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
} 