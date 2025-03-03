'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadIcon, CalendarIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { MonthlyOverview } from '@/components/statistics/MonthlyOverview';
import { 
  fetchIncomeExpensesChart, 
  fetchMonthlyOverview,
  fetchMonthlySummaries,
  ChartDataItem,
  StatisticsOverview,
  MonthlySummaryItem
} from '@/lib/statisticsApi';
import { ExportTransactionsDialog } from '@/components/statistics/ExportTransactionsDialog';
import { DevIndicator } from '@/components/ui/dev-indicator';

export default function StatisticsPage() {
  const [selectedTab, setSelectedTab] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  
  // State for data
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [monthlyOverview, setMonthlyOverview] = useState<StatisticsOverview>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });
  const [yearlyOverview, setYearlyOverview] = useState<StatisticsOverview>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });
  const [alltimeOverview, setAlltimeOverview] = useState<StatisticsOverview>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummaryItem[]>([]);

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch monthly overview (current month)
      const currentMonth = new Date().getMonth() + 1;
      
      const [
        incomeExpensesData, 
        monthlyData, 
        yearlyData, 
        summariesData
      ] = await Promise.all([
        fetchIncomeExpensesChart(selectedTab, selectedYear),
        fetchMonthlyOverview(currentMonth, selectedYear),
        // For yearly overview, we can pass 0 as month to get the whole year
        fetchMonthlyOverview(0, selectedYear),
        fetchMonthlySummaries(selectedYear)
      ]);
      
      // For all-time overview, we need to calculate it from monthly summaries
      const allTimeIncome = summariesData.reduce(( sum: number, month: MonthlySummaryItem) => sum + month.income, 0);
      const allTimeExpenses = summariesData.reduce((sum: number, month: MonthlySummaryItem) => sum + month.expenses, 0);
      const allTimeRemaining = allTimeIncome - allTimeExpenses;
      
      setChartData(incomeExpensesData);
      setMonthlyOverview(monthlyData);
      setYearlyOverview(yearlyData);
      setAlltimeOverview({
        totalIncome: allTimeIncome,
        totalExpenses: allTimeExpenses,
        remainingBudget: allTimeRemaining
      });
      setMonthlySummaries(summariesData);
    } catch (error) {
      console.error('Error fetching statistics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when tab or year changes
  useEffect(() => {
    fetchData();
  }, [selectedTab, selectedYear]);

  // Get the correct overview data based on tab
  const getOverviewData = () => {
    switch(selectedTab) {
      case 'year':
        return yearlyOverview;
      case 'all':
        return alltimeOverview;
      case 'month':
      default:
        return monthlyOverview;
    }
  };
  
  // Get the title for the overview card
  const getOverviewTitle = () => {
    switch(selectedTab) {
      case 'year':
        return 'Yearly Overview';
      case 'all':
        return 'All-time Overview';
      case 'month':
      default:
        return 'Monthly Overview';
    }
  };

  return (
    <ProtectedLayout>
      <div className=''>
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold mb-2">Financial Statistics</h1>
            
            {/* Custom development indicator */}
            <DevIndicator />
            
            <p className="text-gray-300">Track your financial progress over time</p>
          </div>
          
          {/* Export button with more prominence */}
          <div className="flex gap-4">
            <ExportTransactionsDialog 
              year={selectedYear}
              trigger={
                <Button className="bg-[#09BC8A] hover:bg-[#07a176] text-white">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              }
            />
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="year">Yearly</TabsTrigger>
              <TabsTrigger value="all">All-time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[180px] ml-4">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue>{selectedYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => 
                new Date().getFullYear() - i
              ).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MonthlyOverview 
            title={getOverviewTitle()}
            totalIncome={getOverviewData().totalIncome}
            totalExpenses={getOverviewData().totalExpenses}
            remainingBudget={getOverviewData().remainingBudget}
            isLoading={isLoading}
            period={selectedTab as 'month' | 'year' | 'all'}
          />
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Monthly Overview {selectedYear}</CardTitle>
            <CardDescription>Monthly income, expenses and savings rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4">Month</th>
                    <th className="text-left p-4">Income</th>
                    <th className="text-left p-4">Expenses</th>
                    <th className="text-left p-4">Savings</th>
                    <th className="text-left p-4">Savings Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 12 }).map((_, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    monthlySummaries.map((item, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-4">{item.month}</td>
                        <td className="p-4 text-[#09BC8A]">€{item.income.toFixed(2)}</td>
                        <td className="p-4 text-red-400">€{item.expenses.toFixed(2)}</td>
                        <td className="p-4">€{item.savings.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={item.savingsRate > 20 ? "text-[#09BC8A]" : item.savingsRate > 10 ? "text-yellow-400" : "text-red-400"}>
                            {item.savingsRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
} 