import express from 'express';
import { StatisticsController } from '../controllers/StatisticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
const statisticsController = new StatisticsController();

// Income-expenses chart data
router.get('/income-expenses/:period', authenticateToken, (req, res) => 
  statisticsController.getIncomeExpensesChart(req, res)
);

// Category breakdown data
router.get('/categories/:period', authenticateToken, (req, res) => 
  statisticsController.getCategoryBreakdown(req, res)
);

// Recurring expenses data
router.get('/recurring/:period', authenticateToken, (req, res) => 
  statisticsController.getRecurringExpenses(req, res)
);

// Monthly summaries data
router.get('/summaries', authenticateToken, (req, res) => 
  statisticsController.getMonthlySummaries(req, res)
);

// Monthly overview data
router.get('/overview', authenticateToken, (req, res) => 
  statisticsController.getMonthlyOverview(req, res)
);

export default router; 