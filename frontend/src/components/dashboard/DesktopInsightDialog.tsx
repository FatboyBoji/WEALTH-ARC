'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Insight } from '@/lib/dashboardApi';

interface DesktopInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight: Insight | null;
}

export default function DesktopInsightDialog({
  open,
  onOpenChange,
  insight
}: DesktopInsightDialogProps) {
  if (!insight) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-[#09BC8A]">{insight.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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