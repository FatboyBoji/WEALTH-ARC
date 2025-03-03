'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SimpleLineChartProps {
  title: string;
  subtitle: string;
  data: any[];
  dataKey: string;
  color?: string;
  onClick?: () => void;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  title, 
  subtitle,
  data,
  dataKey,
  color = '#FFFFFF',
  onClick
}) => {
  return (
    <Card 
      className="bg-[#004346] hover:bg-[#00535A] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col h-64 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {data.length > 0 ? (
              <ResponsiveContainer width="80%" height="80%">
                <LineChart data={data}>
                  <Line 
                    type="monotone" 
                    dataKey={dataKey} 
                    stroke={color} 
                    strokeWidth={3}
                    dot={false} 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#192A38] p-2 border border-gray-700 rounded shadow-lg">
                            <p className="text-sm">{`€${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 160 L 40 40 L 160 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M40 80 L 80 120 L 120 80 L 160 120" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 