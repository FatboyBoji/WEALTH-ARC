import api from './api';

// Transaction types
export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  account: string;
  notes?: string;
}

// Account summary types
export interface AccountSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

// Insight data point type
export interface InsightDataPoint {
  label: string;
  value: string | number;
}

// Insight type
export interface Insight {
  id: string;
  title: string;
  description: string;
  data?: InsightDataPoint[];
  recommendation?: string;
  icon?: string;
  category?: string;
}

// Mock data for development
const mockTransactions: Transaction[] = [
  {
    id: '1',
    name: 'Grocery Shopping',
    amount: -82.45,
    date: '2023-07-10',
    category: 'Food & Groceries',
    account: 'Main Account',
    notes: 'Weekly grocery shopping'
  },
  {
    id: '2',
    name: 'Salary Payment',
    amount: 2450.00,
    date: '2023-07-01',
    category: 'Income',
    account: 'Main Account'
  },
  {
    id: '3',
    name: 'Electricity Bill',
    amount: -68.32,
    date: '2023-07-05',
    category: 'Utilities',
    account: 'Bills Account'
  },
  {
    id: '4',
    name: 'Restaurant Dinner',
    amount: -45.80,
    date: '2023-07-08',
    category: 'Dining Out',
    account: 'Main Account',
    notes: 'Dinner with friends'
  }
];

const mockAccountSummary: AccountSummary = {
  totalBalance: 3570.25,
  monthlyIncome: 2650.00,
  monthlyExpenses: 1875.40,
  savingsRate: 29
};

const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Spending Trend',
    description: 'Your spending in Food & Groceries has decreased by 15% compared to last month.',
    data: [
      { label: 'This Month', value: '€320.45' },
      { label: 'Last Month', value: '€376.85' },
      { label: 'Change', value: '-15%' }
    ],
    recommendation: 'Great job reducing your grocery expenses! Continue your smart shopping habits.',
    category: 'spending'
  },
  {
    id: '2',
    title: 'Savings Opportunity',
    description: 'You could save more by reducing your Dining Out expenses.',
    data: [
      { label: 'Current Dining Expenses', value: '€245.80' },
      { label: 'Monthly Average', value: '€180.25' },
      { label: 'Potential Savings', value: '€65.55' }
    ],
    recommendation: 'Consider cooking at home one more night per week to increase your savings.',
    category: 'savings'
  }
];

// Dashboard API calls with fallback to mock data
export const getRecentTransactions = async () => {
  try {
    const response = await api.get('/dashboard/transactions/recent');
    return response.data.data as Transaction[];
  } catch (error) {
    console.log('Using mock transaction data');
    return mockTransactions;
  }
};

export const getAccountSummary = async () => {
  try {
    const response = await api.get('/dashboard/account/summary');
    return response.data.data as AccountSummary;
  } catch (error) {
    console.log('Using mock account summary data');
    return mockAccountSummary;
  }
};

export const getInsights = async () => {
  try {
    const response = await api.get('/dashboard/insights');
    return response.data.data as Insight[];
  } catch (error) {
    console.log('Using mock insights data');
    return mockInsights;
  }
};

export async function updateTransaction(
  transactionId: string,
  data: Partial<Transaction>
): Promise<Transaction> {
  console.log('Sending transaction update data:', JSON.stringify(data, null, 2));
  
  const response = await api.patch(`/dashboard/transactions/${transactionId}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update transaction');
  }
  
  return response.data.data;
} 