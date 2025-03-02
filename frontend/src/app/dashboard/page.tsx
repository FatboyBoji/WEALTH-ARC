'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { 
  getCategories, 
  getBudgetSummary,
  createBudgetItem,
  BudgetSummary,
  Category,
  BudgetItem
} from '@/lib/budgetApi';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { 
  getRecentTransactions, 
  getAccountSummary, 
  getInsights,
  Transaction,
  AccountSummary,
  Insight
} from '@/lib/dashboardApi'; // Adjust this import based on your actual API
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import TransactionList from '@/components/dashboard/TransactionList';
import InsightCards from '@/components/dashboard/InsightCards';
import DashboardLoadingStates from '@/components/dashboard/DashboardLoadingStates';

// Any mobile-specific drawer components you need
import TransactionDrawer from '@/components/dashboard/TransactionDrawer';
import InsightDrawer from '@/components/dashboard/InsightDrawer';

// Desktop dialog components
import DesktopTransactionDialog from '@/components/dashboard/DesktopTransactionDialog';
import DesktopInsightDialog from '@/components/dashboard/DesktopInsightDialog';

// Import from wallet components
import BudgetDrawer from '@/components/budget/BudgetDrawer';
import { toast } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingActionButton from '@/components/budget/walletPage/FloatingActionButton';

// Add this interface near the top of the file with other imports
interface NewBudgetItem {
  name: string;
  amount: string | number;
  itemType: 'income' | 'expense';
  categoryId: string;
  repeat: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Budget data
  const [summary, setSummary] = useState<BudgetSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state for quick add
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    categoryId: '',
    repeat: 1,
    itemType: 'expense' as 'income' | 'expense'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Responsive views
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State for dashboard data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // UI state
  const [error, setError] = useState<string | null>(null);

