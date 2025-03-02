import { Request, Response } from 'express';
import { BudgetService, CreateBudgetItemDto, CreateCategoryDto } from '../services/BudgetService';

export class BudgetController {
  private budgetService: BudgetService;

  constructor() {
    this.budgetService = new BudgetService();
  }

  // Category endpoints
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const categories = await this.budgetService.getCategories(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories'
      });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const categoryData: CreateCategoryDto = req.body;
      
      // Validate input
      if (!categoryData.name || !categoryData.type) {
        res.status(400).json({
          success: false,
          message: 'Name and type are required for a category'
        });
        return;
      }

      // Validate type
      if (!['income', 'expense', 'mixed'].includes(categoryData.type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be "income", "expense", or "mixed"'
        });
        return;
      }

      const category = await this.budgetService.createCategory(req.user.userId, categoryData);
      
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  }

  async updateCategoryVisibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { categoryId } = req.params;
      const { isVisible } = req.body;
      
      console.log(`Controller: Updating category ${categoryId} visibility to ${isVisible}`);
      
      const updatedCategory = await this.budgetService.updateCategoryVisibility(
        categoryId,
        userId,
        isVisible
      );
      
      res.json({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category visibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category visibility'
      });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.params.id;
      const userId = req.user?.userId;
      const { deleteItems } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      try {
        await this.budgetService.deleteCategory(categoryId, userId, deleteItems);
        res.status(200).json({
          success: true,
          message: 'Category deleted successfully'
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'CATEGORY_HAS_ITEMS') {
          res.status(400).json({
            success: false,
            message: 'Category has items. Please specify what to do with them.',
            code: 'CATEGORY_HAS_ITEMS'
          });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }

  // Budget Item endpoints
  async getBudgetItems(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const budgetItems = await this.budgetService.getBudgetItems(req.user.userId, month, year);
      
      res.status(200).json({
        success: true,
        data: budgetItems
      });
    } catch (error) {
      console.error('Error getting budget items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get budget items'
      });
    }
  }

  async createBudgetItem(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const budgetItemData: CreateBudgetItemDto = req.body;
      
      // Validate required fields
      if (!budgetItemData.name || 
          budgetItemData.amount === undefined || 
          !budgetItemData.itemType || 
          !budgetItemData.categoryId ||
          budgetItemData.month === undefined ||
          budgetItemData.year === undefined) {
        res.status(400).json({
          success: false,
          message: 'Name, amount, type, categoryId, month, and year are required for a budget item'
        });
        return;
      }

      // Validate amount is a positive number
      if (budgetItemData.amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
        return;
      }

      // Validate type
      if (budgetItemData.itemType !== 'income' && budgetItemData.itemType !== 'expense') {
        res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
        return;
      }

      const budgetItem = await this.budgetService.createBudgetItem(req.user.userId, budgetItemData);
      
      res.status(201).json({
        success: true,
        data: budgetItem
      });
    } catch (error: any) {
      console.error('Error creating budget item:', error);
      
      // Handle specific error messages
      if (error.message && (
          error.message.includes('Invalid category') || 
          error.message.includes("Category type doesn't match item type"))) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create budget item'
      });
    }
  }

  async updateBudgetItem(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { itemId } = req.params;
      const updateData = req.body;
      
      const budgetItem = await this.budgetService.updateBudgetItem(req.user.userId, itemId, updateData);
      
      res.status(200).json({
        success: true,
        data: budgetItem
      });
    } catch (error: any) {
      console.error('Error updating budget item:', error);
      
      // Handle specific error messages
      if (error.message && (
          error.message.includes('Budget item not found') || 
          error.message.includes('Invalid category') || 
          error.message.includes("Category type doesn't match item type"))) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update budget item'
      });
    }
  }

  async deleteBudgetItem(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { itemId } = req.params;
      
      await this.budgetService.deleteBudgetItem(req.user.userId, itemId);
      
      res.status(200).json({
        success: true,
        message: 'Budget item deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting budget item:', error);
      
      if (error.message === 'Budget item not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete budget item'
      });
    }
  }

  // Budget Summary endpoint
  async getBudgetSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Month and year are required for summary
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const summary = await this.budgetService.getBudgetSummary(req.user.userId, month, year);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting budget summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get budget summary'
      });
    }
  }

  async updateCategoryName(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.params.id;
      const userId = req.user?.userId;
      const { name } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
        return;
      }

      const updatedCategory = await this.budgetService.updateCategoryName(
        categoryId,
        userId,
        name
      );

      res.status(200).json({
        success: true,
        message: 'Category name updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category name:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category name'
      });
    }
  }
} 