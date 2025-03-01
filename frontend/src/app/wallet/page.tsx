'use client';

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { AlertCircle, Check, ChevronDown, ChevronUp, Trash2, PlusCircle } from 'lucide-react';

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

export default function WalletPage() {
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

  // Change month handler
  const changeMonth = (increment: number) => {
    setDate(prevDate => {
      let newMonth = prevDate.month + increment;
      let newYear = prevDate.year;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      
      setFormattedDate(formatMonth(newMonth, newYear));
      return { month: newMonth, year: newYear };
    });
  };

  // Toggle section collapse
  const toggleSection = (categoryId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter categories by type
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type && cat.isVisible);
  };

  // Filter budget items by category
  const getItemsByCategoryId = (categoryId: string) => {
    return budgetItems.filter(item => item.categoryId === categoryId);
  };

  // Add new item handlers
  const handleOpenAddItemDialog = (itemType: 'income' | 'expense') => {
    setShowAddItemDialog(true);
    setNewItem({
      name: '',
      amount: '',
      itemType,
      categoryId: '',
      repeat: 1
    });
    setFormErrors([]);
    setSuccessMessage('');
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validate form
    const errors = [];
    if (!newItem.name) errors.push('Name is required');
    if (!newItem.amount || isNaN(Number(newItem.amount))) errors.push('Amount must be a valid number');
    if (!newItem.categoryId) errors.push('Please select a category');
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await createBudgetItem({
        name: newItem.name,
        amount: Number(newItem.amount),
        itemType: newItem.itemType,
        categoryId: newItem.categoryId,
        month: date.month,
        year: date.year,
        repeat: newItem.repeat
      });
      
      setSuccessMessage('Budget item added successfully!');
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData();
        setShowAddItemDialog(false);
      }, 1500);
    } catch (err: any) {
      setFormErrors([err.response?.data?.message || 'Failed to add budget item']);
    }
  };

  // Add new category handlers
  const handleOpenAddCategoryDialog = (type: 'income' | 'expense') => {
    setShowAddCategoryDialog(true);
    setNewCategory({
      name: '',
      type
    });
    setFormErrors([]);
    setSuccessMessage('');
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validate form
    if (!newCategory.name) {
      setFormErrors(['Category name is required']);
      return;
    }
    
    try {
      await createCategory({
        name: newCategory.name,
        type: newCategory.type
      });
      
      setSuccessMessage('Category added successfully!');
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData();
        setShowAddCategoryDialog(false);
      }, 1500);
    } catch (err: any) {
      setFormErrors([err.response?.data?.message || 'Failed to add category']);
    }
  };

  // Delete item handler
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteBudgetItem(itemId);
        // Reload data
        loadData();
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  // Repeat options
  const repeatOptions = [
    { value: 1, label: 'No repeat' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Quarterly' },
    { value: 4, label: 'Yearly' }
  ];

  return (
    <ProtectedLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Month Navigator */}
          <div className="mb-4 flex justify-between items-center">
            <Button onClick={() => changeMonth(-1)} variant="outline" className="bg-transparent text-white">
              &lt;
            </Button>
            <h1 className="text-2xl font-bold">{formattedDate}</h1>
            <Button onClick={() => changeMonth(1)} variant="outline" className="bg-transparent text-white">
              &gt;
            </Button>
          </div>
          
          {/* Distribution Summary */}
          <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-medium">Distribution</h2>
              <ChevronDown className="h-5 w-5" />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Income</span>
                <span className="font-bold">{summary.totalIncome.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total expenses</span>
                <span className="font-bold">{summary.totalExpenses.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Remaining Budget</span>
                <span className="font-bold">{summary.remainingBudget.toFixed(2)}€</span>
              </div>
            </div>
          </div>
          
          {/* Income Categories */}
          {getCategoriesByType('income').map(category => (
            <div key={category.id} className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
              <div 
                className="p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(category.id)}
              >
                <h2 className="font-medium">{category.name}</h2>
                {collapsedSections[category.id] ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
              
              {!collapsedSections[category.id] && (
                <div className="p-3 space-y-2">
                  {getItemsByCategoryId(category.id).map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2 text-[#09BC8A]">{item.amount.toFixed(2)}€</span>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add item button */}
                  <button 
                    onClick={() => handleOpenAddItemDialog('income')}
                    className="w-full mt-2 flex items-center justify-center py-2 text-sm text-gray-300 hover:text-[#09BC8A]"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>Add Income Item</span>
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* Expense Categories */}
          {getCategoriesByType('expense').map(category => (
            <div key={category.id} className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
              <div 
                className="p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(category.id)}
              >
                <h2 className="font-medium">{category.name}</h2>
                {collapsedSections[category.id] ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
              
              {!collapsedSections[category.id] && (
                <div className="p-3 space-y-2">
                  {getItemsByCategoryId(category.id).map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2 text-red-400">{item.amount.toFixed(2)}€</span>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add item button */}
                  <button 
                    onClick={() => handleOpenAddItemDialog('expense')}
                    className="w-full mt-2 flex items-center justify-center py-2 text-sm text-gray-300 hover:text-red-400"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>Add Expense Item</span>
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* Add Category Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => handleOpenAddCategoryDialog('income')}
              className="bg-[#004346] p-3 rounded-lg text-center hover:bg-[#00595d]"
            >
              <span>Add Income Category</span>
            </button>
            <button 
              onClick={() => handleOpenAddCategoryDialog('expense')}
              className="bg-[#004346] p-3 rounded-lg text-center hover:bg-[#00595d]"
            >
              <span>Add Expense Category</span>
            </button>
          </div>
          
          {/* Add Item Dialog */}
          <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
            <DialogContent className="bg-[#192A38] text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>
                  Add {newItem.itemType === 'income' ? 'Income' : 'Expense'} Item
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAddItemSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                      placeholder={`What is this ${newItem.itemType} for?`}
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
                        .filter(cat => cat.type === newItem.itemType && cat.isVisible)
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
                      {repeatOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                    onClick={() => setShowAddItemDialog(false)}
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90"
                  >
                    Add Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Add Category Dialog */}
          <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
            <DialogContent className="bg-[#192A38] text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>
                  Add {newCategory.type === 'income' ? 'Income' : 'Expense'} Category
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAddCategorySubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="bg-[#3a3a3a] border-gray-700 text-white"
                      placeholder="Enter category name"
                    />
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
                    onClick={() => setShowAddCategoryDialog(false)}
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90"
                  >
                    Add Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </ProtectedLayout>
  );
} 