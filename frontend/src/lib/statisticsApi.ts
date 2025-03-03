import api from '@/lib/api';

export interface StatisticsPeriod {
  startDate: string;
  endDate: string;
  type: 'month' | 'quarter' | 'year';
}

export interface ChartDataItem {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

export interface MonthlySummaryItem {
  month: string;
  monthNumber: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface RecurringExpenseItem {
  name: string;
  value: number;
  color: string;
}

export interface StatisticsOverview {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
}

// Fetch statistics data for a given period
export async function fetchStatistics(period: string, year: number) {
  try {
    const response = await api.get(`/statistics/${period}?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}

// Get monthly income and expenses chart data
export async function fetchIncomeExpensesChart(period: string, year: number) {
  try {
    const response = await api.get(`/statistics/income-expenses/${period}?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income-expenses chart data:', error);
    throw error;
  }
}

// Get expense categories breakdown
export async function fetchCategoryBreakdown(period: string, year: number) {
  try {
    const response = await api.get(`/statistics/categories/${period}?year=${year}`);
    
    // Add colors to the categories (this would come from the backend ideally)
    const colors = ['#f87171', '#60a5fa', '#4ade80', '#c084fc', '#fbbf24', '#a78bfa', '#34d399', '#f472b6'];
    
    return response.data.map((item: any, index: number) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  } catch (error) {
    console.error('Error fetching category breakdown data:', error);
    throw error;
  }
}

// Get recurring expenses breakdown
export async function fetchRecurringExpenses(period: string, year: number) {
  try {
    const response = await api.get(`/statistics/recurring/${period}?year=${year}`);
    
    // Define fixed colors for recurring types
    const typeColors = {
      'One-time': '#f87171',
      'Monthly': '#60a5fa',
      'Quarterly': '#4ade80',
      'Yearly': '#c084fc'
    };
    
    return response.data.map((item: any) => ({
      ...item,
      color: typeColors[item.name as keyof typeof typeColors] || '#94a3b8'
    }));
  } catch (error) {
    console.error('Error fetching recurring expenses data:', error);
    throw error;
  }
}

// Get monthly summaries
export async function fetchMonthlySummaries(year: number) {
  try {
    const response = await api.get(`/statistics/summaries?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly summaries:', error);
    throw error;
  }
}

// Add this new function to get the current month overview
export async function fetchMonthlyOverview(month?: number, year?: number): Promise<StatisticsOverview> {
  try {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const response = await api.get(`/statistics/overview?month=${currentMonth}&year=${currentYear}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly overview:', error);
    return { totalIncome: 0, totalExpenses: 0, remainingBudget: 0 };
  }
} 