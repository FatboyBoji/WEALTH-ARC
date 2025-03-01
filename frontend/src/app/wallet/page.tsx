'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { 
  getCategories, 
  getBudgetItems, 
  getBudgetSummary,
  createBudgetItem,
  deleteBudgetItem,
  Category,
  BudgetItem,
  BudgetSummary,
  createCategory
} from '@/lib/budgetApi';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import BudgetDrawer from '@/components/budget/BudgetDrawer';
import CategoryDrawer from '@/components/budget/CategoryDrawer';
import WalletLoadingStates from '@/components/budget/walletPage/WalletLoadingStates';
import WalletContent from '@/components/budget/walletPage/WalletContent';
import DesktopItemDialog from '@/components/budget/walletPage/DesktopItemDialog';
import DesktopCategoryDialog from '@/components/budget/walletPage/DesktopCategoryDialog';

// Month formatter
const formatMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
};

// Get current month and year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear()
  };
};

// Repeat options for select
const repeatOptions = [
  { value: 1, label: 'No repeat' },
  { value: 2, label: 'Monthly' },
  { value: 3, label: 'Quarterly' },
  { value: 4, label: 'Yearly' }
];

export default function WalletPage() {
  // Responsive views
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State for current month/year
  const [date, setDate] = useState(getCurrentMonthYear());
  const [formattedDate, setFormattedDate] = useState(formatMonth(date.month, date.year));
  
  // State for budget data
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0
  });
  
  // UI state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state for adding items
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    itemType: 'expense' as 'income' | 'expense',
    categoryId: '',
    repeat: 1 // Default: No repeat
  });
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      
      // Setup initial collapsed state
      const initialCollapsedState: Record<string, boolean> = {};
      categoriesData.forEach(cat => {
        initialCollapsedState[cat.id] = false; // All sections expanded by default
      });
      setCollapsedSections(prevState => ({
        ...prevState,
        ...initialCollapsedState
      }));
      
      // Load budget items and summary for current month/year
      const [itemsData, summaryData] = await Promise.all([
        getBudgetItems(date.month, date.year),
        getBudgetSummary(date.month, date.year)
      ]);
      
      setBudgetItems(itemsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (offset: number) => {
    let newMonth = date.month + offset;
    let newYear = date.year;
      
      if (newMonth > 12) {
        newMonth = 1;
      newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
      newYear -= 1;
      }
      
    setDate({
      month: newMonth,
      year: newYear
    });
    setFormattedDate(formatMonth(newMonth, newYear));
  };

  // Toggle section collapse
  const handleToggleSection = (categoryId: string) => {
    setCollapsedSections(prevState => ({
      ...prevState,
      [categoryId]: !prevState[categoryId]
    }));
  };

  // Delete budget item
  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteBudgetItem(itemId);
        await loadData(); // Reload data
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item. Please try again.');
      }
    }
  };
  
  // Add new budget item
  const handleAddItem = (type: 'income' | 'expense') => {
    setNewItem({
      name: '',
      amount: '',
      itemType: type,
      categoryId: '',
      repeat: 1
    });
    setFormErrors([]);
    setSuccessMessage('');
    setShowAddItemDialog(true);
  };
  
  // Add new category
  const handleAddCategory = (type: 'income' | 'expense' = 'expense') => {
    setNewCategory({
      name: '',
      type
    });
    setFormErrors([]);
    setSuccessMessage('');
    setShowAddCategoryDialog(true);
  };
  
  // Submit new item
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setFormErrors([]);
    setSuccessMessage('');
    
    // Validation
    const errors: string[] = [];
    if (!newItem.name.trim()) errors.push('Name is required');
    if (!newItem.amount || Number(newItem.amount) <= 0) errors.push('Amount must be greater than 0');
    if (!newItem.categoryId) errors.push('Please select a category');
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await createBudgetItem({
        name: newItem.name,
        amount: Number(newItem.amount),
        categoryId: newItem.categoryId,
        repeat: newItem.repeat,
        month: date.month,
        year: date.year,
        itemType: newItem.itemType
      });
      
      setSuccessMessage(`${newItem.itemType === 'income' ? 'Income' : 'Expense'} added successfully!`);
      
      // Reload data after a short delay (to show success message)
      setTimeout(() => {
        loadData();
        setShowAddItemDialog(false);
        
        // Reset form
        setNewItem({
          name: '',
          amount: '',
          itemType: newItem.itemType, // Keep the current type selected
          categoryId: '',
          repeat: 1
        });
      }, 1500);
    } catch (err) {
      console.error('Error adding item:', err);
      setFormErrors(['Failed to add item. Please try again.']);
    }
  };
  
  // Submit new category
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setFormErrors([]);
    setSuccessMessage('');
    
    // Validation
    const errors: string[] = [];
    if (!newCategory.name.trim()) errors.push('Category name is required');
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await createCategory({
        name: newCategory.name,
        type: newCategory.type
      });
      
      setSuccessMessage('Category added successfully!');
      
      // Reload data after a short delay (to show success message)
      setTimeout(() => {
        loadData();
        setShowAddCategoryDialog(false);
        
        // Reset form
        setNewCategory({
          name: '',
          type: newCategory.type // Keep the current type selected
        });
      }, 1500);
      } catch (err) {
      console.error('Error adding category:', err);
      setFormErrors(['Failed to add category. Please try again.']);
    }
  };
  
  // Prepare data for category lists
  const incomeCategories = categories
    .filter(cat => cat.type === 'income' && cat.isVisible)
    .map(cat => ({
      ...cat,
      items: budgetItems.filter(item => item.categoryId === cat.id)
    }));
    
  const expenseCategories = categories
    .filter(cat => cat.type === 'expense' && cat.isVisible)
    .map(cat => ({
      ...cat,
      items: budgetItems.filter(item => item.categoryId === cat.id)
    }));

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto">
        <WalletLoadingStates isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <WalletContent 
              formattedDate={formattedDate}
              onPrevMonth={() => handleMonthChange(-1)}
              onNextMonth={() => handleMonthChange(1)}
              summary={summary}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              collapsedSections={collapsedSections}
              onToggleSection={handleToggleSection}
              onDeleteItem={handleDeleteItem}
              onAddIncome={() => handleAddItem('income')}
              onAddExpense={() => handleAddItem('expense')}
              onAddCategory={() => handleAddCategory()}
            />
            
            {/* Mobile Drawers - only shown on mobile */}
            {isMobile && (
              <>
                <BudgetDrawer 
                  isOpen={showAddItemDialog}
                  onClose={() => setShowAddItemDialog(false)}
                  onSubmit={handleAddItemSubmit}
                  itemType={newItem.itemType}
                  categories={categories}
                  formData={newItem}
                  setFormData={setNewItem}
                  formErrors={formErrors}
                  successMessage={successMessage}
                />
                
                <CategoryDrawer
                  isOpen={showAddCategoryDialog}
                  onClose={() => setShowAddCategoryDialog(false)}
                  onSubmit={handleAddCategorySubmit}
                  categoryType={newCategory.type}
                  formData={newCategory}
                  setFormData={setNewCategory}
                  formErrors={formErrors}
                  successMessage={successMessage}
                />
              </>
            )}
            
            {/* Desktop: Add Item Dialog */}
            {!isMobile && (
              <>
                <DesktopItemDialog
                  open={showAddItemDialog}
                  onOpenChange={setShowAddItemDialog}
                  onSubmit={handleAddItemSubmit}
                  itemType={newItem.itemType}
                  categories={categories}
                  formData={newItem}
                  setFormData={setNewItem}
                  formErrors={formErrors}
                  successMessage={successMessage}
                  repeatOptions={repeatOptions}
                />
                
                <DesktopCategoryDialog
                  open={showAddCategoryDialog}
                  onOpenChange={setShowAddCategoryDialog}
                  onSubmit={handleAddCategorySubmit}
                  formData={newCategory}
                  setFormData={setNewCategory}
                  formErrors={formErrors}
                  successMessage={successMessage}
                />
              </>
            )}
          </>
        )}
      </div>
    </ProtectedLayout>
  );
} 