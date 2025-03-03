import { prisma } from '../utils/db';
import { BudgetItem, Category } from '@prisma/client';
import { format, getMonth, getYear } from 'date-fns';

export interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  type: string;
}

export interface RecurringExpenseSummary {
  name: string;
  value: number;
}

export interface MonthlySummary {
  month: string;
  monthNumber: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export class StatisticsService {
  // Get income and expenses for a specific period (month, quarter, year)
  async getIncomeExpensesChart(userId: number, period: string, year: number): Promise<ChartDataPoint[]> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Determine the period boundaries
      let startMonth = 1;
      let endMonth = 12;
      let groupByFormat = 'M'; // Group by month
      
      if (period === 'month') {
        // For month view, we'll show daily data for the current month
        const daysInMonth = new Date(year, currentMonth, 0).getDate();
        const results: ChartDataPoint[] = [];
        
        // Get all budget items for the specified month
        const items = await prisma.budgetItem.findMany({
          where: {
            userId,
            year,
            month: currentMonth
          }
        });
        
        // Aggregate by day (this is simplified; in real life you might need more complex logic)
        for (let day = 1; day <= daysInMonth; day++) {
          const dayStr = day.toString();
          
          // In a real implementation, you would associate budget items with specific days
          // For now, we'll distribute them evenly or based on some logic
          const dayIncome = items
            .filter(item => item.itemType === 'income')
            .reduce((sum, item) => sum + Number(item.amount) / daysInMonth, 0);
            
          const dayExpenses = items
            .filter(item => item.itemType === 'expense')
            .reduce((sum, item) => sum + Number(item.amount) / daysInMonth, 0);
            
          results.push({
            name: dayStr,
            income: parseFloat(dayIncome.toFixed(2)),
            expenses: parseFloat(dayExpenses.toFixed(2)),
            savings: parseFloat((dayIncome - dayExpenses).toFixed(2))
          });
        }
        
        return results;
      } else if (period === 'quarter') {
        // For quarter view, show data for 3 months
        const currentQuarter = Math.ceil(currentMonth / 3);
        startMonth = (currentQuarter - 1) * 3 + 1;
        endMonth = currentQuarter * 3;
      }
      
      // Get all budget items for the specified time range
      const items = await prisma.budgetItem.findMany({
        where: {
          userId,
          year,
          month: {
            gte: startMonth,
            lte: endMonth
          }
        }
      });
      
      // Aggregate data by month
      const monthlyData: Record<string, ChartDataPoint> = {};
      
      // Initialize months
      for (let month = startMonth; month <= endMonth; month++) {
        const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
        monthlyData[month] = {
          name: monthName,
          income: 0,
          expenses: 0,
          savings: 0
        };
      }
      
      // Aggregate data
      for (const item of items) {
        const monthData = monthlyData[item.month];
        if (monthData) {
          if (item.itemType === 'income') {
            monthData.income += Number(item.amount);
          } else if (item.itemType === 'expense') {
            monthData.expenses += Number(item.amount);
          }
          monthData.savings = monthData.income - monthData.expenses;
        }
      }
      
      // Convert to array and round values
      return Object.values(monthlyData).map(data => ({
        name: data.name,
        income: parseFloat(data.income.toFixed(2)),
        expenses: parseFloat(data.expenses.toFixed(2)),
        savings: parseFloat(data.savings.toFixed(2))
      }));
    } catch (error) {
      console.error('Error getting income/expenses chart data:', error);
      throw error;
    }
  }
  
  // Get expense categories breakdown
  async getCategoryBreakdown(userId: number, period: string, year: number): Promise<CategoryBreakdown[]> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Determine period boundaries
      let startMonth = 1;
      let endMonth = 12;
      
      if (period === 'month') {
        startMonth = currentMonth;
        endMonth = currentMonth;
      } else if (period === 'quarter') {
        const currentQuarter = Math.ceil(currentMonth / 3);
        startMonth = (currentQuarter - 1) * 3 + 1;
        endMonth = currentQuarter * 3;
      }
      
      // Get expense items for the period with their categories
      const items = await prisma.budgetItem.findMany({
        where: {
          userId,
          year,
          month: {
            gte: startMonth,
            lte: endMonth
          },
          itemType: 'expense'
        },
        include: {
          category: true
        }
      });
      
      // Aggregate by category
      const categoryTotals: Record<string, { value: number, type: string }> = {};
      
      for (const item of items) {
        const categoryName = item.category.name;
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { value: 0, type: item.category.type };
        }
        categoryTotals[categoryName].value += Number(item.amount);
      }
      
      // Convert to array and sort by value (descending)
      return Object.entries(categoryTotals)
        .map(([name, data]) => ({
          name,
          value: parseFloat(data.value.toFixed(2)),
          type: data.type
        }))
        .sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw error;
    }
  }
  
  // Get recurring expenses analysis
  async getRecurringExpenses(userId: number, period: string, year: number): Promise<RecurringExpenseSummary[]> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Determine period boundaries
      let startMonth = 1;
      let endMonth = 12;
      
      if (period === 'month') {
        startMonth = currentMonth;
        endMonth = currentMonth;
      } else if (period === 'quarter') {
        const currentQuarter = Math.ceil(currentMonth / 3);
        startMonth = (currentQuarter - 1) * 3 + 1;
        endMonth = currentQuarter * 3;
      }
      
      // Get expense items for the period
      const items = await prisma.budgetItem.findMany({
        where: {
          userId,
          year,
          month: {
            gte: startMonth,
            lte: endMonth
          },
          itemType: 'expense'
        }
      });
      
      // Group by repeat type
      const recurringMap: Record<number, { name: string, value: number }> = {
        1: { name: 'One-time', value: 0 },
        2: { name: 'Monthly', value: 0 },
        3: { name: 'Quarterly', value: 0 },
        4: { name: 'Yearly', value: 0 }
      };
      
      for (const item of items) {
        const repeatType = item.repeat || 1; // Default to one-time if not set
        if (recurringMap[repeatType]) {
          recurringMap[repeatType].value += Number(item.amount);
        }
      }
      
      // Convert to array and round values
      return Object.values(recurringMap)
        .map(item => ({
          name: item.name,
          value: parseFloat(item.value.toFixed(2))
        }))
        .filter(item => item.value > 0); // Only include types with values
    } catch (error) {
      console.error('Error getting recurring expenses:', error);
      throw error;
    }
  }
  
  // Get monthly summaries for the year
  async getMonthlySummaries(userId: number, year: number): Promise<MonthlySummary[]> {
    try {
      // Get all items for the year
      const items = await prisma.budgetItem.findMany({
        where: {
          userId,
          year
        }
      });
      
      // Group by month
      const monthlySummaries: Record<number, MonthlySummary> = {};
      
      // Initialize all months
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        monthlySummaries[month] = {
          month: format(date, 'MMM'),
          monthNumber: month,
          year,
          income: 0,
          expenses: 0,
          savings: 0,
          savingsRate: 0
        };
      }
      
      // Aggregate data
      for (const item of items) {
        if (item.itemType === 'income') {
          monthlySummaries[item.month].income += Number(item.amount);
        } else if (item.itemType === 'expense') {
          monthlySummaries[item.month].expenses += Number(item.amount);
        }
      }
      
      // Calculate savings and savings rate
      for (const month in monthlySummaries) {
        const summary = monthlySummaries[month];
        summary.savings = summary.income - summary.expenses;
        summary.savingsRate = summary.income > 0 
          ? Math.round((summary.savings / summary.income) * 100) 
          : 0;
          
        // Round values for display
        summary.income = parseFloat(summary.income.toFixed(2));
        summary.expenses = parseFloat(summary.expenses.toFixed(2));
        summary.savings = parseFloat(summary.savings.toFixed(2));
      }
      
      // Convert to array and sort by month
      return Object.values(monthlySummaries)
        .sort((a, b) => a.monthNumber - b.monthNumber);
    } catch (error) {
      console.error('Error getting monthly summaries:', error);
      throw error;
    }
  }

  // Get monthly overview
  async getMonthlyOverview(userId: number, month: number, year: number): Promise<{ totalIncome: number; totalExpenses: number; remainingBudget: number }> {
    try {
      // Fetch all budget items for the month
      const items = await prisma.budgetItem.findMany({
        where: {
          userId,
          month,
          year
        }
      });
      
      // Calculate totals
      let totalIncome = 0;
      let totalExpenses = 0;
      
      for (const item of items) {
        if (item.itemType === 'income') {
          totalIncome += Number(item.amount);
        } else if (item.itemType === 'expense') {
          totalExpenses += Number(item.amount);
        }
      }
      
      const remainingBudget = totalIncome - totalExpenses;
      
      return {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        remainingBudget: parseFloat(remainingBudget.toFixed(2))
      };
    } catch (error) {
      console.error('Error getting monthly overview:', error);
      throw error;
    }
  }
} 