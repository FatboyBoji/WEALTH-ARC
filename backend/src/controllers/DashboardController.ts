import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // Get recent transactions
  async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await this.dashboardService.getRecentTransactions(req.user.userId, limit);
      
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent transactions'
      });
    }
  }

  // Update transaction
  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      const transactionId = req.params.id;
      const transactionData = req.body;
      
      console.log('Controller received update request for:', transactionId);
      console.log('With data:', transactionData);
      
      const updatedTransaction = await this.dashboardService.updateTransaction(
        req.user.userId, 
        transactionId, 
        transactionData
      );
      
      res.status(200).json({
        success: true,
        data: updatedTransaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction'
      });
    }
  }

  // Get account summary
  async getAccountSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const summary = await this.dashboardService.getAccountSummary(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting account summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get account summary'
      });
    }
  }

  // Get insights
  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const insights = await this.dashboardService.getInsights(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error getting insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get insights'
      });
    }
  }
} 