import api from './api';

// Category types
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  isVisible: boolean;
}

export interface CreateCategoryDto {
  name: string;
  type: 'income' | 'expense';
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
  const response = await api.patch(`/budget/categories/${categoryId}/visibility`, { isVisible });
  return response.data.data as Category;
};

export const deleteCategory = async (categoryId: string) => {
  await api.delete(`/budget/categories/${categoryId}`);
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