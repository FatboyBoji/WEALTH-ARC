'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, PieChart, Pie, Cell, ComposedChart, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart as LineChartIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

// Types
interface ChartDataItem {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

interface ChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
  height?: number;
}

interface CategoryChartProps {
  data: CategoryDataItem[];
  isLoading?: boolean;
  height?: number;
}

// Custom tooltip component for the financial charts
const FinancialTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#192A38] p-3 border border-gray-700 rounded-md shadow-lg">
      <p className="font-medium text-gray-200 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex justify-between items-center">
          <span style={{ color: entry.color }} className="mr-4 flex items-center">
            {entry.dataKey === 'income' && <ArrowUpIcon className="w-3 h-3 mr-1" />}
            {entry.dataKey === 'expenses' && <ArrowDownIcon className="w-3 h-3 mr-1" />}
            {entry.name}:
          </span>
          <span style={{ color: entry.color }} className="font-medium">€{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Income vs Expenses Chart
export const IncomeExpensesChart: React.FC<ChartProps> = ({ data, isLoading = false, height = 300 }) => {
  if (isLoading) {
    return (
      <div className="w-full h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip content={<FinancialTooltip />} />
        <Legend 
          iconType="circle"
          verticalAlign="top"
          margin={{ top: 0, left: 0, right: 0, bottom: 10 }}
          wrapperStyle={{ paddingBottom: 10 }}
        />
        <Bar dataKey="expenses" name="Expenses" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
        <Line 
          type="monotone" 
          dataKey="income" 
          name="Income" 
          stroke="#09BC8A" 
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Category Pie Chart
export const CategoryPieChart: React.FC<CategoryChartProps> = ({ data, isLoading = false, height = 250 }) => {
  if (isLoading) {
    return (
      <div className="w-full h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={50}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`€${value}`, '']}
          contentStyle={{ 
            backgroundColor: '#192A38', 
            borderColor: '#333',
            color: '#fff' 
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Savings Trend Chart
export const SavingsTrendChart: React.FC<ChartProps> = ({ data, isLoading = false, height = 250 }) => {
  if (isLoading) {
    return (
      <div className="w-full h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip 
          formatter={(value) => [`€${value}`, '']}
          contentStyle={{ backgroundColor: '#192A38', borderColor: '#333' }}
        />
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#09BC8A" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#09BC8A" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="savings" 
          name="Savings" 
          stroke="#09BC8A" 
          fillOpacity={1}
          fill="url(#savingsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Simple Box Chart component - for your simple chart shown in the image
export const SimpleLineChart: React.FC<{title: string, subtitle: string}> = ({ title, subtitle }) => {
  return (
    <Card className="bg-[#004346] hover:bg-[#00535A] transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex flex-col h-64 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 160 L 40 40 L 160 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 80 L 80 120 L 120 80 L 160 120" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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

// Custom Card Chart that combines a title and chart
export const ChartCard: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
  return (
    <Card className="bg-[#1e2c39] border-0">
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}; 