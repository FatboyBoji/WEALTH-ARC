'use client';

import React, { useState } from 'react';
import { Category, deleteCategory, updateCategoryVisibility, updateCategoryName } from '@/lib/budgetApi';
import { AlertCircle, Check, Edit, Eye, EyeOff, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CategoryManagementProps {
  categories: Category[];
  onCategoryUpdated: () => void;
}

export default function CategoryManagement({ categories, onCategoryUpdated }: CategoryManagementProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteWithItems, setDeleteWithItems] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Open edit dialog
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteWithItems(false);
    setIsDeleteDialogOpen(true);
  };

  // Toggle category visibility
  const handleToggleVisibility = async (category: Category) => {
    try {
      setIsLoading(true);
      
      // Log the request details for debugging
      console.log(`Toggling visibility for category: ${category.id}`, {
        name: category.name,
        currentVisibility: category.isVisible,
        newVisibility: !category.isVisible
      });
      
      const updatedCategory = await updateCategoryVisibility(category.id, !category.isVisible);
      
      // Log the response for debugging
      console.log('Category visibility updated:', updatedCategory);
      
      // Update the UI
      onCategoryUpdated();
      
      setSuccess(`Category "${updatedCategory.name}" is now ${updatedCategory.isVisible ? 'visible' : 'hidden'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling category visibility:', error);
      
      // Improved error message with more details
      let errorMessage = 'Failed to update category visibility';
      
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Response data:', error.response);
        
        if (error.response && 
            typeof error.response === 'object' && 
            'data' in error.response &&
            error.response.data && 
            typeof error.response.data === 'object' && 
            'message' in error.response.data) {
          errorMessage = `Error: ${error.response.data.message}`;
        }
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Save category name
  const handleSaveEdit = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsLoading(true);
      await updateCategoryName(selectedCategory.id, newCategoryName);
      onCategoryUpdated();
      setSuccess('Category name updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating category name:', error);
      setError('Failed to update category name');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete category
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    const categoryName = selectedCategory.name;
    
    try {
      setIsLoading(true);
      setError('');
      
      await deleteCategory(selectedCategory.id, deleteWithItems);
      onCategoryUpdated();
      setSuccess(`Category "${categoryName}" has been deleted`);
      setTimeout(() => setSuccess(''), 3000);
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      
      let errorMessage = 'Failed to delete category';
      
      if (error && typeof error === 'object') {
        if ('response' in error && 
            error.response && 
            typeof error.response === 'object' && 
            'data' in error.response) {
          
          const responseData = error.response.data;
          
          if (typeof responseData === 'object' && responseData !== null) {
            if ('code' in responseData && responseData.code === 'CATEGORY_HAS_ITEMS') {
              errorMessage = 'This category contains items. Please choose what to do with them.';
            } else if ('message' in responseData && typeof responseData.message === 'string') {
              errorMessage = responseData.message;
            }
          }
        }
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="mb-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/50">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-xl bg-green-900/20 border border-green-800/50">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-[#09BC8A] mr-2" />
                <p className="text-[#09BC8A]">{success}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Categories List */}
      <div className="grid gap-3">
        {categories.map(category => (
          <div 
            key={category.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#004346]/70 border border-[#09BC8A]/20 hover:border-[#09BC8A]/40 transition-colors"
          >
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-3 ${
                category.type === 'income' ? 'bg-[#09BC8A]' : 
                category.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <span className={category.isVisible ? 'text-white' : 'text-gray-400'}>
                {category.name}
              </span>
              {!category.isVisible && (
                <span className="ml-2 text-xs text-gray-500">(hidden)</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleVisibility(category)}
                className="p-2 rounded-lg hover:bg-[#212121] transition-colors"
                title={category.isVisible ? 'Hide category' : 'Show category'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : category.isVisible ? (
                  <Eye className="h-5 w-5 text-green-400 hover:text-green-300" />
                ) : (
                  <EyeOff className="h-5 w-5 text-red-400 hover:text-red-300" />
                )}
              </button>
              
              <button 
                onClick={() => handleEdit(category)}
                className="p-1.5 rounded-lg hover:bg-[#09BC8A]/20 text-gray-300 hover:text-white"
                disabled={isLoading}
                aria-label="Edit category"
              >
                <Edit size={16} />
              </button>
              
              {!category.isDefault && (
                <button 
                  onClick={() => handleDelete(category)}
                  className="p-1.5 rounded-lg hover:bg-red-800/30 text-gray-300 hover:text-red-400"
                  disabled={isLoading}
                  aria-label="Delete category"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-[#004346] border-none text-white rounded-xl"
                placeholder="Enter category name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSaveEdit}
              className="bg-[#09BC8A] text-[#192A38] hover:bg-[#09BC8A]/90 rounded-xl"
              disabled={isLoading || !newCategoryName.trim()}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2 text-[#192A38]" />
                  <span>Saving...</span>
                </div>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#192A38] text-white border-gray-700 rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete the category "{selectedCategory?.name}"?</p>
            
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="deleteItems"
                  checked={deleteWithItems}
                  onChange={() => setDeleteWithItems(!deleteWithItems)}
                  className="rounded bg-[#004346] border-none focus:ring-[#09BC8A]"
                />
                <label htmlFor="deleteItems">
                  Also delete all items in this category
                </label>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {deleteWithItems 
                  ? "This will permanently delete all budget items in this category." 
                  : "Items will remain without a category and can be reassigned later."}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-[#212121] border-none text-white hover:bg-[#2d2d2d] rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2 text-white" />
                  <span>Deleting...</span>
                </div>
              ) : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 