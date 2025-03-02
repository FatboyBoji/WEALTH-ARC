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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingActionButton from '@/components/budget/walletPage/FloatingActionButton';
import CategoryManagement from '@/components/budget/walletPage/CategoryManagement';
import { Button } from '@/components/ui/button';

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
  const [newCategory, setNewCategory] = useState<{
    name: string;
    type: 'income' | 'expense' | 'mixed';
  }>({
    name: '',
    type: 'expense'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Add a state to toggle the category management section
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  // Add a ref to store the previous scroll position
  const [prevScrollPosition, setPrevScrollPosition] = useState(0);

  // Add a reference to track if categories have changed to force re-render
  const [categoryUpdateCounter, setCategoryUpdateCounter] = useState(0);

  // Load data
  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all categories (visible and invisible)
      const allCategories = await getCategories();
      setCategories(allCategories);
      
      // Setup initial collapsed state based on all categories
      const initialCollapsedState: Record<string, boolean> = {};
      allCategories.forEach(cat => {
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
      setError('Failed to load wallet data. Please try again.');
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
  const handleAddCategory = () => {
    setNewCategory({
      name: '',
      type: 'expense' // Default to expense, but now it can be changed to 'mixed'
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
  
  // Add a handler for category creation from the budget drawer
  const handleCategoryCreatedFromBudget = (category: Category) => {
    // Add the new category to the local state
    setCategories(prev => [...prev, category]);
    
    // Show a temporary success message
    setSuccessMessage('Category created and selected!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Keep the dynamic calculation of income and expense categories
  const incomeCategories = categories
    .filter(cat => (cat.type === 'income' || cat.type === 'mixed') && cat.isVisible)
    .map(cat => ({
      ...cat,
      items: budgetItems.filter(item => item.categoryId === cat.id && item.itemType === 'income')
    }));
    
  const expenseCategories = categories
    .filter(cat => (cat.type === 'expense' || cat.type === 'mixed') && cat.isVisible)
    .map(cat => ({
      ...cat,
      items: budgetItems.filter(item => item.categoryId === cat.id && item.itemType === 'expense')
    }));

  // Add a helper function to refresh visible categories
  const refreshVisibleCategories = () => {
    // Keep the dynamic calculation of income and expense categories
    // This is already in your code and works fine when category visibility changes
    
    // Force re-render of components that depend on categories
    setCategoryUpdateCounter(prev => prev + 1);
  };

  // Modify the onCategoryUpdated callback
  const handleCategoryUpdated = () => {
    // First load all data from the server
    loadData();
    
    // Then make sure the UI updates
    refreshVisibleCategories();
  };

  // Add a function to handle toggling category management with scroll behavior
  const handleToggleCategoryManagement = () => {
    if (!showCategoryManagement) {
      // Store current scroll position before opening
      setPrevScrollPosition(window.scrollY);
      
      // Toggle the state to show the section
      setShowCategoryManagement(true);
      
      // After the state updates and component renders, scroll to the management section
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      // First close the section
      setShowCategoryManagement(false);
      
      // Wait for the closing animation to complete before scrolling back
      setTimeout(() => {
        window.scrollTo({
          top: prevScrollPosition,
          behavior: 'smooth'
        });
      }, 1000); // Reduced from 350ms to make it feel more responsive
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto">
        <WalletLoadingStates isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => handleMonthChange(-1)} 
                className="p-2 rounded-full hover:bg-[#004346]/50"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <h2 className="text-xl font-medium text-white">
                {formattedDate}
              </h2>
              
              <button 
                onClick={() => handleMonthChange(1)} 
                className="p-2 rounded-full hover:bg-[#004346]/50"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <WalletContent 
              key={`wallet-content-${categoryUpdateCounter}`} // Force re-render when categories change
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
                  onCategoryCreated={handleCategoryCreatedFromBudget}
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

            {/* Add a button to toggle the category management section - with elegant border */}
            <div className="mt-12 rounded-t-xl bg-[#192A38] border border-[#09BC8A]/20 shadow-inner shadow-[#09BC8A]/5 p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <span className="inline-block h-4 w-1 bg-[#09BC8A] rounded-full mr-3"></span>
                  Categories
                </h3>
                <Button 
                  onClick={handleToggleCategoryManagement}
                  className="text-sm bg-[#004346] text-white hover:bg-[#005b5e] rounded-xl transition-all duration-200"
                >
                  {showCategoryManagement ? 'Hide Management' : 'Manage Categories'}
                </Button>
              </div>
            </div>

            {/* Category Management Section - with matching border */}
            <div className={`mb-20 rounded-b-xl bg-[#192A38] border-x border-b border-[#09BC8A]/20
                          ${showCategoryManagement 
                            ? 'max-h-[2000px] opacity-100' 
                            : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'} 
                          transition-all duration-500 ease-in-out`}>
              {showCategoryManagement && (
                <div className="p-5">
                  <CategoryManagement 
                    categories={Array.from(new Map([...categories].map(cat => [cat.id, cat])).values())} 
                    onCategoryUpdated={handleCategoryUpdated}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className='mx-20 md:mx-20 lg:mx-20'>
        <FloatingActionButton 
          onAddIncome={() => handleAddItem('income')}
          onAddExpense={() => handleAddItem('expense')}
        />
      </div>
      <ScrollToTop threshold={400} mobileThreshold={200} />
    </ProtectedLayout>
  );
} 