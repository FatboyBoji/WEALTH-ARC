import express from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
const dashboardController = new DashboardController();

// Transaction routes
router.get('/transactions/recent', authenticateToken, (req, res) => dashboardController.getRecentTransactions(req, res));
router.put('/transactions/:transactionId', authenticateToken, (req, res) => dashboardController.updateTransaction(req, res));

// Account summary route
router.get('/account/summary', authenticateToken, (req, res) => dashboardController.getAccountSummary(req, res));

// Insights route
router.get('/insights', authenticateToken, (req, res) => dashboardController.getInsights(req, res));

export default router; 