  // Dialog/Drawer state
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  
  // Add new states for transaction drawers
  const [showAddIncomeDrawer, setShowAddIncomeDrawer] = useState(false);
  const [showAddExpenseDrawer, setShowAddExpenseDrawer] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Add isSubmitting state to handle form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load summary data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, categoriesData] = await Promise.all([
        getBudgetSummary(),
        getCategories()
      ]);
      setSummary(summaryData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Dialog handlers
  const handleOpenQuickAdd = (type: 'income' | 'expense') => {
    setAddType(type);
    setNewItem({
      name: '',
      amount: '',
      categoryId: '',
      repeat: 1,
      itemType: type
    });
    setFormErrors([]);
    setSuccessMessage('');
    setShowAddDialog(true);
  };
  
  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true); // Set loading to true at start
    
    // Validate form
    const errors = [];
    if (!newItem.name) errors.push('Name is required');
    if (!newItem.amount || isNaN(Number(newItem.amount))) errors.push('Amount must be a valid number');
    if (!newItem.categoryId) errors.push('Please select a category');
    
    if (errors.length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false); // Reset loading if validation fails
      return;
    }
    
    try {
      const date = new Date();
      await createBudgetItem({
        name: newItem.name,
        amount: Number(newItem.amount),
        itemType: addType,
        categoryId: newItem.categoryId,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        repeat: newItem.repeat
      });
      
      setSuccessMessage('Item added successfully!');
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData();
        setShowAddDialog(false);
        setIsSubmitting(false); // Reset loading
      }, 1500);
    } catch (err: any) {
      setFormErrors([err.response?.data?.message || 'Failed to add item']);
      setIsSubmitting(false); // Reset loading on error
    }
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionsData, summaryData, insightsData] = await Promise.all([
        getRecentTransactions(),
        getAccountSummary(),
        getInsights()
      ]);
      
      setTransactions(transactionsData);
      setAccountSummary(summaryData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // View transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleTransactionsUpdated = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
    setShowTransactionDetails(false);
  };

  // View insight details
  const handleViewInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setShowInsightDetails(true);
  };
  
  // Handle adding new budget item
  const handleAddItem = async (newItem: NewBudgetItem) => {
    setIsAdding(true);
    setFormErrors([]);
    
    try {
      const date = new Date();
      await createBudgetItem({
        name: newItem.name,
        amount: Number(newItem.amount),
        itemType: newItem.itemType,
        categoryId: newItem.categoryId,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        repeat: newItem.repeat
      });
      
      setSuccessMessage('Item added successfully!');
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData();
        setShowAddIncomeDrawer(false);
        setShowAddExpenseDrawer(false);
        // Reset form
        setNewItem({
          name: '',
          amount: '',
          categoryId: '',
          repeat: 1,
          itemType: 'expense'
        });
      }, 1000);
    } catch (err: any) {
      setFormErrors([err.response?.data?.message || 'Failed to add item']);
    } finally {
      setIsAdding(false);
    }
  };

  // Update this when opening the income drawer
  const handleOpenIncomeDrawer = () => {
    setNewItem({
      name: '',
      amount: '',
      categoryId: '',
      repeat: 1,
      itemType: 'income'
    });
    setShowAddIncomeDrawer(true);
  };

  // Update this when opening the expense drawer
  const handleOpenExpenseDrawer = () => {
    setNewItem({
      name: '',
      amount: '',
      categoryId: '',
      repeat: 1,
      itemType: 'expense'
    });
    setShowAddExpenseDrawer(true);
  };

  return (
    <ProtectedLayout>
      <div className='ml-0 mr-0'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#09BC8A] mb-2">
            Welcome, {user?.username}!
          </h1>
          <p className="text-gray-300">
            Here's a summary of your financial status.
          </p>
        </div>
        
        {/* Summary Card */}
        <div className="bg-[#212121] rounded-lg p-5 mb-6">
          <h2 className="text-xl font-semibold mb-3">Monthly Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Income</span>
              <span className="text-[#09BC8A] font-bold">€{summary.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Expenses</span>
              <span className="text-red-400 font-bold">€{summary.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Remaining Budget</span>
                <span className="font-bold">€{summary.remainingBudget.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8" id="dashboard-quick-actions">
          <button 
            onClick={handleOpenIncomeDrawer}
            className="bg-[#004346] p-4 rounded-lg text-center hover:bg-[#00595d]"
          >
            <span className="block text-xl mb-1">💰</span>
            <span>Add Income</span>
          </button>
          <button 
            onClick={handleOpenExpenseDrawer}
            className="bg-[#004346] p-4 rounded-lg text-center hover:bg-[#00595d]"
          >
            <span className="block text-xl mb-1">💸</span>
            <span>Add Expense</span>
          </button>
        </div>
        
        {/* View Budget Button */}
        <button 
          onClick={() => router.push('/wallet')}
          className="w-full bg-[#09BC8A] text-[#192A38] rounded-lg py-3 font-bold mb-8"
        >
          View Full Budget
        </button>
        
        {/* Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-[#192A38] text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>
                Quick Add {addType === 'income' ? 'Income' : 'Expense'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleQuickAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="bg-[#3a3a3a] border-gray-700 text-white"
                    placeholder={`What is this ${addType} for?`}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (€)</Label>
                  <Input
                    id="amount"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                    className="bg-[#3a3a3a] border-gray-700 text-white"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-gray-700 bg-[#3a3a3a] px-3 py-1 text-sm text-white"
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(cat => cat.type === addType && cat.isVisible)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="repeat">Repeat</Label>
                  <select
                    id="repeat"
                    value={newItem.repeat}
                    onChange={(e) => setNewItem({...newItem, repeat: Number(e.target.value)})}
                    className="flex h-9 w-full rounded-md border border-gray-700 bg-[#3a3a3a] px-3 py-1 text-sm text-white"
                  >
                    <option value="1">No repeat</option>
                    <option value="2">Monthly</option>
                    <option value="3">Quarterly</option>
                    <option value="4">Yearly</option>
                  </select>
                </div>
                
                {/* Error messages */}
                {formErrors.length > 0 && (
                  <div className="p-3 rounded bg-red-900/30 border border-red-800">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        {formErrors.map((err, index) => (
                          <p key={index} className="text-red-500 text-sm">{err}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Success message */}
                {successMessage && (
                  <div className="p-3 rounded bg-green-900/30 border border-green-800">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-500 text-sm">{successMessage}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90"
                >
                  Add {addType === 'income' ? 'Income' : 'Expense'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <DashboardLoadingStates isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <DashboardSummary summary={accountSummary} />

            <div className="mt-8">
              <TransactionList 
                transactions={transactions} 
                onViewTransaction={handleViewTransaction}
                onTransactionsUpdated={handleTransactionsUpdated}
              />
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-medium mb-4">Financial Insights</h2>
              <InsightCards 
                insights={insights} 
                onViewInsight={handleViewInsight} 
              />
            </div>
            
            {/* Desktop Dialogs - only shown on desktop */}
            {!isMobile && (
              <>
                <DesktopTransactionDialog
                  open={showTransactionDetails}
                  onOpenChange={setShowTransactionDetails}
                  transaction={selectedTransaction}
                />
                
                <DesktopInsightDialog
                  open={showInsightDetails}
                  onOpenChange={setShowInsightDetails}
                  insight={selectedInsight}
                />
              </>
            )}
          </>
        )}
      </div>
      
      {/* Insight Drawer */}
      <InsightDrawer
        isOpen={showInsightDetails}
        onClose={() => setShowInsightDetails(false)}
        insight={selectedInsight}
      />
      
      {/* Add Income Drawer */}
      <BudgetDrawer
        isOpen={showAddIncomeDrawer}
        onClose={() => setShowAddIncomeDrawer(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            await handleAddItem({
              name: newItem.name,
              amount: newItem.amount,
              itemType: 'income',
              categoryId: newItem.categoryId,
              repeat: newItem.repeat
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        itemType="income"
        categories={categories}
        formData={newItem}
        setFormData={setNewItem}
        formErrors={formErrors || []}
        successMessage={successMessage || ''}
        isSubmitting={isSubmitting}
      />
      
      {/* Add Expense Drawer */}
      <BudgetDrawer
        isOpen={showAddExpenseDrawer}
        onClose={() => setShowAddExpenseDrawer(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            await handleAddItem({
              name: newItem.name,
              amount: newItem.amount,
              itemType: 'expense',
              categoryId: newItem.categoryId,
              repeat: newItem.repeat
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        itemType="expense"
        categories={categories}
        formData={newItem}
        setFormData={setNewItem}
        formErrors={formErrors || []}
        successMessage={successMessage || ''}
        isSubmitting={isSubmitting}
      />
      <div className='mx-20 md:mx-20 lg:mx-20'>
        <FloatingActionButton 
          onAddIncome={() => handleOpenIncomeDrawer()}
          onAddExpense={() => handleOpenExpenseDrawer()}
          watchElementId="dashboard-quick-actions"
        />
      </div>

      {/* Scroll to Top Button with lower mobile threshold */}
      <ScrollToTop threshold={400} mobileThreshold={200} />
    </ProtectedLayout>
  );
} 