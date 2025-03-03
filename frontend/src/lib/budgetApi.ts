import api from './api';

// Category types
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'mixed';
  isDefault: boolean;
  isVisible: boolean;
}

export interface CreateCategoryDto {
  name: string;
  type: 'income' | 'expense' | 'mixed';
}

// Budget item types
export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  itemType: 'income' | 'expense';
  category: Category;
  categoryId: string;
  month: number;
  year: number;
  repeat: number;
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

// Category API calls
export const getCategories = async () => {
  const response = await api.get('/budget/categories');
  return response.data.data as Category[];
};

export const createCategory = async (categoryData: CreateCategoryDto) => {
  const response = await api.post('/budget/categories', categoryData);
  return response.data.data as Category;
};

export const updateCategoryVisibility = async (categoryId: string, isVisible: boolean) => {
  try {
    // console.log(`API call: Setting category ${categoryId} visibility to ${isVisible}`);
    const response = await api.patch(`/budget/categories/${categoryId}/visibility`, { isVisible });
    return response.data.data as Category;
  } catch (error) {
    console.error('API Error in updateCategoryVisibility:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string, deleteItems: boolean = false) => {
  try {
    const response = await api.delete(`/budget/categories/${categoryId}`, {
      data: { deleteItems }
    });
    return response.data;
  } catch (error) {
    // Rethrow the error with any response data intact
    console.error('API Error in deleteCategory:', error);
    throw error;
  }
};

export const updateCategoryName = async (categoryId: string, name: string) => {
  const response = await api.patch(`/budget/categories/${categoryId}/name`, { name });
  return response.data.data as Category;
};

// Budget item API calls
export const getBudgetItems = async (month?: number, year?: number) => {
  let url = '/budget/items';
  const params: any = {};
  
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;
  
  const response = await api.get(url, { params });
  return response.data.data as BudgetItem[];
};

export const createBudgetItem = async (itemData: CreateBudgetItemDto) => {
  const response = await api.post('/budget/items', itemData);
  return response.data.data as BudgetItem;
};

export const updateBudgetItem = async (itemId: string, updateData: Partial<CreateBudgetItemDto>) => {
  const response = await api.patch(`/budget/items/${itemId}`, updateData);
  return response.data.data as BudgetItem;
};

export const deleteBudgetItem = async (itemId: string) => {
  await api.delete(`/budget/items/${itemId}`);
};

// Budget summary API call
export const getBudgetSummary = async (month?: number, year?: number) => {
  const params: any = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;
  
  const response = await api.get('/budget/summary', { params });
  return response.data.data as BudgetSummary;
};

/**
 * Fetch all budget items for a specific month and year
 */
export async function fetchBudgetItems(month: number, year: number) {
  try {
    const response = await api.get(`/budget/items?month=${month}&year=${year}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching budget items:', error);
    throw error;
  }
} 