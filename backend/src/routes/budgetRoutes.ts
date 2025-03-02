import express from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
const budgetController = new BudgetController();

// Category routes
router.get('/categories', authenticateToken, (req, res) => budgetController.getCategories(req, res));
router.post('/categories', authenticateToken, (req, res) => budgetController.createCategory(req, res));
router.patch('/categories/:categoryId/visibility', authenticateToken, (req, res) => budgetController.updateCategoryVisibility(req, res));
router.delete('/categories/:categoryId', authenticateToken, (req, res) => budgetController.deleteCategory(req, res));

// Budget item routes
router.get('/items', authenticateToken, (req, res) => budgetController.getBudgetItems(req, res));
router.post('/items', authenticateToken, (req, res) => budgetController.createBudgetItem(req, res));
router.patch('/items/:itemId', authenticateToken, (req, res) => budgetController.updateBudgetItem(req, res));
router.delete('/items/:itemId', authenticateToken, (req, res) => budgetController.deleteBudgetItem(req, res));

// Budget summary route
router.get('/summary', authenticateToken, (req, res) => budgetController.getBudgetSummary(req, res));

// Delete a category
router.delete('/categories/:id', authenticateToken, (req, res) => 
  budgetController.deleteCategory(req, res)
);

// Update category visibility
router.patch('/categories/:id/visibility', authenticateToken, (req, res) => 
  budgetController.updateCategoryVisibility(req, res)
);

// Update category name
router.patch('/categories/:id/name', authenticateToken, (req, res) => 
  budgetController.updateCategoryName(req, res)
);

export default router; 