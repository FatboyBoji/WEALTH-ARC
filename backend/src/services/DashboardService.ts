import { prisma } from '../utils/db';
import { BudgetService } from './BudgetService';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  account: string;
  notes?: string;
}

export interface AccountSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export interface InsightDataPoint {
  label: string;
  value: string | number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  data?: InsightDataPoint[];
  recommendation?: string;
  category?: string;
}

export class DashboardService {
  private budgetService: BudgetService;

  constructor() {
    this.budgetService = new BudgetService();
  }

  // Get recent transactions (based on budget items)
  async getRecentTransactions(userId: number, limit: number = 10): Promise<Transaction[]> {
    const budgetItems = await prisma.budgetItem.findMany({
      where: {
        userId
      },
      orderBy: {
        updatedAt: 'desc' // Order by updatedAt
      },
      take: limit,
      include: {
        category: true
      }
    });
    
    // Convert budget items to transactions, using updatedAt as the date
    return budgetItems.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.itemType === 'expense' ? -Number(item.amount) : Number(item.amount),
      date: item.updatedAt.toISOString(), // Use updatedAt as transaction date
      category: item.category.name,
      account: 'Main Account',
      notes: `${item.itemType === 'income' ? 'Income' : 'Expense'} for ${item.month}/${item.year}`
    }));
  }

  // Update a transaction (budget item)
  async updateTransaction(userId: number, transactionId: string, data: Partial<Transaction>): Promise<Transaction> {
    // Find the original budget item
    const item = await prisma.budgetItem.findUnique({
      where: { id: transactionId },
      include: { category: true }
    });

    if (!item || item.userId !== userId) {
      throw new Error('Transaction not found');
    }

    // Convert transaction data to budget item format
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.amount !== undefined) {
      updateData.amount = Math.abs(data.amount); // Store positive values
    }
    
    // Set the month and year based on the date
    if (data.date) {
      console.log('Received date update:', data.date);
      const date = new Date(data.date);
      console.log('Parsed date:', date);
      
      updateData.month = date.getMonth() + 1;
      updateData.year = date.getFullYear();
      
      // Set the updatedAt field to the exact date the user selected
      updateData.updatedAt = date;
      
      console.log('Setting updatedAt to:', date);
    }
    
    // Update notes if provided
    if (data.notes !== undefined) {
      // Store notes without metadata (since metadata is now disabled in schema)
      // We could store this in a notes field if needed
    }
    
    // Log the final update data being sent to the database
    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    // Update the budget item
    const updated = await prisma.budgetItem.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        category: true
      }
    });
    
    // Convert back to transaction format using updatedAt as the date
    return {
      id: updated.id,
      name: updated.name,
      amount: updated.itemType === 'expense' ? -Number(updated.amount) : Number(updated.amount),
      date: updated.updatedAt.toISOString(), // Use updatedAt as the transaction date
      category: updated.category.name,
      account: 'Main Account',
      notes: data.notes || `${updated.itemType === 'income' ? 'Income' : 'Expense'} for ${updated.month}/${updated.year}`
    };
  }

  // Get account summary
  async getAccountSummary(userId: number): Promise<AccountSummary> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get current month's budget summary
    const budgetSummary = await this.budgetService.getBudgetSummary(userId, currentMonth, currentYear);
    
    // Calculate savings rate
    const savingsRate = budgetSummary.totalIncome > 0 
      ? Math.round((budgetSummary.remainingBudget / budgetSummary.totalIncome) * 100) 
      : 0;
    
    // Get total balance (sum of all income - expenses across all time)
    const allItems = await prisma.budgetItem.findMany({
      where: { userId }
    });
    
    const totalIncome = allItems
      .filter(item => item.itemType === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);
      
    const totalExpenses = allItems
      .filter(item => item.itemType === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const totalBalance = totalIncome - totalExpenses;
    
    return {
      totalBalance,
      monthlyIncome: budgetSummary.totalIncome,
      monthlyExpenses: budgetSummary.totalExpenses,
      savingsRate
    };
  }

  // Generate insights
  async getInsights(userId: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Get current and previous month's data
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const currentYear = today.getFullYear();
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const currentItems = await prisma.budgetItem.findMany({
      where: { 
        userId,
        month: currentMonth,
        year: currentYear
      },
      include: { category: true }
    });
    
    const previousItems = await prisma.budgetItem.findMany({
      where: { 
        userId,
        month: previousMonth,
        year: previousYear
      },
      include: { category: true }
    });
    
    // Group by category
    const currentByCategory = this.groupItemsByCategory(currentItems);
    const previousByCategory = this.groupItemsByCategory(previousItems);
    
    // 1. Spending trend insight
    const spendingTrends = this.generateSpendingTrends(currentByCategory, previousByCategory);
    if (spendingTrends) {
      insights.push(spendingTrends);
    }
    
    // 2. Savings opportunity
    const savingsOpportunity = this.generateSavingsOpportunity(currentByCategory, previousByCategory);
    if (savingsOpportunity) {
      insights.push(savingsOpportunity);
    }
    
    return insights;
  }
  
  // Helper: Group budget items by category
  private groupItemsByCategory(items: any[]) {
    const result: Record<string, { category: string, amount: number, type: 'income' | 'expense' }> = {};
    
    for (const item of items) {
      const categoryName = item.category.name;
      if (!result[categoryName]) {
        result[categoryName] = {
          category: categoryName,
          amount: 0,
          type: item.itemType
        };
      }
      
      result[categoryName].amount += Number(item.amount);
    }
    
    return result;
  }
  
  // Helper: Generate spending trends insight
  private generateSpendingTrends(current: Record<string, any>, previous: Record<string, any>): Insight | null {
    // Look for categories with significant changes
    for (const categoryName in current) {
      const currentData = current[categoryName];
      const previousData = previous[categoryName];
      
      // Skip income categories
      if (currentData.type === 'income') continue;
      
      // Only compare if we have data for both months
      if (previousData) {
        const change = previousData.amount > 0 
          ? ((currentData.amount - previousData.amount) / previousData.amount) * 100
          : 0;
        
        // If there's at least a 10% change
        if (Math.abs(change) >= 10) {
          const formattedCurrent = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(currentData.amount);
          const formattedPrevious = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(previousData.amount);
          
          const isIncrease = change > 0;
          
          return {
            id: '1',
            title: 'Spending Trend',
            description: `Your spending in ${categoryName} has ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(Math.round(change))}% compared to last month.`,
            data: [
              { label: 'This Month', value: formattedCurrent },
              { label: 'Last Month', value: formattedPrevious },
              { label: 'Change', value: `${change > 0 ? '+' : ''}${Math.round(change)}%` }
            ],
            recommendation: isIncrease 
              ? `Consider reviewing your ${categoryName} expenses to identify potential savings.`
              : `Great job reducing your ${categoryName} expenses! Continue your smart spending habits.`,
            category: 'spending'
          };
        }
      }
    }
    
    return null;
  }
  
  // Helper: Generate savings opportunity insight
  private generateSavingsOpportunity(current: Record<string, any>, previous: Record<string, any>): Insight | null {
    // Look for categories where current spending is higher than the average
    let highestIncrease = { category: '', amount: 0, percentage: 0 };
    
    for (const categoryName in current) {
      const currentData = current[categoryName];
      const previousData = previous[categoryName];
      
      // Skip income categories
      if (currentData.type === 'income') continue;
      
      // Only compare if we have data for both months
      if (previousData) {
        const change = previousData.amount > 0 
          ? ((currentData.amount - previousData.amount) / previousData.amount) * 100
          : 0;
        
        // If there's an increase and it's the biggest so far
        if (change > 0 && change > highestIncrease.percentage) {
          highestIncrease = {
            category: categoryName,
            amount: currentData.amount - previousData.amount,
            percentage: change
          };
        }
      }
    }
    
    if (highestIncrease.category) {
      const formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(current[highestIncrease.category].amount);
      const potentialSavings = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(highestIncrease.amount);
      
      return {
        id: '2',
        title: 'Savings Opportunity',
        description: `You could save more by reducing your ${highestIncrease.category} expenses.`,
        data: [
          { label: 'Current Spending', value: formattedAmount },
          { label: 'Potential Savings', value: potentialSavings }
        ],
        recommendation: `Look for ways to reduce your ${highestIncrease.category} expenses to increase your savings.`,
        category: 'savings'
      };
    }
    
    return null;
  }
} 