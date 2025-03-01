import { prisma } from '../utils/db';
import { BudgetItem, Category } from '@prisma/client';

export interface CreateCategoryDto {
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface CreateBudgetItemDto {
  name: string;
  amount: number;
  itemType: 'income' | 'expense';
  categoryId: string;
  month: number;
  year: number;
  repeat: number;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
}

export class BudgetService {
  // Create default categories for a new user
  async createDefaultCategories(userId: number): Promise<void> {
    const defaultCategories = [
      { name: 'Fixed Income', type: 'income', isDefault: true },
      { name: 'Variable Income', type: 'income', isDefault: true },
      { name: 'Fixed Expenses', type: 'expense', isDefault: true },
      { name: 'Variable Expenses', type: 'expense', isDefault: true }
    ];

    for (const category of defaultCategories) {
      await this.createCategory(userId, {
        name: category.name,
        type: category.type as 'income' | 'expense',
        isDefault: true
      });
    }
  }

  // Create a new category
  async createCategory(userId: number, data: CreateCategoryDto): Promise<Category> {
    return await prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        isDefault: data.isDefault || false
      }
    });
  }

  // Get all categories for a user
  async getCategories(userId: number): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { userId }
    });
  }

  // Update category visibility
  async updateCategoryVisibility(userId: number, categoryId: string, isVisible: boolean): Promise<Category> {
    return await prisma.category.update({
      where: {
        id: categoryId,
        userId
      },
      data: { isVisible }
    });
  }

  // Delete a category (and all its budget items)
  async deleteCategory(userId: number, categoryId: string): Promise<void> {
    // Only non-default categories can be deleted
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category || category.userId !== userId) {
      throw new Error('Category not found');
    }

    if (category.isDefault) {
      throw new Error('Default categories cannot be deleted');
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });
  }

  // Create a new budget item
  async createBudgetItem(userId: number, data: CreateBudgetItemDto): Promise<BudgetItem> {
    // Verify category exists and belongs to user
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category || category.userId !== userId) {
      throw new Error('Invalid category');
    }

    // Verify category type matches item type
    if (category.type !== data.itemType) {
      throw new Error(`Category type (${category.type}) doesn't match item type (${data.itemType})`);
    }

    return await prisma.budgetItem.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        itemType: data.itemType,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        repeat: data.repeat || 1
      }
    });
  }

  // Get budget items for a specific month/year
  async getBudgetItems(userId: number, month?: number, year?: number): Promise<BudgetItem[]> {
    const filters: any = { userId };
    
    if (month !== undefined) {
      filters.month = month;
    }
    
    if (year !== undefined) {
      filters.year = year;
    }

    return await prisma.budgetItem.findMany({
      where: filters,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get budget summary for a specific month/year
  async getBudgetSummary(userId: number, month: number, year: number): Promise<BudgetSummary> {
    const items = await this.getBudgetItems(userId, month, year);
    
    const totalIncome = items
      .filter(item => item.itemType === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);
      
    const totalExpenses = items
      .filter(item => item.itemType === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    return {
      totalIncome,
      totalExpenses,
      remainingBudget: totalIncome - totalExpenses
    };
  }

  // Update a budget item
  async updateBudgetItem(userId: number, itemId: string, data: Partial<CreateBudgetItemDto>): Promise<BudgetItem> {
    // First check if item exists and belongs to user
    const existingItem = await prisma.budgetItem.findUnique({
      where: { id: itemId },
      include: { category: true }
    });

    if (!existingItem || existingItem.userId !== userId) {
      throw new Error('Budget item not found');
    }

    // If changing category, ensure it's valid and type matches
    if (data.categoryId && data.categoryId !== existingItem.categoryId) {
      const newCategory = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!newCategory || newCategory.userId !== userId) {
        throw new Error('Invalid category');
      }

      // Check if item type is changing
      const itemType = data.itemType || existingItem.itemType;
      
      if (newCategory.type !== itemType) {
        throw new Error(`Category type (${newCategory.type}) doesn't match item type (${itemType})`);
      }
    }

    return await prisma.budgetItem.update({
      where: { id: itemId },
      data
    });
  }

  // Delete a budget item
  async deleteBudgetItem(userId: number, itemId: string): Promise<void> {
    // Check if item exists and belongs to user
    const item = await prisma.budgetItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.userId !== userId) {
      throw new Error('Budget item not found');
    }

    await prisma.budgetItem.delete({
      where: { id: itemId }
    });
  }
} 