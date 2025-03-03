'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DevIndicatorProps {
  className?: string;
  message?: string;
  title?: string;
}

export function DevIndicator({ 
  className, 
  message = "This feature is still being developed and will be updated soon with more functionality!", 
  title = "Feature in development"
}: DevIndicatorProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button 
        size="sm" 
        variant="ghost" 
        className="rounded-full bg-red-600 hover:bg-red-700 w-6 h-6 p-0 flex items-center justify-center"
        onClick={() => setIsPopupOpen(true)}
      >
        <AlertCircle className="h-4 w-4 text-white" />
        <span className="sr-only">In development</span>
      </Button>

      {isPopupOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsPopupOpen(false)}
          />
          
          {/* Custom popup */}
          <div className="absolute left-0 top-8 z-50 w-72 bg-[#192A38] border border-[#004346] rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex justify-between items-center p-3 border-b border-[#004346]/50">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <h3 className="font-medium text-[#09BC8A]">{title}</h3>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 rounded-full hover:bg-[#004346]/50" 
                onClick={() => setIsPopupOpen(false)}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-300">{message}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 